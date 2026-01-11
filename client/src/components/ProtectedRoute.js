import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, alpha, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

// ============================================
// КОНСТАНТЫ
// ============================================
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Проверяет, истёк ли JWT токен
 */
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // JWT состоит из 3 частей: header.payload.signature
        const payload = token.split('.')[1];
        if (!payload) return true;
        
        // Декодируем payload из Base64
        const decoded = JSON.parse(atob(payload));
        
        // Проверяем время истечения (exp в секундах)
        if (decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return true;
    }
}

/**
 * Получает данные пользователя из токена
 */
function getUserFromToken(token) {
    if (!token) return null;
    
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        
        return JSON.parse(atob(payload));
    } catch (error) {
        return null;
    }
}

/**
 * Очищает данные авторизации
 */
function clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
}

// ============================================
// КОМПОНЕНТ PROTECTED ROUTE
// ============================================

function ProtectedRoute({ 
    children, 
    requiredRole = null,  // Опционально: требуемая роль
    redirectTo = '/login' // Куда редиректить при отсутствии доступа
}) {
    const location = useLocation();
    const theme = useTheme();
    
    // Состояния
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    
    useEffect(() => {
        checkAuth();
    }, [location.pathname]);
    
    const checkAuth = () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        
        // Проверка 1: Есть ли токен?
        if (!token) {
            setIsAuthenticated(false);
            setHasAccess(false);
            setIsChecking(false);
            return;
        }
        
        // Проверка 2: Не истёк ли токен?
        if (isTokenExpired(token)) {
            console.warn('Токен истёк, требуется повторная авторизация');
            clearAuthData();
            setIsAuthenticated(false);
            setHasAccess(false);
            setIsChecking(false);
            return;
        }
        
        // Проверка 3: Проверка роли (если требуется)
        if (requiredRole) {
            const userData = getUserFromToken(token);
            const userRole = userData?.role || localStorage.getItem('userRole');
            
            if (userRole !== requiredRole) {
                setIsAuthenticated(true);
                setHasAccess(false);
                setIsChecking(false);
                return;
            }
        }
        
        // Все проверки пройдены
        setIsAuthenticated(true);
        setHasAccess(true);
        setIsChecking(false);
    };
    
    // Показываем индикатор загрузки во время проверки
    if (isChecking) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CircularProgress 
                        size={48}
                        sx={{
                            color: 'primary.main',
                        }}
                    />
                    <Box
                        sx={{
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                        }}
                    >
                        Проверка авторизации...
                    </Box>
                </Box>
            </Box>
        );
    }
    
    // Если не авторизован — редирект на логин
    if (!isAuthenticated) {
        return (
            <Navigate 
                to={redirectTo} 
                state={{ from: location.pathname }} 
                replace 
            />
        );
    }
    
    // Если авторизован, но нет доступа (роль не подходит) — редирект на 403
    if (!hasAccess) {
        return (
            <Navigate 
                to="/access-denied" 
                state={{ from: location.pathname }} 
                replace 
            />
        );
    }
    
    // Всё ок — рендерим защищённый контент
    return children;
}

// ============================================
// ЭКСПОРТ
// ============================================

export { 
    isTokenExpired, 
    getUserFromToken, 
    clearAuthData,
    AUTH_TOKEN_KEY,
    USER_DATA_KEY,
};

export default ProtectedRoute;
