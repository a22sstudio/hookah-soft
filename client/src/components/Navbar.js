import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Chip,
    Tooltip,
    Divider,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Иконки
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Контекст
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();

    // Определение активной страницы
    const isActive = (path) => location.pathname === path;

    // Получение цвета роли
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

    // Получение названия роли
    const getRoleName = (role) => {
        switch (role) {
            case 'admin':
                return 'Админ';
            case 'master':
                return 'Мастер';
            default:
                return role;
        }
    };

    // Обработчик выхода
    const handleLogout = () => {
        logout();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* ========== ЛОГОТИП ========== */}
                <LocalFireDepartmentIcon
                    sx={{
                        mr: 1,
                        color: 'primary.main',
                        fontSize: 32,
                    }}
                />
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 0,
                        mr: 4,
                        fontWeight: 600,
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    Hookah Manager
                </Typography>

                {/* ========== НАВИГАЦИЯ ========== */}
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    {/* Склад - доступен всем */}
                    <Button
                        component={Link}
                        to="/"
                        color="inherit"
                        variant={isActive('/') ? 'outlined' : 'text'}
                        startIcon={<InventoryIcon />}
                        sx={{
                            borderColor: isActive('/') ? 'primary.main' : 'transparent',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(0, 174, 239, 0.1)',
                            },
                        }}
                    >
                        Склад
                    </Button>

                    {/* История - доступна всем */}
                    <Button
                        component={Link}
                        to="/history"
                        color="inherit"
                        variant={isActive('/history') ? 'outlined' : 'text'}
                        startIcon={<HistoryIcon />}
                        sx={{
                            borderColor: isActive('/history') ? 'primary.main' : 'transparent',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(0, 174, 239, 0.1)',
                            },
                        }}
                    >
                        История
                    </Button>

                    {/* ========== УПРАВЛЕНИЕ - ТОЛЬКО ДЛЯ АДМИНОВ ========== */}
                    {user?.role === 'admin' && (
                        <Button
                            component={Link}
                            to="/management"
                            color="inherit"
                            variant={isActive('/management') ? 'outlined' : 'text'}
                            startIcon={<AdminPanelSettingsIcon />}
                            sx={{
                                borderColor: isActive('/management') ? 'error.main' : 'transparent',
                                color: isActive('/management') ? 'error.main' : 'inherit',
                                '&:hover': {
                                    borderColor: 'error.main',
                                    bgcolor: 'rgba(248, 81, 73, 0.1)',
                                },
                            }}
                        >
                            Управление
                        </Button>
                    )}
                </Box>

                {/* ========== ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ ========== */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Имя и роль */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <AccountCircleIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {user?.name}
                            </Typography>
                            <Chip
                                label={getRoleName(user?.role)}
                                size="small"
                                color={getRoleColor(user?.role)}
                                sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Разделитель */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            borderColor: 'rgba(255,255,255,0.1)',
                            display: { xs: 'none', md: 'block' },
                        }}
                    />

                    {/* Кнопка выхода */}
                    <Tooltip title="Выйти">
                        <IconButton
                            onClick={handleLogout}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'error.main',
                                    bgcolor: 'rgba(248, 81, 73, 0.1)',
                                },
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
