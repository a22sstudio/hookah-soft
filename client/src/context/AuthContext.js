import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================
// КОНСТАНТЫ
// ============================================
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ============================================
// КОНТЕКСТ
// ============================================
const AuthContext = createContext(null);

// ============================================
// ПРОВАЙДЕР
// ============================================
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Инициализация при загрузке
    useEffect(() => {
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_DATA_KEY);
        
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
            
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error('Ошибка парсинга данных пользователя');
                }
            }
        }
        
        setIsLoading(false);
    }, []);
    
    // Очистка данных
    const clearAuthData = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);
    
    // LOGIN
    const login = useCallback(async (pin) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка авторизации');
            }
            
            // Сохраняем
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
            
            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
            
            // Редирект
            const from = location.state?.from || '/dashboard';
            navigate(from, { replace: true });
            
            return { success: true };
            
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [navigate, location.state]);
    
    // LOGOUT
    const logout = useCallback(() => {
        clearAuthData();
        navigate('/login', { replace: true });
    }, [clearAuthData, navigate]);
    
    // Проверка роли
    const hasRole = useCallback((role) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    }, [user]);
    
    // Заголовок авторизации
    const getAuthHeader = useCallback(() => {
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }, [token]);
    
    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated,
            error,
            login,
            logout,
            hasRole,
            getAuthHeader,
            clearError: () => setError(null),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// ХУК
// ============================================
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
}

export default AuthContext;
