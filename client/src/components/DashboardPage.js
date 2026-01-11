import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Skeleton,
    Alert,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
} from '@mui/material';

// Иконки
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function DashboardPage() {
    const theme = useTheme();

    // ============================================
    // Состояния
    // ============================================
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ============================================
    // Загрузка данных
    // ============================================
    const fetchSummary = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('http://localhost:3001/api/dashboard/summary');

            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }

            const data = await response.json();
            setSummary(data);

        } catch (err) {
            console.error('Ошибка загрузки сводки:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // ============================================
    // Форматирование
    // ============================================
    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('ru-RU').format(value || 0);
    };

    // ============================================
    // Скелетон загрузки
    // ============================================
    const renderSkeleton = (height = 200) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Stack spacing={2}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton variant="rectangular" height={height - 100} sx={{ borderRadius: 2 }} />
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {/* ============================================ */}
            {/* ЗАГОЛОВОК СТРАНИЦЫ                          */}
            {/* ============================================ */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h4" fontWeight={700}>
                        Панель управления
                    </Typography>
                    <Tooltip title="Обновить данные">
                        <IconButton 
                            onClick={fetchSummary} 
                            disabled={loading}
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                            }}
                        >
                            <RefreshIcon sx={{ 
                                animation: loading ? 'spin 1s linear infinite' : 'none',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                },
                            }} />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Обзор состояния склада и ключевые показатели
                </Typography>
            </Box>

            {/* Ошибка */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    action={
                        <Chip
                            label="Повторить"
                            size="small"
                            onClick={fetchSummary}
                            sx={{ cursor: 'pointer' }}
                        />
                    }
                >
                    {error}
                </Alert>
            )}

            {/* ============================================ */}
            {/* АСИММЕТРИЧНАЯ СЕТКА                         */}
            {/* ============================================ */}
            <Grid container spacing={3}>
                
                {/* ======================================== */}
                {/* ЛЕВАЯ КОЛОНКА (Основная) — 8 колонок    */}
                {/* ======================================== */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        
                        {/* ----- Карточка: Общая стоимость склада ----- */}
                        <Grid item xs={12} sm={6}>
                            {loading ? renderSkeleton(180) : (
                                <Card 
                                    sx={{ 
                                        height: '100%',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            {/* Заголовок */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                                                    Общая стоимость склада
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                    }}
                                                >
                                                    <AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
                                                </Box>
                                            </Box>

                                            {/* Значение */}
                                            <Typography variant="h3" fontWeight={700} sx={{ color: 'primary.main' }}>
                                                {formatCurrency(summary?.totalStockValue)}
                                            </Typography>

                                            {/* Дополнительная информация */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={<TrendingUpIcon />}
                                                    label="Актуально"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        {/* ----- Карточка: Позиций на складе ----- */}
                        <Grid item xs={12} sm={6}>
                            {loading ? renderSkeleton(180) : (
                                <Card 
                                    sx={{ 
                                        height: '100%',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.05)} 100%)`,
                                        borderColor: alpha(theme.palette.success.main, 0.2),
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            {/* Заголовок */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                                                    Позиций на складе
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: alpha(theme.palette.success.main, 0.15),
                                                    }}
                                                >
                                                    <InventoryIcon sx={{ color: 'success.main' }} />
                                                </Box>
                                            </Box>

                                            {/* Значение */}
                                            <Typography variant="h3" fontWeight={700} sx={{ color: 'success.main' }}>
                                                {formatNumber(summary?.totalPositions)}
                                            </Typography>

                                            {/* Дополнительная информация */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    уникальных табаков
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        {/* ----- Карточка: Быстрая статистика ----- */}
                        <Grid item xs={12}>
                            {loading ? renderSkeleton(250) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                            Быстрая статистика
                                        </Typography>
                                        
                                        <Grid container spacing={3}>
                                            {/* Статистика 1 */}
                                            <Grid item xs={12} sm={4}>
                                                <Box 
                                                    sx={{ 
                                                        p: 2, 
                                                        borderRadius: 2, 
                                                        bgcolor: alpha(theme.palette.info.main, 0.08),
                                                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <SmokingRoomsIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Всего табака
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h5" fontWeight={600}>
                                                        {formatNumber(summary?.stock?.totalGrams || 0)} г
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Статистика 2 */}
                                            <Grid item xs={12} sm={4}>
                                                <Box 
                                                    sx={{ 
                                                        p: 2, 
                                                        borderRadius: 2, 
                                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <LocalFireDepartmentIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Средняя цена
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h5" fontWeight={600}>
                                                        {(summary?.stock?.avgPricePerGram || 0).toFixed(2)} ₽/г
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Статистика 3 */}
                                            <Grid item xs={12} sm={4}>
                                                <Box 
                                                    sx={{ 
                                                        p: 2, 
                                                        borderRadius: 2, 
                                                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <ShowChartIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            За 30 дней
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h5" fontWeight={600}>
                                                        {summary?.monthly?.sessionsCount || 0} забивок
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                    </Grid>
                </Grid>

                {/* ======================================== */}
                {/* ПРАВАЯ КОЛОНКА (Сайдбар) — 4 колонки    */}
                {/* ======================================== */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        
                        {/* ----- Карточка: Требуют закупки ----- */}
                        {loading ? renderSkeleton(280) : (
                            <Card 
                                sx={{ 
                                    background: summary?.lowStockItemsCount > 0
                                        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`
                                        : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.05)} 100%)`,
                                    borderColor: summary?.lowStockItemsCount > 0
                                        ? alpha(theme.palette.warning.main, 0.3)
                                        : alpha(theme.palette.success.main, 0.2),
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* Заголовок */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                                                Требуют закупки
                                            </Typography>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: summary?.lowStockItemsCount > 0 
                                                        ? alpha(theme.palette.warning.main, 0.15)
                                                        : alpha(theme.palette.success.main, 0.15),
                                                }}
                                            >
                                                <WarningAmberIcon 
                                                    sx={{ 
                                                        color: summary?.lowStockItemsCount > 0 
                                                            ? 'warning.main' 
                                                            : 'success.main' 
                                                    }} 
                                                />
                                            </Box>
                                        </Box>

                                        {/* Значение */}
                                        <Typography 
                                            variant="h3" 
                                            fontWeight={700} 
                                            sx={{ 
                                                color: summary?.lowStockItemsCount > 0 
                                                    ? 'warning.main' 
                                                    : 'success.main' 
                                            }}
                                        >
                                            {formatNumber(summary?.lowStockItemsCount)}
                                        </Typography>

                                        {/* Статус */}
                                        <Box>
                                            {summary?.lowStockItemsCount > 0 ? (
                                                <Alert 
                                                    severity="warning" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        py: 0.5,
                                                        bgcolor: 'transparent',
                                                    }}
                                                >
                                                    Необходимо пополнить запасы
                                                </Alert>
                                            ) : (
                                                <Alert 
                                                    severity="success" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        py: 0.5,
                                                        bgcolor: 'transparent',
                                                    }}
                                                >
                                                    Все запасы в норме
                                                </Alert>
                                            )}
                                        </Box>

                                        {/* Прогресс бар */}
                                        {summary?.totalPositions > 0 && (
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Заполненность склада
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {Math.round(((summary?.totalPositions - summary?.lowStockItemsCount) / summary?.totalPositions) * 100)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={((summary?.totalPositions - summary?.lowStockItemsCount) / summary?.totalPositions) * 100}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: summary?.lowStockItemsCount > 0 
                                                                ? 'warning.main' 
                                                                : 'success.main',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* ----- Карточка: Закончились ----- */}
                        {loading ? renderSkeleton(150) : (
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                                            Закончились
                                        </Typography>
                                        <Chip
                                            label={summary?.stock?.outOfStockCount || 0}
                                            size="small"
                                            color={summary?.stock?.outOfStockCount > 0 ? 'error' : 'success'}
                                        />
                                    </Box>
                                    
                                    {summary?.stock?.outOfStockCount > 0 ? (
                                        <Typography variant="body2" color="error.main">
                                            {summary?.stock?.outOfStockCount} позиций полностью закончились
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="success.main">
                                            Все позиции в наличии
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* ----- Карточка: Последнее обновление ----- */}
                        <Card sx={{ bgcolor: 'transparent' }}>
                            <CardContent sx={{ py: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Последнее обновление
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {new Date().toLocaleString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>

                    </Stack>
                </Grid>

            </Grid>
        </Box>
    );
}

export default DashboardPage;
