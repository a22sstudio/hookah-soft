// ============================================
// ФАЙЛ: Layout.js
// Главный layout приложения с адаптивным Drawer
// ============================================

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery,
    alpha,
} from '@mui/material';

// Иконки
import MenuIcon from '@mui/icons-material/Menu';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';

// Компоненты
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

function Layout() {
    const theme = useTheme();
    
    // ============================================
    // АДАПТИВНАЯ ЛОГИКА
    // useMediaQuery определяет, находимся ли мы на мобильном устройстве
    // breakpoints.down('md') = экраны меньше 900px
    // ============================================
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Состояние мобильного меню (открыто/закрыто)
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* ===== МОБИЛЬНЫЙ APPBAR ===== */}
            {/* Отображается только на мобильных устройствах (md и ниже) */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    // Скрываем AppBar на десктопе
                    display: { xs: 'block', md: 'none' },
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="открыть меню"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: 2,
                            color: 'text.primary',
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    {/* Логотип в AppBar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }}
                        >
                            <SmokingRoomsIcon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                fontSize: '1rem',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Hookah Manager
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ===== САЙДБАР ===== */}
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={handleDrawerToggle}
                isMobile={isMobile}
            />

            {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
            {/* 
                Ключевые моменты адаптивности:
                1. На десктопе (md+): marginLeft = DRAWER_WIDTH, чтобы контент не перекрывался сайдбаром
                2. На мобильных: полная ширина, отступ сверху для AppBar
                3. Padding адаптивный: меньше на мобильных, больше на десктопе
            */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    // На десктопе контент сдвигается вправо на ширину сайдбара
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    // Отступ сверху для мобильного AppBar (56px на xs, 64px на sm)
                    mt: { xs: '56px', sm: '64px', md: 0 },
                    // Адаптивные внутренние отступы
                    p: { xs: 2, sm: 3, md: 4 },
                    // Плавный переход для анимации
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default Layout;
