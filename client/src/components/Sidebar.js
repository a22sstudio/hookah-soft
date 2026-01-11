import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Chip,
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';

// Иконки
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// ============================================
// ИМПОРТ КОНТЕКСТА АВТОРИЗАЦИИ
// ============================================
import { useAuth } from '../context/AuthContext';

// ============================================
// КОНСТАНТЫ
// ============================================
export const DRAWER_WIDTH = 260;
export const DRAWER_WIDTH_COLLAPSED = 72;

// ============================================
// КОНФИГУРАЦИЯ НАВИГАЦИИ
// ============================================
const mainNavItems = [
    { 
        path: '/dashboard', 
        label: 'Управление', 
        icon: DashboardIcon,
        description: 'Главная панель',
    },
    { 
        path: '/stock', 
        label: 'Склад', 
        icon: InventoryIcon,
        description: 'Управление табаком',
    },
    { 
        path: '/history', 
        label: 'История', 
        icon: HistoryIcon,
        description: 'Журнал забивок',
    },
];

const secondaryNavItems = [
    { 
        path: '/analytics', 
        label: 'Аналитика', 
        icon: BarChartIcon,
        description: 'Статистика и отчёты',
        badge: 'Скоро',
        disabled: true,
    },
    { 
        path: '/supplies', 
        label: 'Поставки', 
        icon: LocalShippingIcon,
        description: 'История поставок',
        badge: 'Скоро',
        disabled: true,
    },
];

const bottomNavItems = [
    { 
        path: '/users',
        label: 'Пользователи', 
        icon: PeopleIcon,
        description: 'Управление доступом',
    },
    { 
        path: '/settings',
        label: 'Настройки', 
        icon: SettingsIcon,
        description: 'Параметры системы',
    },
];

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Генерирует инициалы из имени пользователя
 * @param {string} name - Имя пользователя
 * @returns {string} - Инициалы (1-2 буквы)
 */
const getInitials = (name) => {
    if (!name) return '??';
    
    const words = name.trim().split(' ').filter(Boolean);
    
    if (words.length >= 2) {
        // Берём первые буквы первых двух слов
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    
    // Если одно слово — берём первые 2 буквы
    return name.slice(0, 2).toUpperCase();
};

/**
 * Преобразует роль в читаемый текст на русском
 * @param {string} role - Роль пользователя
 * @returns {string} - Название роли на русском
 */
const getRoleDisplayName = (role) => {
    const roleNames = {
        admin: 'Администратор',
        master: 'Кальянщик',
        user: 'Пользователь',
    };
    return roleNames[role] || role || 'Гость';
};

// ============================================
// КОМПОНЕНТ ПУНКТА МЕНЮ
// ============================================
function NavItem({ item, collapsed = false }) {
    const theme = useTheme();
    const location = useLocation();
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const buttonContent = (
        <ListItemButton
            component={item.disabled ? 'div' : NavLink}
            to={item.disabled ? undefined : item.path}
            disabled={item.disabled}
            sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: collapsed ? 1.5 : 2,
                borderRadius: 2,
                mx: 1.5,
                mb: 0.5,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                
                ...(isActive && !item.disabled && {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        bottom: '20%',
                        width: 3,
                        borderRadius: '0 4px 4px 0',
                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                }),
                
                '&:hover': {
                    bgcolor: item.disabled 
                        ? 'transparent'
                        : isActive 
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(255, 255, 255, 0.04)',
                },
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center',
                    color: isActive && !item.disabled ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s',
                }}
            >
                <Icon fontSize="small" />
            </ListItemIcon>
            
            {!collapsed && (
                <>
                    <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: isActive && !item.disabled ? 600 : 500,
                            color: isActive && !item.disabled ? 'text.primary' : 'text.secondary',
                        }}
                    />
                    {item.badge && (
                        <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.secondary.main, 0.15),
                                color: 'secondary.main',
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                            }}
                        />
                    )}
                </>
            )}
        </ListItemButton>
    );

    if (collapsed) {
        return (
            <ListItem disablePadding>
                <Tooltip 
                    title={
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {item.label}
                            </Typography>
                            {item.disabled && (
                                <Typography variant="caption" color="text.secondary">
                                    Скоро
                                </Typography>
                            )}
                        </Box>
                    } 
                    placement="right" 
                    arrow
                >
                    <Box sx={{ width: '100%' }}>{buttonContent}</Box>
                </Tooltip>
            </ListItem>
        );
    }

    return <ListItem disablePadding>{buttonContent}</ListItem>;
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ SIDEBAR
// ============================================
function Sidebar({ collapsed = false, onToggle }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

    // ============================================
    // ПОЛУЧЕНИЕ ДАННЫХ ИЗ КОНТЕКСТА АВТОРИЗАЦИИ
    // ============================================
    const { logout, user } = useAuth();

    // Вычисляемые значения на основе данных пользователя
    const userName = user?.name || 'Гость';
    const userRole = user?.role || 'user';
    const userInitials = getInitials(userName);
    const userRoleDisplay = getRoleDisplayName(userRole);

    // ============================================
    // Состояние меню пользователя
    // ============================================
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const userMenuOpen = Boolean(userMenuAnchor);

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    // ============================================
    // Навигация из меню пользователя
    // ============================================
    const handleNavigateToProfile = () => {
        handleUserMenuClose();
        navigate('/profile');
    };

    const handleNavigateToSettings = () => {
        handleUserMenuClose();
        navigate('/settings');
    };

    // ============================================
    // ОБРАБОТЧИК ВЫХОДА ИЗ СИСТЕМЫ
    // ============================================
    const handleLogout = () => {
        handleUserMenuClose();
        // Вызываем функцию logout из контекста авторизации
        logout();
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                    background: `linear-gradient(180deg, 
                        ${theme.palette.background.paper} 0%, 
                        ${alpha(theme.palette.background.default, 0.95)} 100%
                    )`,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                {/* ===== ЛОГОТИП ===== */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: collapsed ? 1.5 : 2.5,
                        py: 2.5,
                        minHeight: 70,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                            flexShrink: 0,
                        }}
                    >
                        <SmokingRoomsIcon sx={{ fontSize: 24, color: '#fff' }} />
                    </Box>
                    
                    {!collapsed && (
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Hookah
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    letterSpacing: '0.05em',
                                }}
                            >
                                MANAGER
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ===== КНОПКА СВОРАЧИВАНИЯ ===== */}
                {onToggle && (
                    <Box sx={{ px: 1.5, mb: 1 }}>
                        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'} placement="right">
                            <IconButton 
                                onClick={onToggle}
                                size="small"
                                sx={{
                                    width: '100%',
                                    borderRadius: 2,
                                    py: 1,
                                    justifyContent: collapsed ? 'center' : 'flex-end',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                                        color: 'primary.main',
                                    },
                                }}
                            >
                                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                <Divider sx={{ mx: 2, opacity: 0.3 }} />

                {/* ===== ОСНОВНОЕ МЕНЮ ===== */}
                <Box sx={{ py: 2 }}>
                    {!collapsed && (
                        <Typography 
                            variant="overline" 
                            sx={{ 
                                px: 3, 
                                color: 'text.secondary',
                                fontSize: '0.65rem',
                                letterSpacing: '0.1em',
                            }}
                        >
                            Основное
                        </Typography>
                    )}
                    <List sx={{ pt: collapsed ? 0 : 1 }}>
                        {mainNavItems.map((item) => (
                            <NavItem key={item.path} item={item} collapsed={collapsed} />
                        ))}
                    </List>
                </Box>

                <Divider sx={{ mx: 2, opacity: 0.3 }} />

                {/* ===== ДОПОЛНИТЕЛЬНОЕ МЕНЮ ===== */}
                <Box sx={{ py: 2 }}>
                    {!collapsed && (
                        <Typography 
                            variant="overline" 
                            sx={{ 
                                px: 3, 
                                color: 'text.secondary',
                                fontSize: '0.65rem',
                                letterSpacing: '0.1em',
                            }}
                        >
                            Дополнительно
                        </Typography>
                    )}
                    <List sx={{ pt: collapsed ? 0 : 1 }}>
                        {secondaryNavItems.map((item) => (
                            <NavItem key={item.path} item={item} collapsed={collapsed} />
                        ))}
                    </List>
                </Box>

                {/* ===== SPACER ===== */}
                <Box sx={{ flexGrow: 1 }} />

                {/* ===== НИЖНЕЕ МЕНЮ ===== */}
                <Box sx={{ py: 1 }}>
                    <Divider sx={{ mx: 2, mb: 2, opacity: 0.3 }} />
                    <List>
                        {bottomNavItems.map((item) => (
                            <NavItem key={item.path} item={item} collapsed={collapsed} />
                        ))}
                    </List>
                </Box>

                <Divider sx={{ mx: 2, opacity: 0.3 }} />

                {/* ============================================ */}
                {/* БЛОК ПОЛЬЗОВАТЕЛЯ (внизу)                   */}
                {/* ============================================ */}
                <Box sx={{ p: 1.5 }}>
                    <ListItemButton
                        onClick={handleUserMenuOpen}
                        sx={{
                            borderRadius: 2,
                            px: collapsed ? 1 : 2,
                            py: 1.5,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            bgcolor: userMenuOpen 
                                ? 'rgba(255, 255, 255, 0.06)' 
                                : 'transparent',
                            border: `1px solid ${userMenuOpen 
                                ? alpha(theme.palette.primary.main, 0.3) 
                                : 'transparent'}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                            },
                        }}
                    >
                        {/* Аватар с динамическими инициалами */}
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {userInitials}
                        </Avatar>

                        {/* Имя и роль — динамические */}
                        {!collapsed && (
                            <Box sx={{ ml: 1.5, overflow: 'hidden', flexGrow: 1 }}>
                                <Typography 
                                    variant="body2" 
                                    fontWeight={600}
                                    sx={{ 
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {userName}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: 'block',
                                    }}
                                >
                                    {userRoleDisplay}
                                </Typography>
                            </Box>
                        )}

                        {!collapsed && (
                            <KeyboardArrowUpIcon 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: 20,
                                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                }} 
                            />
                        )}
                    </ListItemButton>

                    {/* ===== МЕНЮ ПОЛЬЗОВАТЕЛЯ ===== */}
                    <Menu
                        anchorEl={userMenuAnchor}
                        open={userMenuOpen}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: collapsed ? 'right' : 'center',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: collapsed ? 'left' : 'center',
                        }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                minWidth: 220,
                                mb: 1,
                                ml: collapsed ? 2 : 0,
                                overflow: 'visible',
                                '&::before': {
                                    content: '""',
                                    display: collapsed ? 'none' : 'block',
                                    position: 'absolute',
                                    bottom: -6,
                                    left: '50%',
                                    transform: 'translateX(-50%) rotate(45deg)',
                                    width: 12,
                                    height: 12,
                                    bgcolor: 'background.paper',
                                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                },
                            },
                        }}
                    >
                        {/* Информация о пользователе — динамическая */}
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        fontWeight: 700,
                                    }}
                                >
                                    {userInitials}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {userName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {userRoleDisplay}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />

                        {/* Профиль */}
                        <MenuItem onClick={handleNavigateToProfile}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Профиль"
                                primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                        </MenuItem>

                        {/* Настройки */}
                        <MenuItem onClick={handleNavigateToSettings}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Настройки"
                                primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                        </MenuItem>

                        <Divider sx={{ my: 1 }} />

                        {/* Выход */}
                        <MenuItem 
                            onClick={handleLogout}
                            sx={{
                                color: 'error.main',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.08),
                                },
                            }}
                        >
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Выход"
                                primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                        </MenuItem>
                    </Menu>
                </Box>

                {/* ===== ВЕРСИЯ ===== */}
                {!collapsed && (
                    <Box sx={{ px: 3, py: 1.5, textAlign: 'center' }}>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'text.disabled',
                                fontSize: '0.7rem',
                            }}
                        >
                            v1.0.0 • © {new Date().getFullYear()}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}

export default Sidebar;
