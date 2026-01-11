import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ЭКСПОРТИРУЕМ настроенный экземпляр axios, чтобы его могли использовать другие части приложения
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData'; // Ключ для хранения данных пользователя

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Эта функция теперь просто восстанавливает сессию из localStorage
    const verifyAuth = useCallback(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_DATA_KEY);

        if (token && savedUser) {
            // Устанавливаем заголовок авторизации для всех будущих запросов через 'api'
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                // Восстанавливаем пользователя из сохраненных данных
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Не удалось восстановить сессию пользователя:", error);
                // Если данные повреждены, чистим всё
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    // Функция входа
    const login = async (pin) => {
        try {
            const response = await api.post('/api/auth/login', { pin });
            const { token, user } = response.data;

            // Сохраняем и токен, и пользователя
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            console.error("Ошибка входа:", error.response?.data?.message || error.message);
            return { success: false, error: error.response?.data?.message || 'Неверный PIN-код' };
        }
    };

    // Функция выхода
    const logout = () => {
        setUser(null);
        // Чистим и токен, и пользователя
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };
    
    // Проверка роли (без изменений)
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    };


    // Передаем все нужные данные и функции в контекст
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Хук для удобного использования контекста (без изменений)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};
