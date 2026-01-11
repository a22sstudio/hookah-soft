import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
    Box, 
    Container, 
    useTheme,
    IconButton,
    Tooltip,
    alpha,
} from '@mui/material';

// Иконки
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Компоненты
import Sidebar, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './Sidebar';

function Layout() {
    const theme = useTheme();
    
    // ============================================
    // Состояние сворачивания сайдбара
    // ============================================
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Текущая ширина сайдбара
    const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

    // Переключение состояния сайдбара
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <Box 
            sx={{ 
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            {/* ================================================ */}
            {/* САЙДБАР                                          */}
            {/* ================================================ */}
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={handleToggleSidebar}
            />

            {/* ================================================ */}
            {/* ОСНОВНОЙ КОНТЕНТ                                 */}
            {/* ================================================ */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    // Плавный переход при сворачивании сайдбара
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* ============================================ */}
                {/* Кнопка сворачивания сайдбара (опционально)   */}
                {/* ============================================ */}
                <Tooltip title={sidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'}>
                    <IconButton
                        onClick={handleToggleSidebar}
                        size="small"
                        sx={{
                            position: 'fixed',
                            left: drawerWidth - 16,
                            top: 24,
                            zIndex: theme.zIndex.drawer + 1,
                            width: 32,
                            height: 32,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: `0 2px 8px ${alpha('#000', 0.15)}`,
                            transition: theme.transitions.create(['left', 'transform'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            '&:hover': {
                                bgcolor: 'background.paper',
                                borderColor: 'primary.main',
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRightIcon fontSize="small" />
                        ) : (
                            <ChevronLeftIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>

                {/* ============================================ */}
                {/* Контейнер с контентом                        */}
                {/* ============================================ */}
                <Box
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                        overflow: 'auto',
                    }}
                >
                    <Container 
                        maxWidth="xl" 
                        disableGutters
                        sx={{ 
                            height: '100%',
                        }}
                    >
                        {/* Здесь рендерятся дочерние маршруты */}
                        <Outlet />
                    </Container>
                </Box>

                {/* ============================================ */}
                {/* Футер (опционально)                          */}
                {/* ============================================ */}
                <Box
                    component="footer"
                    sx={{
                        py: 2,
                        px: { xs: 2, sm: 3, md: 4 },
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Container maxWidth="xl" disableGutters>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 1,
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                }}
                            >
                                © {new Date().getFullYear()} Hookah Manager
                            </Box>
                            <Box
                                component="span"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.disabled',
                                }}
                            >
                                v1.0.0
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}

export default Layout;
