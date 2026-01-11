import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Divider,
    Alert,
    LinearProgress,
    Tooltip,
    Fade,
} from '@mui/material';

// Иконки
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import PinIcon from '@mui/icons-material/Pin';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';

// Контекст
import { useAuth } from '../context/AuthContext';

// ============================================
// Начальное состояние формы (константа)
// ============================================
const INITIAL_FORM_STATE = {
    id: null,  // ВАЖНО: id = null для создания
    name: '',
    pinCode: '',
    role: 'master',
};

function ManagementPage() {
    // ============================================
    // Состояния
    // ============================================
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Состояние модального окна
    const [dialogOpen, setDialogOpen] = useState(false);
    
    // ИСПРАВЛЕНИЕ: Используем formData.id для определения режима
    // Если formData.id === null → создание
    // Если formData.id !== null → редактирование
    const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Состояние диалога подтверждения удаления
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { user: currentUser } = useAuth();

    // ============================================
    // Вычисляемое значение: режим диалога
    // ============================================
    const isEditMode = formData.id !== null;

    // ============================================
    // Загрузка пользователей
    // ============================================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
            setError('Не удалось загрузить список пользователей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ============================================
    // ИСПРАВЛЕНО: Открытие диалога для СОЗДАНИЯ
    // ============================================
    const handleOpenCreateDialog = () => {
        // Полный сброс формы к начальным значениям
        setFormData({ ...INITIAL_FORM_STATE });  // id = null
        setFormError('');
        setDialogOpen(true);
        
        // Для отладки
        console.log('Открыт диалог СОЗДАНИЯ, formData.id =', null);
    };

    // ============================================
    // ИСПРАВЛЕНО: Открытие диалога для РЕДАКТИРОВАНИЯ
    // ============================================
    const handleOpenEditDialog = (user) => {
        // Устанавливаем данные пользователя, включая id
        setFormData({
            id: user.id,  // ВАЖНО: устанавливаем id
            name: user.name,
            pinCode: '',  // PIN не показываем, только для изменения
            role: user.role,
        });
        setFormError('');
        setDialogOpen(true);
        
        // Для отладки
        console.log('Открыт диалог РЕДАКТИРОВАНИЯ, formData.id =', user.id);
    };

    // ============================================
    // Закрытие диалога
    // ============================================
    const handleCloseDialog = () => {
        setDialogOpen(false);
        // Сбрасываем форму при закрытии
        setFormData({ ...INITIAL_FORM_STATE });
        setFormError('');
    };

    // ============================================
    // Обработчик изменения формы
    // ============================================
    const handleFormChange = (field) => (event) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
        setFormError('');
    };

    // ============================================
    // ИСПРАВЛЕНО: Сохранение пользователя
    // ============================================
    const handleSaveUser = async () => {
        // Валидация
        if (!formData.name.trim()) {
            setFormError('Введите имя пользователя');
            return;
        }

        // PIN обязателен только при создании
        if (!isEditMode && !formData.pinCode) {
            setFormError('Введите PIN-код');
            return;
        }

        if (formData.pinCode && !/^\d{4}$/.test(formData.pinCode)) {
            setFormError('PIN-код должен состоять из 4 цифр');
            return;
        }

        setFormLoading(true);
        setFormError('');

        try {
            // ИСПРАВЛЕНО: Определяем URL и метод на основе formData.id
            const isCreating = formData.id === null;
            
            const url = isCreating
                ? 'http://localhost:3001/api/users'
                : `http://localhost:3001/api/users/${formData.id}`;

            const method = isCreating ? 'POST' : 'PUT';

            // Для отладки
            console.log(`${method} запрос на ${url}`);

            // Формируем тело запроса
            const body = {
                name: formData.name.trim(),
                role: formData.role,
            };

            // PIN добавляем только если он введён
            if (formData.pinCode) {
                body.pinCode = formData.pinCode;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(
                    isCreating
                        ? `Пользователь "${formData.name}" создан`
                        : `Пользователь "${formData.name}" обновлён`
                );
                handleCloseDialog();
                fetchUsers();

                // Убираем сообщение через 3 секунды
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setFormError(data.error || 'Произошла ошибка');
            }
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setFormError('Ошибка соединения с сервером');
        } finally {
            setFormLoading(false);
        }
    };

    // ============================================
    // Удаление пользователя
    // ============================================
    const handleOpenDeleteDialog = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleteLoading(true);

        try {
            const response = await fetch(
                `http://localhost:3001/api/users/${userToDelete.id}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Пользователь "${userToDelete.name}" удалён`);
                handleCloseDeleteDialog();
                fetchUsers();

                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Не удалось удалить пользователя');
                handleCloseDeleteDialog();

                setTimeout(() => setError(''), 5000);
            }
        } catch (err) {
            console.error('Ошибка удаления:', err);
            setError('Ошибка соединения с сервером');
            handleCloseDeleteDialog();
        } finally {
            setDeleteLoading(false);
        }
    };

    // ============================================
    // Вспомогательные функции
    // ============================================
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'master':
                return 'primary';
            default:
                return 'default';
        }
    };

    const getRoleName = (role) => {
        switch (role) {
            case 'admin':
                return 'Администратор';
            case 'master':
                return 'Мастер';
            default:
                return role;
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <SecurityIcon color="error" />;
            case 'master':
                return <PersonIcon color="primary" />;
            default:
                return <AccountCircleIcon />;
        }
    };

    // ============================================
    // Рендер компонента
    // ============================================
    return (
        <Container maxWidth="md">
            <Fade in timeout={500}>
                <Card>
                    <CardContent>
                        <Stack spacing={3}>
                            {/* Заголовок */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AdminPanelSettingsIcon color="error" fontSize="large" />
                                    <Typography variant="h5" fontWeight={600}>
                                        Управление пользователями
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    onClick={handleOpenCreateDialog}
                                >
                                    Добавить мастера
                                </Button>
                            </Box>

                            <Divider />

                            {/* Сообщения */}
                            {error && (
                                <Alert severity="error" onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert severity="success" onClose={() => setSuccess('')}>
                                    {success}
                                </Alert>
                            )}

                            {/* Загрузка */}
                            {loading && <LinearProgress />}

                            {/* Список пользователей */}
                            {!loading && users.length === 0 ? (
                                <Alert severity="info" icon={<AccountCircleIcon />}>
                                    Нет пользователей. Добавьте первого мастера!
                                </Alert>
                            ) : (
                                <List>
                                    {users.map((user, index) => (
                                        <Fade in timeout={300 + index * 100} key={user.id}>
                                            <ListItem
                                                sx={{
                                                    mb: 1,
                                                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor:
                                                        user.role === 'admin'
                                                            ? 'rgba(248, 81, 73, 0.3)'
                                                            : 'divider',
                                                }}
                                            >
                                                <ListItemIcon>
                                                    {getRoleIcon(user.role)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Typography fontWeight={500}>
                                                                {user.name}
                                                            </Typography>
                                                            {user.id === currentUser?.id && (
                                                                <Chip
                                                                    label="Это вы"
                                                                    size="small"
                                                                    color="success"
                                                                    variant="outlined"
                                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Chip
                                                            label={getRoleName(user.role)}
                                                            size="small"
                                                            color={getRoleColor(user.role)}
                                                            sx={{
                                                                mt: 0.5,
                                                                height: 22,
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Редактировать">
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() => handleOpenEditDialog(user)}
                                                                color="primary"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip
                                                            title={
                                                                user.id === currentUser?.id
                                                                    ? 'Нельзя удалить себя'
                                                                    : 'Удалить'
                                                            }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() => handleOpenDeleteDialog(user)}
                                                                    color="error"
                                                                    disabled={user.id === currentUser?.id}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </Fade>
                                    ))}
                                </List>
                            )}

                            {/* Статистика */}
                            {!loading && users.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'center',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Chip
                                        label={`Всего: ${users.length}`}
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`Админов: ${users.filter((u) => u.role === 'admin').length}`}
                                        color="error"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`Мастеров: ${users.filter((u) => u.role === 'master').length}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Fade>

            {/* ========== ДИАЛОГ СОЗДАНИЯ/РЕДАКТИРОВАНИЯ ========== */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isEditMode ? (
                            <EditIcon color="primary" />
                        ) : (
                            <PersonAddIcon color="primary" />
                        )}
                        {isEditMode
                            ? 'Редактировать пользователя'
                            : 'Добавить пользователя'}
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        
                        {/* Отладочная информация (можно удалить в продакшене) */}
                        {process.env.NODE_ENV === 'development' && (
                            <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                                Режим: {isEditMode ? `Редактирование (ID: ${formData.id})` : 'Создание'}
                            </Alert>
                        )}

                        {/* Имя */}
                        <TextField
                            label="Имя"
                            value={formData.name}
                            onChange={handleFormChange('name')}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                            }}
                        />

                        {/* PIN-код */}
                        <TextField
                            label={
                                isEditMode
                                    ? 'Новый PIN-код (оставьте пустым, чтобы не менять)'
                                    : 'PIN-код (4 цифры)'
                            }
                            value={formData.pinCode}
                            onChange={handleFormChange('pinCode')}
                            fullWidth
                            type="password"
                            inputProps={{ maxLength: 4 }}
                            required={!isEditMode}
                            InputProps={{
                                startAdornment: (
                                    <PinIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                            }}
                            helperText={
                                isEditMode 
                                    ? 'Оставьте пустым, если не хотите менять PIN' 
                                    : 'Введите 4 цифры'
                            }
                        />

                        {/* Роль */}
                        <FormControl fullWidth>
                            <InputLabel>Роль</InputLabel>
                            <Select
                                value={formData.role}
                                onChange={handleFormChange('role')}
                                label="Роль"
                            >
                                <MenuItem value="master">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="primary" />
                                        Мастер
                                    </Box>
                                </MenuItem>
                                <MenuItem value="admin">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SecurityIcon color="error" />
                                        Администратор
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        startIcon={<CloseIcon />}
                        disabled={formLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveUser}
                        startIcon={<SaveIcon />}
                        disabled={formLoading}
                    >
                        {formLoading
                            ? 'Сохранение...'
                            : isEditMode
                            ? 'Сохранить'
                            : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== ДИАЛОГ ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ========== */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon color="warning" />
                        Подтверждение удаления
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить пользователя{' '}
                        <strong>"{userToDelete?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Это действие нельзя отменить.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        disabled={deleteLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteUser}
                        startIcon={<DeleteIcon />}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Удаление...' : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default ManagementPage;
