import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Создаем "умный" экземпляр axios, который будет знать наш базовый URL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = 'authToken';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Начинаем с загрузки
    const navigate = useNavigate();

    // Эта функция будет вызываться один раз при загрузке приложения
    const verifyAuth = useCallback(async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            // Устанавливаем заголовок для следующего запроса
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                // Пытаемся получить профиль пользователя по токену
                const response = await api.get('/api/auth/profile');
                setUser(response.data);
            } catch (error) {
                // Если токен невалидный, чистим все
                console.error("Ошибка верификации токена:", error);
                localStorage.removeItem(AUTH_TOKEN_KEY);
                delete api.defaults.headers.common['Authorization'];
                setUser(null);
            }
        }
        setIsLoading(false); // Загрузка завершена
    }, []);

    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    // Функция входа
    const login = async (pin) => {
        try {
            const response = await api.post('/api/auth/login', { pin });
            const { token, user } = response.data;

            localStorage.setItem(AUTH_TOKEN_KEY, token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            navigate('/dashboard'); // Перенаправляем в дашборд после успешного входа
            return { success: true };
        } catch (error) {
            console.error("Ошибка входа:", error.response?.data?.message || error.message);
            // Возвращаем ошибку, чтобы показать ее на странице входа
            return { success: false, error: error.response?.data?.message || 'Неверный PIN-код' };
        }
    };

    // Функция выхода
    const logout = () => {
        setUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };
    
    // Проверка роли
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    };


    // Передаем все нужные данные и функции в контекст
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user, // Пользователь аутентифицирован, если есть объект user
        login,
        logout,
        hasRole,
    };

    // Не показываем приложение, пока идет проверка токена
    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Хук для удобного использования контекста
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};
