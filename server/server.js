// ============================================
// Импорт зависимостей
// ============================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
// JWT Конфигурация
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'hookah-manager-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// ============================================
// MIDDLEWARE: Проверка JWT токена
// ============================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Токен истёк' });
            }
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        
        req.user = decoded;
        next();
    });
};

// ============================================
// HEALTH CHECK ENDPOINTS
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

// ============================================
// AUTH ENDPOINTS
// ============================================

// POST /api/auth/login - Вход по ПИН-коду (с bcrypt)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { pin } = req.body;
        
        // Валидация
        if (!pin) {
            return res.status(400).json({ error: 'ПИН-код обязателен' });
        }
        
        if (!/^\d{4,6}$/.test(pin)) {
            return res.status(400).json({ error: 'ПИН-код должен содержать 4-6 цифр' });
        }
        
        // Получаем всех активных пользователей с хэшированным PIN
        const usersResult = await pool.query(
            'SELECT id, name, pin_hash, role FROM users WHERE is_active = true'
        );
        const users = usersResult.rows;
        
        // Ищем пользователя с совпадающим ПИН-кодом
        let foundUser = null;
        
        for (const user of users) {
            // Если pin_hash существует, сравниваем через bcrypt
            if (user.pin_hash) {
                const isMatch = await bcrypt.compare(pin, user.pin_hash);
                if (isMatch) {
                    foundUser = user;
                    break;
                }
            }
        }
        
        // Если не нашли через bcrypt, пробуем прямое сравнение с pin_hash
        if (!foundUser) {
            const directResult = await pool.query(
                'SELECT id, name, role FROM users WHERE pin_hash = $1 AND is_active = true',
                [pin]
            );
            if (directResult.rows.length > 0) {
                foundUser = directResult.rows[0];
            }
        }
        
        if (!foundUser) {
            // Добавляем задержку для защиты от брутфорса
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(401).json({ error: 'Неверный ПИН-код' });
        }
        
        // Генерируем JWT токен
        const token = jwt.sign(
            {
                userId: foundUser.id,
                name: foundUser.name,
                role: foundUser.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        // Обновляем время последнего входа
        await pool.query(
            'UPDATE users SET updated_at = NOW() WHERE id = $1',
            [foundUser.id]
        );
        
        // Логируем успешный вход
        console.log(`✅ Пользователь "${foundUser.name}" (ID: ${foundUser.id}) вошёл в систему`);
        
        // Отправляем ответ
        res.json({
            success: true,
            token,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                role: foundUser.role,
            },
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// POST /api/auth/logout - Выход
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    console.log(`👋 Пользователь "${req.user.name}" вышел из системы`);
    res.json({ success: true, message: 'Выход выполнен успешно' });
});

// GET /api/auth/me - Получение текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, role, is_active FROM users WHERE id = $1',
            [req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            return res.status(403).json({ error: 'Аккаунт деактивирован' });
        }
        
        res.json({
            id: user.id,
            name: user.name,
            role: user.role,
        });
        
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// POST /api/auth/verify - Проверка токена
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.userId,
            name: req.user.name,
            role: req.user.role,
        },
    });
});

// ============================================
// USERS ENDPOINTS
// ============================================

// GET /api/users - Получить всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
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
            'SELECT id, name, role, is_active, created_at FROM users WHERE id = $1',
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
        const { name, pin, role = 'user' } = req.body;

        // Валидация
        if (!name || !pin) {
            return res.status(400).json({ error: 'Имя и ПИН-код обязательны' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ error: 'Имя должно содержать минимум 2 символа' });
        }
        if (!/^\d{4,6}$/.test(pin)) {
            return res.status(400).json({ error: 'ПИН-код должен состоять из 4-6 цифр' });
        }

        // Проверка уникальности имени
        const existingName = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1)', [name.trim()]);
        if (existingName.rows.length > 0) {
            return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
        }

        // Хэшируем PIN-код
        const pinHash = await bcrypt.hash(pin, 10);
        
        // Проверка уникальности PIN-хэша
        // (Делаем после хэширования, чтобы не сравнивать открытые пины)
        const allUsers = await pool.query('SELECT id, pin_hash FROM users');
        for(const user of allUsers.rows) {
            if (user.pin_hash && await bcrypt.compare(pin, user.pin_hash)) {
                 return res.status(409).json({ error: 'Этот ПИН-код уже используется другим пользователем' });
            }
        }

        // Создаём пользователя
        const result = await pool.query(
            `INSERT INTO users (name, pin_hash, role) 
             VALUES ($1, $2, $3) 
             RETURNING id, name, role, is_active, created_at`,
            [name.trim(), pinHash, role]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0],
        });

    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// PUT /api/users/:id - Обновить пользователя
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pin, role } = req.body;

        if (!name && !pin && !role) {
            return res.status(400).json({ error: 'Необходимо передать хотя бы одно поле для обновления' });
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name.trim());
        }
        
        if (pin) {
            if (!/^\d{4,6}$/.test(pin)) {
                return res.status(400).json({ error: 'ПИН-код должен состоять из 4-6 цифр' });
            }
            const pinHash = await bcrypt.hash(pin, 10);
            updates.push(`pin_hash = $${paramIndex++}`);
            values.push(pinHash);
        }

        if (role) {
            updates.push(`role = $${paramIndex++}`);
            values.push(role);
        }

        updates.push(`updated_at = NOW()`);
        
        values.push(id);

        const result = await pool.query(
            `UPDATE users 
             SET ${updates.join(', ')} 
             WHERE id = $${paramIndex} 
             RETURNING id, name, role, is_active, updated_at`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            success: true,
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PUT /api/users/:id/pin - Изменить ПИН-код пользователя
app.put('/api/users/:id/pin', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { pin } = req.body;
        
        if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        
        if (!/^\d{4,6}$/.test(pin)) {
            return res.status(400).json({ error: 'ПИН-код должен содержать 4-6 цифр' });
        }
        
        const pinHash = await bcrypt.hash(pin, 10);
        
        await pool.query(
            'UPDATE users SET pin_hash = $1, updated_at = NOW() WHERE id = $2',
            [pinHash, id]
        );
        
        res.json({ success: true, message: 'ПИН-код обновлён' });
        
    } catch (error) {
        console.error('Ошибка обновления ПИН-кода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// DELETE /api/users/:id - Удалить/деактивировать пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка существования пользователя
        const userExists = await pool.query(
            'SELECT id, name, role FROM users WHERE id = $1',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const userToDelete = userExists.rows[0];

        // Проверка: нельзя удалить последнего админа
        if (userToDelete.role === 'admin') {
            const adminCount = await pool.query(
                "SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true"
            );
            
            if (parseInt(adminCount.rows[0].count) <= 1) {
                return res.status(400).json({ 
                    error: 'Нельзя удалить последнего администратора' 
                });
            }
        }

        // Деактивируем пользователя (soft delete)
        await pool.query(
            'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: `Пользователь "${userToDelete.name}" деактивирован`,
        });
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// TOBACCOS ENDPOINTS
// ============================================

// GET /api/tobaccos - Получение списка всех табаков
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

// POST /api/tobaccos - Добавить новый табак
app.post('/api/tobaccos', async (req, res) => {
    try {
        const {
            brand,
            name,
            line,
            strength,
            currentWeight,
            thresholdWeight,
            pricePerGram
        } = req.body;

        console.log('POST /api/tobaccos - Полученные данные:', {
            brand, name, line, strength, currentWeight, thresholdWeight, pricePerGram
        });

        // Валидация обязательных полей
        if (!brand || !name) {
            return res.status(400).json({
                error: 'Обязательные поля: brand, name'
            });
        }

        if (brand.trim().length < 2) {
            return res.status(400).json({
                error: 'Название бренда должно содержать минимум 2 символа'
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                error: 'Название вкуса должно содержать минимум 2 символа'
            });
        }

        // Валидация крепости (число 1-10)
        let parsedStrength = null;
        if (strength !== null && strength !== undefined && strength !== '') {
            parsedStrength = parseInt(strength, 10);
            if (isNaN(parsedStrength) || parsedStrength < 1 || parsedStrength > 10) {
                return res.status(400).json({
                    error: 'Крепость должна быть числом от 1 до 10'
                });
            }
        }

        // Валидация числовых полей
        const parsedCurrentWeight = parseInt(currentWeight) || 0;
        const parsedThresholdWeight = parseInt(thresholdWeight) || 50;
        const parsedPricePerGram = parseFloat(pricePerGram) || 0;

        if (parsedCurrentWeight < 0 || parsedThresholdWeight < 0 || parsedPricePerGram < 0) {
            return res.status(400).json({
                error: 'Числовые значения не могут быть отрицательными'
            });
        }

        // Проверка на дубликат
        const existingTobacco = await pool.query(
            `SELECT id FROM tobaccos 
             WHERE LOWER(brand) = LOWER($1) 
             AND LOWER(name) = LOWER($2)
             AND (LOWER(line) = LOWER($3) OR (line IS NULL AND $3 IS NULL))`,
            [brand.trim(), name.trim(), line?.trim() || null]
        );

        if (existingTobacco.rows.length > 0) {
            return res.status(409).json({
                error: 'Такой табак уже существует на складе'
            });
        }

        // Создание записи в базе данных
        const result = await pool.query(
            `INSERT INTO tobaccos (
                brand, name, line, strength,
                current_weight, threshold_weight, price_per_gram
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, brand, name, line, strength,
                      current_weight, threshold_weight, price_per_gram`,
            [
                brand.trim(),
                name.trim(),
                line?.trim() || null,
                parsedStrength,
                parsedCurrentWeight,
                parsedThresholdWeight,
                parsedPricePerGram
            ]
        );

        console.log('Табак добавлен:', result.rows[0]);

        res.status(201).json({
            success: true,
            tobacco: result.rows[0]
        });

    } catch (error) {
        console.error('Ошибка при добавлении табака:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Такой табак уже существует'
            });
        }

        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PUT /api/tobaccos/:id/restock - Пополнение склада
app.put('/api/tobaccos/:id/restock', async (req, res) => {
    try {
        const { id } = req.params;
        const { gramsAdded, totalCost } = req.body;

        console.log(`\n========== RESTOCK REQUEST ==========`);
        console.log(`Tobacco ID: ${id}`);
        console.log(`Raw input - gramsAdded: ${gramsAdded}, totalCost: ${totalCost}`);

        // Валидация входных данных
        if (gramsAdded === undefined || gramsAdded === null) {
            return res.status(400).json({
                error: 'Необходимо указать количество грамм (gramsAdded)'
            });
        }

        if (totalCost === undefined || totalCost === null) {
            return res.status(400).json({
                error: 'Необходимо указать общую стоимость (totalCost)'
            });
        }

        const parsedGramsAdded = parseFloat(gramsAdded);
        const parsedTotalCost = parseFloat(totalCost);

        if (isNaN(parsedGramsAdded) || parsedGramsAdded <= 0) {
            return res.status(400).json({
                error: 'Количество грамм должно быть положительным числом'
            });
        }

        if (isNaN(parsedTotalCost) || parsedTotalCost < 0) {
            return res.status(400).json({
                error: 'Стоимость не может быть отрицательной'
            });
        }

        // Получение текущих данных табака
        const currentData = await pool.query(
            'SELECT id, brand, name, line, current_weight, price_per_gram FROM tobaccos WHERE id = $1',
            [id]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                error: 'Табак не найден'
            });
        }

        const tobacco = currentData.rows[0];
        const currentWeight = parseFloat(tobacco.current_weight) || 0;
        const currentPricePerGram = parseFloat(tobacco.price_per_gram) || 0;

        // Расчёт средневзвешенной цены
        const oldTotalValue = currentWeight * currentPricePerGram;
        const newTotalWeight = currentWeight + parsedGramsAdded;
        const newTotalValue = oldTotalValue + parsedTotalCost;
        const newPricePerGram = newTotalWeight > 0 
            ? parseFloat((newTotalValue / newTotalWeight).toFixed(4))
            : 0;

        console.log(`Old: ${currentWeight}g × ${currentPricePerGram}₽/g = ${oldTotalValue}₽`);
        console.log(`Add: ${parsedGramsAdded}g for ${parsedTotalCost}₽`);
        console.log(`New: ${newTotalWeight}g × ${newPricePerGram}₽/g`);

        // Обновление в базе данных
        const result = await pool.query(
            `UPDATE tobaccos 
             SET current_weight = $1, price_per_gram = $2
             WHERE id = $3
             RETURNING id, brand, name, line, strength,
                       current_weight, threshold_weight, price_per_gram`,
            [newTotalWeight, newPricePerGram, id]
        );

        console.log(`✅ Tobacco "${tobacco.brand} - ${tobacco.name}" restocked successfully\n`);

        res.json({
            success: true,
            message: `Добавлено ${parsedGramsAdded} гр на сумму ${parsedTotalCost} ₽`,
            tobacco: result.rows[0],
            calculation: {
                previousWeight: currentWeight,
                previousPricePerGram: currentPricePerGram,
                previousTotalValue: oldTotalValue,
                gramsAdded: parsedGramsAdded,
                costAdded: parsedTotalCost,
                pricePerGramAdded: parseFloat((parsedTotalCost / parsedGramsAdded).toFixed(4)),
                newWeight: newTotalWeight,
                newTotalValue: newTotalValue,
                newPricePerGram: newPricePerGram
            }
        });

    } catch (error) {
        console.error('❌ Ошибка при пополнении склада:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// PATCH /api/tobaccos/:id/inventory - Ручная корректировка остатков
app.patch('/api/tobaccos/:id/inventory', async (req, res) => {
    try {
        const { id } = req.params;
        const { newWeight } = req.body;

        console.log(`\n========== INVENTORY ADJUSTMENT ==========`);
        console.log(`Tobacco ID: ${id}, New weight: ${newWeight}`);

        if (newWeight === undefined || newWeight === null) {
            return res.status(400).json({
                error: 'Необходимо указать новый вес (newWeight)'
            });
        }

        const parsedNewWeight = parseFloat(newWeight);

        if (isNaN(parsedNewWeight) || parsedNewWeight < 0) {
            return res.status(400).json({
                error: 'Вес должен быть неотрицательным числом'
            });
        }

        // Проверка существования табака
        const currentData = await pool.query(
            'SELECT id, brand, name, line, current_weight FROM tobaccos WHERE id = $1',
            [id]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                error: 'Табак не найден'
            });
        }

        const tobacco = currentData.rows[0];
        const previousWeight = parseFloat(tobacco.current_weight) || 0;
        const difference = parsedNewWeight - previousWeight;

        // Обновление в базе данных
        const result = await pool.query(
            `UPDATE tobaccos 
             SET current_weight = $1
             WHERE id = $2
             RETURNING id, brand, name, line, strength,
                       current_weight, threshold_weight, price_per_gram`,
            [parsedNewWeight, id]
        );

        console.log(`✅ Inventory adjusted for "${tobacco.brand} - ${tobacco.name}"\n`);

        res.json({
            success: true,
            message: `Остаток скорректирован: ${previousWeight} → ${parsedNewWeight} гр`,
            tobacco: result.rows[0],
            adjustment: {
                previousWeight,
                newWeight: parsedNewWeight,
                difference
            }
        });

    } catch (error) {
        console.error('❌ Ошибка при корректировке остатков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// SESSIONS ENDPOINTS
// ============================================

// POST /api/sessions - Создание кальянной сессии (забивки)
app.post('/api/sessions', async (req, res) => {
    const client = await pool.connect();

    try {
        const { mix, userId } = req.body;

        console.log('\n========== CREATE SESSION ==========');
        console.log('User ID:', userId);
        console.log('Mix:', JSON.stringify(mix, null, 2));

        // Валидация входных данных
        if (!mix || !Array.isArray(mix) || mix.length === 0) {
            return res.status(400).json({
                error: 'Необходимо указать микс (массив табаков)'
            });
        }

        if (!userId) {
            return res.status(400).json({
                error: 'Необходимо указать пользователя (userId)'
            });
        }

        // Валидация элементов микса
        for (const item of mix) {
            if (!item.id || !item.grams) {
                return res.status(400).json({
                    error: 'Каждый элемент микса должен содержать id и grams'
                });
            }

            const grams = parseFloat(item.grams);
            if (isNaN(grams) || grams <= 0) {
                return res.status(400).json({
                    error: `Некорректное количество грамм для табака ID ${item.id}`
                });
            }
        }

        // НАЧАЛО ТРАНЗАКЦИИ
        await client.query('BEGIN');

        // Шаг 1: Получить данные табаков и проверить остатки
        const tobaccoIds = mix.map((item) => item.id);
        const tobaccosResult = await client.query(
            `SELECT id, brand, name, line, current_weight, price_per_gram 
             FROM tobaccos WHERE id = ANY($1)`,
            [tobaccoIds]
        );

        const tobaccosMap = {};
        tobaccosResult.rows.forEach((t) => {
            tobaccosMap[t.id] = t;
        });

        // Проверяем, что все табаки найдены
        for (const item of mix) {
            if (!tobaccosMap[item.id]) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    error: `Табак с ID ${item.id} не найден`
                });
            }
        }

        // Проверяем достаточность остатков
        for (const item of mix) {
            const tobacco = tobaccosMap[item.id];
            const grams = parseFloat(item.grams);
            const currentWeight = parseFloat(tobacco.current_weight) || 0;

            if (grams > currentWeight) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: `Недостаточно табака "${tobacco.brand} - ${tobacco.name}". Остаток: ${currentWeight}г, требуется: ${grams}г`
                });
            }
        }

        // Шаг 2: Рассчитать общую себестоимость
        let totalCost = 0;
        const itemsDetails = [];

        for (const item of mix) {
            const tobacco = tobaccosMap[item.id];
            const grams = parseFloat(item.grams);
            const pricePerGram = parseFloat(tobacco.price_per_gram) || 0;
            const itemCost = grams * pricePerGram;

            totalCost += itemCost;

            itemsDetails.push({
                tobaccoId: item.id,
                name: tobacco.line 
                    ? `${tobacco.brand} ${tobacco.line} - ${tobacco.name}`
                    : `${tobacco.brand} - ${tobacco.name}`,
                grams,
                pricePerGram,
                cost: parseFloat(itemCost.toFixed(2))
            });
        }

        totalCost = parseFloat(totalCost.toFixed(2));

        // Шаг 3: Создать сессию
        const sessionResult = await client.query(
            `INSERT INTO hookah_sessions (user_id, total_cost, created_at) 
             VALUES ($1, $2, NOW()) 
             RETURNING id, user_id, total_cost, created_at`,
            [userId, totalCost]
        );

        const session = sessionResult.rows[0];

        // Шаг 4: Добавить элементы сессии
        for (const item of mix) {
            const grams = parseFloat(item.grams);

            await client.query(
                `INSERT INTO session_items (session_id, tobacco_id, grams_used) 
                 VALUES ($1, $2, $3)`,
                [session.id, item.id, grams]
            );
        }

        // Шаг 5: Списать табак со склада
        for (const item of mix) {
            const grams = parseFloat(item.grams);

            await client.query(
                `UPDATE tobaccos 
                 SET current_weight = current_weight - $1 
                 WHERE id = $2`,
                [grams, item.id]
            );
        }

        // ЗАВЕРШЕНИЕ ТРАНЗАКЦИИ
        await client.query('COMMIT');
        console.log('Transaction committed successfully\n');

        res.status(201).json({
            success: true,
            message: 'Забивка успешно создана',
            session: {
                id: session.id,
                userId: session.user_id,
                totalCost: parseFloat(session.total_cost),
                createdAt: session.created_at,
                items: itemsDetails
            },
            summary: {
                totalGrams: itemsDetails.reduce((sum, item) => sum + item.grams, 0),
                totalCost,
                itemsCount: itemsDetails.length
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction rolled back due to error:', error);

        res.status(500).json({
            error: 'Ошибка при создании забивки',
            details: error.message
        });

    } finally {
        client.release();
    }
});

// GET /api/sessions - Получить историю забивок
app.get('/api/sessions', async (req, res) => {
    try {
        const { limit = 50, offset = 0, userId } = req.query;

        const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        const parsedOffset = Math.max(parseInt(offset) || 0, 0);

        let query = `
            SELECT 
                hs.id,
                hs.created_at,
                hs.total_cost,
                u.name AS user_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'tobacco_id', t.id,
                            'tobacco_name', 
                                CASE 
                                    WHEN t.line IS NOT NULL AND t.line != '' 
                                    THEN CONCAT(t.brand, ' ', t.line, ' - ', t.name)
                                    ELSE CONCAT(t.brand, ' - ', t.name)
                                END,
                            'brand', t.brand,
                            'line', t.line,
                            'flavor', t.name,
                            'grams_used', si.grams_used,
                            'strength', t.strength,
                            'price_per_gram', t.price_per_gram
                        )
                        ORDER BY si.id
                    ) FILTER (WHERE si.id IS NOT NULL),
                    '[]'::json
                ) AS mix
            FROM hookah_sessions hs
            LEFT JOIN users u ON hs.user_id = u.id
            LEFT JOIN session_items si ON hs.id = si.session_id
            LEFT JOIN tobaccos t ON si.tobacco_id = t.id
        `;

        const queryParams = [];
        let paramIndex = 1;

        if (userId) {
            query += ` WHERE hs.user_id = $${paramIndex}`;
            queryParams.push(parseInt(userId));
            paramIndex++;
        }

        query += `
            GROUP BY hs.id, hs.created_at, hs.total_cost, u.name
            ORDER BY hs.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        queryParams.push(parsedLimit, parsedOffset);

        const result = await pool.query(query, queryParams);

        const sessions = result.rows.map(row => ({
            id: row.id,
            user_name: row.user_name || 'Неизвестный',
            created_at: row.created_at,
            total_cost: row.total_cost,
            mix: row.mix || [],
            total_grams: (row.mix || []).reduce((sum, item) => 
                sum + (parseFloat(item.grams_used) || 0), 0
            )
        }));

        // Получаем общее количество для пагинации
        let countQuery = 'SELECT COUNT(*) FROM hookah_sessions';
        const countParams = [];

        if (userId) {
            countQuery += ' WHERE user_id = $1';
            countParams.push(parseInt(userId));
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            sessions,
            pagination: {
                total,
                limit: parsedLimit,
                offset: parsedOffset,
                hasMore: parsedOffset + sessions.length < total
            }
        });

    } catch (error) {
        console.error('❌ Ошибка при получении истории сессий:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера',
            details: error.message 
        });
    }
});

// DELETE /api/sessions/:id - Отмена забивки с возвратом табака
app.delete('/api/sessions/:id', async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        console.log('\n========== DELETE SESSION ==========');
        console.log(`Session ID: ${id}`);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                error: 'Некорректный ID сессии'
            });
        }

        // НАЧАЛО ТРАНЗАКЦИИ
        await client.query('BEGIN');

        // Шаг 1: Проверить существование сессии
        const sessionResult = await client.query(
            'SELECT id, total_cost, created_at FROM hookah_sessions WHERE id = $1',
            [id]
        );

        if (sessionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: 'Забивка не найдена'
            });
        }

        const session = sessionResult.rows[0];

        // Шаг 2: Получить состав забивки
        const itemsResult = await client.query(
            `SELECT 
                si.tobacco_id, 
                si.grams_used,
                t.brand,
                t.name,
                t.line
             FROM session_items si
             LEFT JOIN tobaccos t ON si.tobacco_id = t.id
             WHERE si.session_id = $1`,
            [id]
        );

        const items = itemsResult.rows;

        // Шаг 3: Вернуть табак на склад
        for (const item of items) {
            if (item.tobacco_id) {
                const grams = parseFloat(item.grams_used);

                await client.query(
                    `UPDATE tobaccos 
                     SET current_weight = current_weight + $1 
                     WHERE id = $2`,
                    [grams, item.tobacco_id]
                );
            }
        }

        // Шаг 4: Удалить элементы сессии
        await client.query(
            'DELETE FROM session_items WHERE session_id = $1',
            [id]
        );

        // Шаг 5: Удалить сессию
        await client.query(
            'DELETE FROM hookah_sessions WHERE id = $1',
            [id]
        );

        // ЗАВЕРШЕНИЕ ТРАНЗАКЦИИ
        await client.query('COMMIT');
        console.log('Transaction committed successfully\n');

        const restoredItems = items.map(item => ({
            tobaccoId: item.tobacco_id,
            name: item.line
                ? `${item.brand} ${item.line} - ${item.name}`
                : `${item.brand} - ${item.name}`,
            gramsRestored: parseFloat(item.grams_used)
        }));

        res.json({
            success: true,
            message: 'Забивка удалена, табак возвращён на склад',
            deletedSession: {
                id: parseInt(id),
                totalCost: parseFloat(session.total_cost),
                createdAt: session.created_at
            },
            restoredItems,
            totalGramsRestored: restoredItems.reduce((sum, item) => sum + item.gramsRestored, 0)
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction rolled back due to error:', error);

        res.status(500).json({
            error: 'Ошибка при удалении забивки',
            details: error.message
        });

    } finally {
        client.release();
    }
});

// POST /api/consumption - Запись расхода табака (legacy endpoint)
app.post('/api/consumption', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Необходимо передать массив items' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const sessionResult = await client.query(
            `INSERT INTO hookah_sessions (user_id, table_number) 
             VALUES ($1, $2) 
             RETURNING id`,
            [1, 'N/A']
        );
        const sessionId = sessionResult.rows[0].id;

        for (const item of items) {
            const { tobaccoId, grams } = item;

            await client.query(
                `INSERT INTO session_items (session_id, tobacco_id, grams_used) 
                 VALUES ($1, $2, $3)`,
                [sessionId, tobaccoId, grams]
            );

            await client.query(
                `UPDATE tobaccos 
                 SET current_weight = current_weight - $1 
                 WHERE id = $2`,
                [grams, tobaccoId]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Расход успешно записан',
            sessionId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при записи расхода:', error);
        res.status(500).json({ error: 'Ошибка при записи расхода' });

    } finally {
        client.release();
    }
});

// ============================================
// HISTORY ENDPOINT
// ============================================

// GET /api/history - Получение истории забивок
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
            LEFT JOIN users u ON hs.user_id = u.id
            ORDER BY hs.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении истории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============================================
// DASHBOARD ENDPOINT
// ============================================

// GET /api/dashboard/summary - Ключевые показатели для дашборда
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        console.log('\n========== DASHBOARD SUMMARY ==========');

        const [stockValueResult, positionsResult, lowStockResult] = await Promise.all([
            pool.query(`
                SELECT COALESCE(SUM(current_weight * price_per_gram), 0) AS total_value
                FROM tobaccos
                WHERE current_weight > 0
            `),
            
            pool.query(`
                SELECT COUNT(*) AS total_positions
                FROM tobaccos
            `),
            
            pool.query(`
                SELECT COUNT(*) AS low_stock_count
                FROM tobaccos
                WHERE current_weight <= threshold_weight
                AND current_weight > 0
            `)
        ]);

        const summary = {
            totalStockValue: parseFloat(stockValueResult.rows[0].total_value) || 0,
            totalPositions: parseInt(positionsResult.rows[0].total_positions) || 0,
            lowStockItemsCount: parseInt(lowStockResult.rows[0].low_stock_count) || 0
        };

        console.log('Summary:', summary);
        console.log('========================================\n');

        res.json(summary);

    } catch (error) {
        console.error('❌ Ошибка при получении сводки:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера',
            details: error.message 
        });
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
