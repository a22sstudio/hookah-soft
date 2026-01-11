import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Тема
import theme from './theme';

// Контекст авторизации
import { AuthProvider } from './context/AuthContext';

// Компоненты
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Страницы
import LoginPage from './components/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './components/StockPage';
import HistoryPage from './components/HistoryPage';
import UsersPage from './components/UsersPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* ===== ПУБЛИЧНЫЕ МАРШРУТЫ ===== */}
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* ===== ЗАЩИЩЁННЫЕ МАРШРУТЫ ===== */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Редирект с корня на dashboard */}
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            
                            {/* Основные страницы */}
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="stock" element={<StockPage />} />
                            <Route path="history" element={<HistoryPage />} />
                            
                            {/* Дополнительные страницы */}
                            <Route path="users" element={<UsersPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            
                            {/* 404 — редирект на dashboard */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                        
                        {/* Любой другой путь — на логин */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}


export default App;
