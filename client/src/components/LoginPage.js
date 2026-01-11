import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Alert,
    CircularProgress,
    Fade,
    Grow,
    alpha,
    useTheme,
} from '@mui/material';

// Иконки
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import BackspaceIcon from '@mui/icons-material/Backspace';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

// Контекст авторизации
import { useAuth } from '../context/AuthContext';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const PIN_LENGTH = 4;
const KEYPAD_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    // ИЗМЕНЕНИЕ №1: Получаем из контекста только то, что нам нужно.
    const { login, isAuthenticated } = useAuth();
    
    // Состояния
    const [pin, setPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);
    // ИЗМЕНЕНИЕ №2: Создаем локальное состояние для ошибки.
    const [loginError, setLoginError] = useState(null); 
    
    // Реф для автофокуса
    const containerRef = useRef(null);
    
    // Редирект если уже авторизован
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    
    // Обработка ввода с клавиатуры
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSubmitting) return;
            
            if (/^\d$/.test(e.key)) {
                handleNumberClick(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, isSubmitting]);
    
    // Автоматическая отправка при заполнении PIN
    useEffect(() => {
        if (pin.length === PIN_LENGTH && !isSubmitting) {
            handleSubmit();
        }
    }, [pin, isSubmitting]); // убрали handleSubmit из зависимостей для стабильности
    
    // Очистка ошибки при изменении PIN
    useEffect(() => {
        // ИЗМЕНЕНИЕ №3: Работаем с локальной ошибкой.
        if (loginError) {
            setLoginError(null);
        }
    }, [pin]); // Зависимость только от pin
    
    // Обработчики
    const handleNumberClick = (num) => {
        if (pin.length < PIN_LENGTH && !isSubmitting) {
            setPin(prev => prev + num);
        }
    };
    
    const handleBackspace = () => {
        if (!isSubmitting) {
            setPin(prev => prev.slice(0, -1));
        }
    };
    
    const handleSubmit = async () => {
        if (pin.length !== PIN_LENGTH || isSubmitting) return;
        
        setIsSubmitting(true);
        setLoginError(null); // Сбрасываем локальную ошибку
        
        const result = await login(pin);
        
        if (result.success) {
            setSuccess(true);
            // Редирект произойдет автоматически внутри AuthContext
        } else {
            // Устанавливаем локальную ошибку из ответа функции login
            setLoginError(result.error || 'Произошла неизвестная ошибка');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPin('');
        }
        
        setIsSubmitting(false);
    };
    
    // Рендер точек ПИН-кода
    const renderPinDots = () => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    mb: 4,
                    animation: shake ? 'shake 0.5s ease-in-out' : 'none',
                    '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '20%': { transform: 'translateX(-10px)' },
                        '40%': { transform: 'translateX(10px)' },
                        '60%': { transform: 'translateX(-10px)' },
                        '80%': { transform: 'translateX(10px)' },
                    },
                }}
            >
                {[...Array(PIN_LENGTH)].map((_, index) => (
                    <Grow key={index} in={true} timeout={300 + index * 100}>
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                // Используем локальную ошибку для стилизации
                                border: `2px solid ${
                                    loginError 
                                        ? theme.palette.error.main 
                                        : success 
                                            ? theme.palette.success.main
                                            : alpha(theme.palette.primary.main, 0.5)
                                }`,
                                bgcolor: index < pin.length 
                                    ? loginError 
                                        ? 'error.main'
                                        : success
                                            ? 'success.main'
                                            : 'primary.main'
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                                boxShadow: index < pin.length 
                                    ? `0 0 10px ${alpha(
                                        loginError ? theme.palette.error.main : theme.palette.primary.main, 
                                        0.5
                                    )}`
                                    : 'none',
                            }}
                        />
                    </Grow>
                ))}
            </Box>
        );
    };
    
    // Рендер кнопки клавиатуры (без изменений)
    const renderKeypadButton = (item, index) => {
        if (item === '') {
            return <Box key={index} sx={{ width: 72, height: 72 }} />;
        }
        
        if (item === 'backspace') {
            return (
                <IconButton
                    key={index}
                    onClick={handleBackspace}
                    disabled={isSubmitting || pin.length === 0}
                    sx={{
                        width: 72, height: 72, borderRadius: '50%', color: 'text.secondary',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' },
                        '&:active': { transform: 'scale(0.95)' },
                    }}
                >
                    <BackspaceIcon />
                </IconButton>
            );
        }
        
        return (
            <IconButton
                key={index}
                onClick={() => handleNumberClick(item)}
                disabled={isSubmitting || pin.length >= PIN_LENGTH}
                sx={{
                    width: 72, height: 72, borderRadius: '50%', fontSize: '1.5rem', fontWeight: 600,
                    color: 'text.primary', bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15), borderColor: alpha(theme.palette.primary.main, 0.3), transform: 'scale(1.05)' },
                    '&:active': { transform: 'scale(0.95)', bgcolor: alpha(theme.palette.primary.main, 0.25) },
                    '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'transparent' },
                }}
            >
                {item}
            </IconButton>
        );
    };
    
    return (
        <Box
            ref={containerRef}
            sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'background.default',
                backgroundImage: `
                    radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                    radial-gradient(ellipse at bottom right, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)
                `,
                p: 2,
            }}
        >
            <Fade in={true} timeout={500}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%', maxWidth: 400, p: 4, borderRadius: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 80, height: 80, borderRadius: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mx: 'auto', mb: 2,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }}
                        >
                            <SmokingRoomsIcon sx={{ fontSize: 48, color: '#fff' }} />
                        </Box>
                        <Typography 
                            variant="h4" 
                            fontWeight={700}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Hookah Manager
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Введите ПИН-код для входа
                        </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        {isSubmitting ? (
                            <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                        ) : (
                            <FingerprintIcon 
                                sx={{ 
                                    fontSize: 32, 
                                    color: loginError ? 'error.main' : success ? 'success.main' : 'text.secondary',
                                    transition: 'color 0.3s',
                                }} 
                            />
                        )}
                    </Box>
                    
                    {/* Используем локальную ошибку для отображения */}
                    {loginError && (
                        <Fade in={true}>
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 3,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                }}
                            >
                                {loginError}
                            </Alert>
                        </Fade>
                    )}
                    
                    {renderPinDots()}
                    
                    <Box
                        sx={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1.5, justifyItems: 'center', maxWidth: 280, mx: 'auto',
                        }}
                    >
                        {KEYPAD_NUMBERS.map((item, index) => renderKeypadButton(item, index))}
                    </Box>
                    
                    <Typography 
                        variant="caption" color="text.disabled" 
                        sx={{ display: 'block', textAlign: 'center', mt: 4 }}
                    >
                        Для тестирования используйте ПИН: 1234
                    </Typography>
                </Paper>
            </Fade>
        </Box>
    );
}

export default LoginPage;
