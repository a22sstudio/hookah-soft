// ============================================
// ФАЙЛ: Sidebar.js
// Адаптивный сайдбар с навигацией
// ============================================

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
    Chip,
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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Контекст авторизации
import { useAuth } from '../context/AuthContext';

// ============================================
// КОНСТАНТЫ
// Экспортируем для использования в Layout.js
// ============================================
export const DRAWER_WIDTH = 260;

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
const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

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
function NavItem({ item, onItemClick }) {
    const theme = useTheme();
    const location = useLocation();
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const handleClick = () => {
        if (!item.disabled && onItemClick) {
            onItemClick();
        }
    };

    return (
        <ListItem disablePadding>
            <ListItemButton
                component={item.disabled ? 'div' : NavLink}
                to={item.disabled ? undefined : item.path}
                disabled={item.disabled}
                onClick={handleClick}
                sx={{
                    minHeight: 48,
                    px: 2,
                    borderRadius: 2,
                    mx: 1.5,
                    mb: 0.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: item.disabled ? 0.5 : 1,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    
                    // Стили для активного пункта меню
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
                        mr: 2,
                        justifyContent: 'center',
                        color: isActive && !item.disabled ? 'primary.main' : 'text.secondary',
                        transition: 'color 0.2s',
                    }}
                >
                    <Icon fontSize="small" />
                </ListItemIcon>
                
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
            </ListItemButton>
        </ListItem>
    );
}

// ============================================
// КОНТЕНТ САЙДБАРА (общий для обоих режимов)
// ============================================
function SidebarContent({ onItemClick }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const userName = user?.name || 'Гость';
    const userRole = user?.role || 'user';
    const userInitials = getInitials(userName);
    const userRoleDisplay = getRoleDisplayName(userRole);

    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const userMenuOpen = Boolean(userMenuAnchor);

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleNavigateToProfile = () => {
        handleUserMenuClose();
        navigate('/profile');
        if (onItemClick) onItemClick();
    };

    const handleNavigateToSettings = () => {
        handleUserMenuClose();
        navigate('/settings');
        if (onItemClick) onItemClick();
    };

    const handleLogout = () => {
        handleUserMenuClose();
        logout();
    };

    return (
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
                    px: 2.5,
                    py: 2.5,
                    minHeight: 70,
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
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.3 }} />

            {/* ===== ОСНОВНОЕ МЕНЮ ===== */}
            <Box sx={{ py: 2 }}>
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
                <List sx={{ pt: 1 }}>
                    {mainNavItems.map((item) => (
                        <NavItem key={item.path} item={item} onItemClick={onItemClick} />
                    ))}
                </List>
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.3 }} />

            {/* ===== ДОПОЛНИТЕЛЬНОЕ МЕНЮ ===== */}
            <Box sx={{ py: 2 }}>
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
                <List sx={{ pt: 1 }}>
                    {secondaryNavItems.map((item) => (
                        <NavItem key={item.path} item={item} onItemClick={onItemClick} />
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
                        <NavItem key={item.path} item={item} onItemClick={onItemClick} />
                    ))}
                </List>
            </Box>

            <Divider sx={{ mx: 2, opacity: 0.3 }} />

            {/* ===== БЛОК ПОЛЬЗОВАТЕЛЯ ===== */}
            <Box sx={{ p: 1.5 }}>
                <ListItemButton
                    onClick={handleUserMenuOpen}
                    sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
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

                    <KeyboardArrowUpIcon 
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: 20,
                            transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                        }} 
                    />
                </ListItemButton>

                {/* ===== МЕНЮ ПОЛЬЗОВАТЕЛЯ ===== */}
                <Menu
                    anchorEl={userMenuAnchor}
                    open={userMenuOpen}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            minWidth: 220,
                            mb: 1,
                            overflow: 'visible',
                            '&::before': {
                                content: '""',
                                display: 'block',
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

                    <MenuItem onClick={handleNavigateToProfile}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Профиль"
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                        />
                    </MenuItem>

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
        </Box>
    );
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ SIDEBAR
// ============================================
function Sidebar({ mobileOpen, onMobileClose, isMobile }) {
    const theme = useTheme();

    // Общие стили для Drawer paper
    const drawerPaperStyles = {
        width: DRAWER_WIDTH,
        boxSizing: 'border-box',
        bgcolor: 'background.paper',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: `linear-gradient(180deg, 
            ${theme.palette.background.paper} 0%, 
            ${alpha(theme.palette.background.default, 0.95)} 100%
        )`,
    };

    // Мобильный Drawer (temporary) - выезжает поверх контента
    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{
                    keepMounted: true, // Лучшая производительность на мобильных
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': drawerPaperStyles,
                }}
            >
                <SidebarContent onItemClick={onMobileClose} />
            </Drawer>
        );
    }

    // Десктопный Drawer (permanent) - всегда виден
    return (
        <Drawer
            variant="permanent"
            sx={{
                display: { xs: 'none', md: 'block' },
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': drawerPaperStyles,
            }}
        >
            <SidebarContent />
        </Drawer>
    );
}

export default Sidebar;
