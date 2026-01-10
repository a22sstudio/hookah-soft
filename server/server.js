// ============================================
// Импорт зависимостей
// ============================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Загрузка переменных окружения из .env файла
dotenv.config();

// ============================================
// Создание Express приложения
// ============================================
const app = express();

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// Подключение к PostgreSQL
// ============================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Проверка подключения к БД при старте
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✅ Подключение к PostgreSQL установлено');
    })
    .catch((err) => {
        console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
    });

// ============================================
// Роуты
// ============================================

// Тестовый эндпоинт для проверки работоспособности сервера
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Расширенный health-check с проверкой БД
app.get('/api/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: error.message
        });
    }
});

// Получение списка всех табаков
app.get('/api/tobaccos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tobaccos ORDER BY brand, name'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка табаков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение истории забивок
app.get('/api/history', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                hs.id AS session_id,
                hs.created_at,
                hs.table_number,
                u.name AS user_name,
                (
                    SELECT json_agg(
                        json_build_object(
                            'brand', t.brand,
                            'name', t.name,
                            'grams_used', si.grams_used
                        )
                    )
                    FROM session_items si
                    JOIN tobaccos t ON si.tobacco_id = t.id
                    WHERE si.session_id = hs.id
                ) AS mix,
                (
                    SELECT SUM(si.grams_used)
                    FROM session_items si
                    WHERE si.session_id = hs.id
                ) AS total_grams
            FROM hookah_sessions hs
            JOIN users u ON hs.user_id = u.id
            ORDER BY hs.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении истории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание нового табака
app.post('/api/tobaccos', async (req, res) => {
    try {
        const { brand, name, weight } = req.body;

        const result = await pool.query(
            'INSERT INTO tobaccos (brand, name, current_weight) VALUES ($1, $2, $3) RETURNING *',
            [brand, name, weight]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при создании табака:', error);

        // Проверка на дубликат (UNIQUE constraint violation)
        if (error.code === '23505') {
            res.status(409).json({ error: 'Табак с таким брендом и названием уже существует' });
        } else {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
});

// Запись расхода табака (с транзакцией)
app.post('/api/consumption', async (req, res) => {
    const { items } = req.body;

    // Проверка входных данных
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Необходимо передать массив items' });
    }

    // Получаем клиента из пула для транзакции
    const client = await pool.connect();

    try {
        // Начинаем транзакцию
        await client.query('BEGIN');

        // Шаг 1: Создаём сессию забивки
        const sessionResult = await client.query(
            `INSERT INTO hookah_sessions (user_id, table_number) 
             VALUES ($1, $2) 
             RETURNING id`,
            [1, 'N/A'] // Заглушки для user_id и table_number
        );
        const sessionId = sessionResult.rows[0].id;

        // Шаг 2: Обрабатываем каждый элемент микса
        for (const item of items) {
            const { tobaccoId, grams } = item;

            // Создаём запись в session_items
            await client.query(
                `INSERT INTO session_items (session_id, tobacco_id, grams_used) 
                 VALUES ($1, $2, $3)`,
                [sessionId, tobaccoId, grams]
            );

            // Обновляем остаток табака на складе
            await client.query(
                `UPDATE tobaccos 
                 SET current_weight = current_weight - $1 
                 WHERE id = $2`,
                [grams, tobaccoId]
            );
        }

        // Всё прошло успешно — фиксируем транзакцию
        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Расход успешно записан',
            sessionId: sessionId
        });

    } catch (error) {
        // Ошибка — откатываем все изменения
        await client.query('ROLLBACK');
        console.error('Ошибка при записи расхода:', error);
        res.status(500).json({ error: 'Ошибка при записи расхода' });

    } finally {
        // Обязательно освобождаем клиента обратно в пул
        client.release();
    }
});

// Аутентификация по PIN-коду
app.post('/api/auth/login', async (req, res) => {
    try {
        const { pinCode } = req.body;

        // Проверка наличия PIN-кода
        if (!pinCode) {
            return res.status(400).json({ 
                error: 'PIN-код обязателен' 
            });
        }

        // Поиск пользователя по PIN-коду
        const result = await pool.query(
            'SELECT id, name, role FROM users WHERE pin_code = $1',
            [pinCode]
        );

        // Проверка: найден ли пользователь
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Неверный PIN-код' 
            });
        }

        // Успешная аутентификация
        const user = result.rows[0];
        
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// CRUD для пользователей (Users)
// ============================================

// GET /api/users - Получить всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/users/:id - Получить одного пользователя по ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT id, name, role, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST /api/users - Создать нового пользователя
app.post('/api/users', async (req, res) => {
    try {
        // Извлекаем ТОЛЬКО нужные поля (без id!)
        const { name, pinCode, role } = req.body;

        // Для отладки - логируем что пришло
        console.log('POST /api/users - Полученные данные:', { name, pinCode: '****', role });

        // Валидация обязательных полей
        if (!name || !pinCode || !role) {
            return res.status(400).json({
                error: 'Все поля обязательны: name, pinCode, role'
            });
        }

        // Валидация имени
        if (name.trim().length < 2) {
            return res.status(400).json({
                error: 'Имя должно содержать минимум 2 символа'
            });
        }

        // Валидация PIN-кода (должен быть 4 цифры)
        if (!/^\d{4}$/.test(pinCode)) {
            return res.status(400).json({
                error: 'PIN-код должен состоять из 4 цифр'
            });
        }

        // Валидация роли
        const validRoles = ['admin', 'master'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Роль должна быть: admin или master'
            });
        }

        // Проверка уникальности PIN-кода
        const existingPin = await pool.query(
            'SELECT id FROM users WHERE pin_code = $1',
            [pinCode]
        );

        if (existingPin.rows.length > 0) {
            return res.status(409).json({
                error: 'Пользователь с таким PIN-кодом уже существует'
            });
        }

        // Проверка уникальности имени (опционально)
        const existingName = await pool.query(
            'SELECT id FROM users WHERE LOWER(name) = LOWER($1)',
            [name.trim()]
        );

        if (existingName.rows.length > 0) {
            return res.status(409).json({
                error: 'Пользователь с таким именем уже существует'
            });
        }

        // ВАЖНО: SQL без указания id - PostgreSQL сгенерирует его автоматически
        const result = await pool.query(
            `INSERT INTO users (name, pin_code, role) 
             VALUES ($1, $2, $3) 
             RETURNING id, name, role, created_at`,
            [name.trim(), pinCode, role]
        );

        console.log('Пользователь создан:', result.rows[0]);

        res.status(201).json({
            success: true,
            user: result.rows[0],
        });

    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        
        // Обработка специфичных ошибок PostgreSQL
        if (error.code === '23505') {
            // Ошибка уникальности (duplicate key)
            return res.status(409).json({
                error: 'Пользователь с такими данными уже существует'
            });
        }

        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PUT /api/users/:id - Обновить пользователя
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pinCode, role } = req.body;

        // Проверка существования пользователя
        const userExists = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Валидация: хотя бы одно поле должно быть передано
        if (!name && !pinCode && !role) {
            return res.status(400).json({ 
                error: 'Необходимо передать хотя бы одно поле для обновления' 
            });
        }

        // Валидация PIN-кода если передан
        if (pinCode && !/^\d{4}$/.test(pinCode)) {
            return res.status(400).json({ 
                error: 'PIN-код должен состоять из 4 цифр' 
            });
        }

        // Валидация роли если передана
        if (role) {
            const validRoles = ['admin', 'master'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ 
                    error: 'Роль должна быть: admin или master' 
                });
            }
        }

        // Проверка уникальности PIN-кода если он меняется
        if (pinCode) {
            const existingPin = await pool.query(
                'SELECT id FROM users WHERE pin_code = $1 AND id != $2',
                [pinCode, id]
            );

            if (existingPin.rows.length > 0) {
                return res.status(409).json({ 
                    error: 'Пользователь с таким PIN-кодом уже существует' 
                });
            }
        }

        // Динамическое построение запроса
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex}`);
            values.push(name);
            paramIndex++;
        }

        if (pinCode) {
            updates.push(`pin_code = $${paramIndex}`);
            values.push(pinCode);
            paramIndex++;
        }

        if (role) {
            updates.push(`role = $${paramIndex}`);
            values.push(role);
            paramIndex++;
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE users 
             SET ${updates.join(', ')} 
             WHERE id = $${paramIndex} 
             RETURNING id, name, role, created_at`,
            values
        );

        res.json({
            success: true,
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// DELETE /api/users/:id - Удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка существования пользователя
        const userExists = await pool.query(
            'SELECT id, name FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка: нельзя удалить последнего админа
        const adminCount = await pool.query(
            "SELECT COUNT(*) FROM users WHERE role = 'admin'"
        );
        
        const userToDelete = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [id]
        );

        if (userToDelete.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
            return res.status(400).json({ 
                error: 'Нельзя удалить последнего администратора' 
            });
        }

        // Удаление пользователя
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({
            success: true,
            message: `Пользователь "${userExists.rows[0].name}" удалён`,
        });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// Запуск сервера
// ============================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Экспорт pool для использования в других модулях
module.exports = { app, pool };
