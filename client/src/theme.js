import { createTheme, alpha } from '@mui/material';

// ============================================
// ЦВЕТОВАЯ ПАЛИТРА
// ============================================
const colors = {
    // Основные фоны
    background: {
        default: '#0A0A0F',         // Ультра-тёмный
        paper: '#12121A',           // Тёмный для сайдбара
        card: 'rgba(255, 255, 255, 0.03)',  // Почти прозрачный
        elevated: '#1A1A25',        // Приподнятые элементы
        gradient: {
            main: 'radial-gradient(ellipse at top left, #1F2A40 0%, #0A0A0F 50%, #0D0D15 100%)',
            secondary: 'radial-gradient(ellipse at bottom right, #1A1025 0%, #0A0A0F 60%)',
            animated: `
                radial-gradient(ellipse at 0% 0%, rgba(31, 42, 64, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 100% 0%, rgba(45, 20, 60, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 100% 100%, rgba(20, 40, 60, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 0% 100%, rgba(30, 50, 70, 0.2) 0%, transparent 50%)
            `,
        },
    },
    
    // Акцентные цвета
    primary: {
        main: '#00D4FF',
        light: '#5CE1FF',
        dark: '#00A8CC',
        gradient: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
    },
    
    secondary: {
        main: '#FF6B35',
        light: '#FF8F5A',
        dark: '#CC5529',
        gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
    },
    
    // Дополнительные акценты
    accent: {
        purple: '#A855F7',
        pink: '#EC4899',
        blue: '#3B82F6',
        cyan: '#06B6D4',
        teal: '#14B8A6',
    },
    
    // Статусные цвета
    success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
    },
    
    warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
    },
    
    error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
    },
    
    info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
    },
    
    // Текст
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.38)',
        muted: 'rgba(255, 255, 255, 0.5)',
    },
    
    // Границы
    border: {
        subtle: 'rgba(255, 255, 255, 0.06)',
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        strong: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Разделитель
    divider: 'rgba(255, 255, 255, 0.08)',
    
    // Свечение
    glow: {
        primary: '0 0 30px rgba(0, 212, 255, 0.3)',
        secondary: '0 0 30px rgba(255, 107, 53, 0.3)',
        success: '0 0 30px rgba(16, 185, 129, 0.3)',
        error: '0 0 30px rgba(239, 68, 68, 0.3)',
    },
};

// ============================================
// ЭФФЕКТЫ GLASSMORPHISM
// ============================================
const glassEffect = {
    light: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${colors.border.light}`,
    },
    medium: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.medium}`,
    },
    strong: {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${colors.border.strong}`,
    },
};

// ============================================
// СОЗДАНИЕ ТЕМЫ
// ============================================
const theme = createTheme({
    // ============================================
    // ПАЛИТРА
    // ============================================
    palette: {
        mode: 'dark',
        
        primary: {
            main: colors.primary.main,
            light: colors.primary.light,
            dark: colors.primary.dark,
            contrastText: '#000000',
        },
        
        secondary: {
            main: colors.secondary.main,
            light: colors.secondary.light,
            dark: colors.secondary.dark,
            contrastText: '#FFFFFF',
        },
        
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        
        background: {
            default: colors.background.default,
            paper: colors.background.paper,
        },
        
        text: colors.text,
        divider: colors.divider,
    },
    
    // ============================================
    // ТИПОГРАФИКА
    // ============================================
    typography: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        
        h1: {
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
        },
        h2: {
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.3,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        subtitle1: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.01em',
        },
        subtitle2: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            letterSpacing: '0.01em',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            letterSpacing: '0.02em',
        },
        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
        },
        overline: {
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
        },
    },
    
    // ============================================
    // ФОРМА
    // ============================================
    shape: {
        borderRadius: 12,
    },
    
    // ============================================
    // КОМПОНЕНТЫ
    // ============================================
    components: {
        // ===== CSS BASELINE =====
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0,
                },
                html: {
                    scrollBehavior: 'smooth',
                },
                body: {
                    backgroundColor: colors.background.default,
                    // Анимированный градиентный фон
                    backgroundImage: colors.background.gradient.animated,
                    backgroundSize: '400% 400%',
                    backgroundAttachment: 'fixed',
                    animation: 'gradientShift 20s ease infinite',
                    minHeight: '100vh',
                    
                    // Кастомный скроллбар
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${colors.background.elevated} transparent`,
                    '&::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: colors.background.elevated,
                        borderRadius: 4,
                        '&:hover': {
                            background: alpha(colors.primary.main, 0.3),
                        },
                    },
                },
                // Выделение текста
                '::selection': {
                    backgroundColor: alpha(colors.primary.main, 0.3),
                    color: colors.text.primary,
                },
                // Анимация градиента
                '@keyframes gradientShift': {
                    '0%': {
                        backgroundPosition: '0% 0%',
                    },
                    '25%': {
                        backgroundPosition: '100% 0%',
                    },
                    '50%': {
                        backgroundPosition: '100% 100%',
                    },
                    '75%': {
                        backgroundPosition: '0% 100%',
                    },
                    '100%': {
                        backgroundPosition: '0% 0%',
                    },
                },
                // Анимация пульсации
                '@keyframes pulse': {
                    '0%, 100%': {
                        opacity: 1,
                    },
                    '50%': {
                        opacity: 0.7,
                    },
                },
                // Анимация свечения
                '@keyframes glow': {
                    '0%, 100%': {
                        boxShadow: `0 0 20px ${alpha(colors.primary.main, 0.2)}`,
                    },
                    '50%': {
                        boxShadow: `0 0 40px ${alpha(colors.primary.main, 0.4)}`,
                    },
                },
            },
        },
        
        // ===== DRAWER (САЙДБАР) =====
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.background.paper,
                    backgroundImage: 'none',
                    borderRight: `1px solid ${colors.border.light}`,
                    // Лёгкий градиент сверху вниз
                    background: `linear-gradient(180deg, 
                        ${colors.background.paper} 0%, 
                        ${alpha(colors.background.default, 0.95)} 100%
                    )`,
                },
            },
        },
        
        // ===== LIST ITEM BUTTON =====
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    margin: '4px 12px',
                    padding: '10px 16px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        background: `linear-gradient(90deg, 
                            ${alpha(colors.primary.main, 0.1)} 0%, 
                            transparent 100%
                        )`,
                    },
                    
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        '&::before': {
                            opacity: 1,
                        },
                    },
                    
                    // Активное состояние
                    '&.active, &.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            bottom: '20%',
                            width: 3,
                            borderRadius: '0 4px 4px 0',
                            background: colors.primary.gradient,
                            boxShadow: colors.glow.primary,
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                    },
                },
            },
        },
        
        // ===== CARD (GLASSMORPHISM) =====
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    ...glassEffect.medium,
                    boxShadow: 'none',
                    backgroundImage: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    
                    // Градиентная подсветка сверху
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: `linear-gradient(90deg, 
                            transparent 0%, 
                            ${alpha(colors.primary.main, 0.3)} 50%, 
                            transparent 100%
                        )`,
                        opacity: 0,
                        transition: 'opacity 0.3s',
                    },
                    
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: colors.border.medium,
                        '&::before': {
                            opacity: 1,
                        },
                    },
                },
            },
        },
        
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 24,
                    '&:last-child': {
                        paddingBottom: 24,
                    },
                },
            },
        },
        
        // ===== PAPER =====
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: colors.background.paper,
                    borderRadius: 16,
                    border: `1px solid ${colors.border.subtle}`,
                },
            },
        },
        
        // ===== BUTTON =====
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                },
                contained: {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                        left: '100%',
                    },
                },
                containedPrimary: {
                    background: colors.primary.gradient,
                    boxShadow: `0 4px 20px ${alpha(colors.primary.main, 0.3)}`,
                    '&:hover': {
                        boxShadow: `0 6px 30px ${alpha(colors.primary.main, 0.4)}`,
                        transform: 'translateY(-1px)',
                    },
                },
                containedSecondary: {
                    background: colors.secondary.gradient,
                    boxShadow: `0 4px 20px ${alpha(colors.secondary.main, 0.3)}`,
                    '&:hover': {
                        boxShadow: `0 6px 30px ${alpha(colors.secondary.main, 0.4)}`,
                        transform: 'translateY(-1px)',
                    },
                },
                outlined: {
                    borderWidth: 1.5,
                    borderColor: colors.border.medium,
                    '&:hover': {
                        borderWidth: 1.5,
                        borderColor: colors.primary.main,
                        backgroundColor: alpha(colors.primary.main, 0.05),
                        boxShadow: `0 0 20px ${alpha(colors.primary.main, 0.15)}`,
                    },
                },
                text: {
                    '&:hover': {
                        backgroundColor: alpha(colors.primary.main, 0.08),
                    },
                },
            },
        },
        
        // ===== ICON BUTTON =====
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        transform: 'scale(1.05)',
                    },
                },
            },
        },
        
        // ===== CHIP =====
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                    border: `1px solid ${colors.border.subtle}`,
                    transition: 'all 0.2s',
                },
                filled: {
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                },
                colorPrimary: {
                    backgroundColor: alpha(colors.primary.main, 0.12),
                    color: colors.primary.light,
                    borderColor: alpha(colors.primary.main, 0.25),
                },
                colorSecondary: {
                    backgroundColor: alpha(colors.secondary.main, 0.12),
                    color: colors.secondary.light,
                    borderColor: alpha(colors.secondary.main, 0.25),
                },
                colorSuccess: {
                    backgroundColor: alpha(colors.success.main, 0.12),
                    color: colors.success.light,
                    borderColor: alpha(colors.success.main, 0.25),
                },
                colorWarning: {
                    backgroundColor: alpha(colors.warning.main, 0.12),
                    color: colors.warning.light,
                    borderColor: alpha(colors.warning.main, 0.25),
                },
                colorError: {
                    backgroundColor: alpha(colors.error.main, 0.12),
                    color: colors.error.light,
                    borderColor: alpha(colors.error.main, 0.25),
                },
            },
        },
        
        // ===== TEXT FIELD =====
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                            borderColor: colors.border.light,
                            borderWidth: 1,
                            transition: 'all 0.2s',
                        },
                        '&:hover fieldset': {
                            borderColor: colors.border.medium,
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            '& fieldset': {
                                borderColor: colors.primary.main,
                                borderWidth: 1.5,
                            },
                            boxShadow: `0 0 0 4px ${alpha(colors.primary.main, 0.1)}`,
                        },
                    },
                },
            },
        },
        
        // ===== AUTOCOMPLETE =====
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    ...glassEffect.strong,
                    borderRadius: 12,
                    marginTop: 8,
                    boxShadow: `0 16px 48px ${alpha('#000', 0.4)}`,
                },
                option: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    transition: 'all 0.15s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    },
                    '&[aria-selected="true"]': {
                        backgroundColor: alpha(colors.primary.main, 0.12),
                    },
                },
            },
        },
        
        // ===== TABS =====
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: colors.primary.gradient,
                    boxShadow: `0 0 10px ${alpha(colors.primary.main, 0.5)}`,
                },
            },
        },
        
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    },
                    '&.Mui-selected': {
                        color: colors.primary.main,
                        fontWeight: 600,
                    },
                },
            },
        },
        
        // ===== DIALOG =====
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                    ...glassEffect.strong,
                    boxShadow: `0 32px 64px ${alpha('#000', 0.5)}`,
                },
            },
        },
        
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    padding: '24px 24px 16px',
                },
            },
        },
        
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '16px 24px',
                },
            },
        },
        
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 24px',
                    gap: 12,
                },
            },
        },
        
        // ===== MENU =====
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    marginTop: 8,
                    ...glassEffect.strong,
                    boxShadow: `0 20px 50px ${alpha('#000', 0.4)}`,
                },
            },
        },
        
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    padding: '10px 16px',
                    transition: 'all 0.15s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(colors.primary.main, 0.1),
                        '&:hover': {
                            backgroundColor: alpha(colors.primary.main, 0.15),
                        },
                    },
                },
            },
        },
        
        // ===== ALERT =====
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid',
                    ...glassEffect.light,
                },
                standardSuccess: {
                    backgroundColor: alpha(colors.success.main, 0.08),
                    borderColor: alpha(colors.success.main, 0.2),
                    color: colors.success.light,
                    '& .MuiAlert-icon': {
                        color: colors.success.main,
                    },
                },
                standardWarning: {
                    backgroundColor: alpha(colors.warning.main, 0.08),
                    borderColor: alpha(colors.warning.main, 0.2),
                    color: colors.warning.light,
                    '& .MuiAlert-icon': {
                        color: colors.warning.main,
                    },
                },
                standardError: {
                    backgroundColor: alpha(colors.error.main, 0.08),
                    borderColor: alpha(colors.error.main, 0.2),
                    color: colors.error.light,
                    '& .MuiAlert-icon': {
                        color: colors.error.main,
                    },
                },
                standardInfo: {
                    backgroundColor: alpha(colors.info.main, 0.08),
                    borderColor: alpha(colors.info.main, 0.2),
                    color: colors.info.light,
                    '& .MuiAlert-icon': {
                        color: colors.info.main,
                    },
                },
            },
        },
        
        // ===== LINEAR PROGRESS =====
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    height: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                bar: {
                    borderRadius: 6,
                    background: colors.primary.gradient,
                },
            },
        },
        
        // ===== TOOLTIP =====
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    ...glassEffect.strong,
                    backgroundColor: colors.background.elevated,
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    padding: '8px 14px',
                    boxShadow: `0 8px 24px ${alpha('#000', 0.3)}`,
                },
                arrow: {
                    color: colors.background.elevated,
                },
            },
        },
        
        // ===== DIVIDER =====
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: colors.divider,
                },
            },
        },
        
        // ===== AVATAR =====
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    border: `2px solid ${colors.border.light}`,
                },
            },
        },
        
        // ===== SLIDER =====
        MuiSlider: {
            styleOverrides: {
                root: {
                    '& .MuiSlider-track': {
                        border: 'none',
                        background: colors.primary.gradient,
                    },
                    '& .MuiSlider-thumb': {
                        backgroundColor: '#fff',
                        border: `2px solid ${colors.primary.main}`,
                        boxShadow: `0 0 12px ${alpha(colors.primary.main, 0.4)}`,
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0 0 20px ${alpha(colors.primary.main, 0.6)}`,
                        },
                    },
                    '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                },
            },
        },
        
        // ===== SKELETON =====
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    '&::after': {
                        background: `linear-gradient(90deg, 
                            transparent, 
                            rgba(255, 255, 255, 0.04), 
                            transparent
                        )`,
                    },
                },
            },
        },
        
        // ===== PAGINATION =====
        MuiPagination: {
            styleOverrides: {
                root: {
                    '& .MuiPaginationItem-root': {
                        borderRadius: 8,
                        border: `1px solid ${colors.border.subtle}`,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        },
                        '&.Mui-selected': {
                            background: colors.primary.gradient,
                            border: 'none',
                            boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
                        },
                    },
                },
            },
        },
        
        // ===== TABLE =====
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${colors.divider}`,
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                },
            },
        },
        
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.15s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    },
                },
            },
        },
        
        // ===== SWITCH =====
        MuiSwitch: {
            styleOverrides: {
                root: {
                    '& .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '& .Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha(colors.primary.main, 0.5),
                    },
                    '& .MuiSwitch-thumb': {
                        boxShadow: `0 2px 8px ${alpha('#000', 0.3)}`,
                    },
                },
            },
        },
    },
});

// ============================================
// ЭКСПОРТ
// ============================================
export { colors, glassEffect };
export default theme;
