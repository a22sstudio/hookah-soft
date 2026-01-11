import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Stack,
    Box,
    Chip,
    Divider,
    Alert,
    Fade,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Pagination,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Snackbar,
    Collapse,
} from '@mui/material';

// Иконки
import HistoryIcon from '@mui/icons-material/History';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import ScaleIcon from '@mui/icons-material/Scale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import BlenderIcon from '@mui/icons-material/Blender';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import UndoIcon from '@mui/icons-material/Undo';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function HistoryPage() {
    // ============================================
    // Состояния
    // ============================================
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Состояния для раскрытия карточек
    const [expandedCards, setExpandedCards] = useState({});

    // Состояния для удаления
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Состояния для Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // ============================================
    // Загрузка данных
    // ============================================
    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError('');

            const offset = (page - 1) * limit;
            const response = await fetch(
                `http://localhost:3001/api/sessions?limit=${limit}&offset=${offset}`
            );

            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }

            const data = await response.json();
            setSessions(data.sessions || []);
            setTotal(data.pagination?.total || data.total || 0);

        } catch (err) {
            console.error('Ошибка загрузки истории:', err);
            setError('Не удалось загрузить историю забивок');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [page]);

    // ============================================
    // Обработчики раскрытия карточек
    // ============================================
    const toggleCardExpand = (sessionId) => {
        setExpandedCards(prev => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    // ============================================
    // Обработчики удаления
    // ============================================
    const handleOpenDeleteDialog = (session) => {
        setSessionToDelete(session);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!sessionToDelete) return;

        setDeleting(true);

        try {
            const response = await fetch(
                `http://localhost:3001/api/sessions/${sessionToDelete.id}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                handleCloseDeleteDialog();
                await fetchSessions();

                setSnackbar({
                    open: true,
                    message: `Забивка #${sessionToDelete.id} удалена. Возвращено ${data.totalGramsRestored || getTotalGrams(sessionToDelete)} гр табака`,
                    severity: 'success',
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.error || 'Ошибка при удалении',
                    severity: 'error',
                });
            }
        } catch (err) {
            console.error('Ошибка при удалении:', err);
            setSnackbar({
                open: true,
                message: 'Ошибка соединения с сервером',
                severity: 'error',
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // ============================================
    // Вспомогательные функции
    // ============================================
    
    // Расчёт общего веса из массива mix (если total_grams не пришёл с сервера)
    const getTotalGrams = (session) => {
        if (session.total_grams !== undefined && session.total_grams !== null) {
            return session.total_grams;
        }
        if (session.mix && Array.isArray(session.mix)) {
            return session.mix.reduce((sum, item) => 
                sum + (parseFloat(item.grams_used) || 0), 0
            );
        }
        return 0;
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Относительное время
    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return formatDate(dateString);
    };

    // Форматирование стоимости
    const formatCost = (cost) => {
        const numCost = parseFloat(cost);
        if (isNaN(numCost)) return '0.00';
        return numCost.toFixed(2);
    };

    const totalPages = Math.ceil(total / limit);

    // ============================================
    // Рендер компонента
    // ============================================
    return (
        <Container maxWidth="lg">
            <Stack spacing={3}>
                {/* Заголовок */}
                <Fade in timeout={500}>
                    <Card>
                        <CardContent>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <HistoryIcon color="primary" fontSize="large" />
                                    <Typography variant="h5" fontWeight={600}>
                                        История забивок
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${total} забивок`}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>

                {/* Индикатор загрузки */}
                {loading && <LinearProgress />}

                {/* Ошибка */}
                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Пустое состояние */}
                {!loading && sessions.length === 0 && (
                    <Alert
                        severity="info"
                        icon={<HistoryIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        История пуста. Создайте первую забивку в конструкторе!
                    </Alert>
                )}

                {/* Список сессий */}
                {sessions.map((session, index) => {
                    const totalGrams = getTotalGrams(session);
                    const isExpanded = expandedCards[session.id];

                    return (
                        <Fade in timeout={300 + index * 100} key={session.id}>
                            <Card
                                sx={{
                                    borderLeft: '4px solid',
                                    borderLeftColor: 'secondary.main',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2}>
                                        {/* Шапка карточки */}
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            flexWrap: 'wrap',
                                            gap: 2,
                                        }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={600}>
                                                    Забивка #{session.id}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap">
                                                    {/* Дата */}
                                                    <AccessTimeIcon fontSize="small" color="action" />
                                                    <Tooltip title={formatDate(session.created_at)}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatRelativeTime(session.created_at)}
                                                        </Typography>
                                                    </Tooltip>
                                                    
                                                    {/* Пользователь */}
                                                    {session.user_name && (
                                                        <>
                                                            <PersonIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {session.user_name}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Box>

                                            {/* Блок с весом, себестоимостью и кнопками */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {/* Общий вес */}
                                                <Chip
                                                    icon={<ScaleIcon />}
                                                    label={`${totalGrams} гр`}
                                                    color="primary"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                                
                                                {/* Себестоимость */}
                                                <Chip
                                                    icon={<LocalAtmIcon />}
                                                    label={`${formatCost(session.total_cost)} ₽`}
                                                    color="secondary"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                                
                                                {/* Кнопка раскрытия */}
                                                <Tooltip title={isExpanded ? "Скрыть состав" : "Показать состав"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleCardExpand(session.id)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            transition: 'transform 0.3s',
                                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        }}
                                                    >
                                                        <ExpandMoreIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                {/* Кнопка удаления */}
                                                <Tooltip title="Удалить забивку">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteDialog(session)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                color: 'error.main',
                                                                bgcolor: 'rgba(248, 81, 73, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Box>

                                        {/* Раскрывающийся состав забивки */}
                                        <Collapse in={isExpanded}>
                                            <Divider sx={{ my: 1 }} />
                                            
                                            <Box>
                                                <Typography
                                                    variant="subtitle2"
                                                    color="text.secondary"
                                                    gutterBottom
                                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                >
                                                    <BlenderIcon fontSize="small" />
                                                    Состав микса ({session.mix?.length || 0} табаков):
                                                </Typography>

                                                {session.mix && session.mix.length > 0 ? (
                                                    <List dense disablePadding>
                                                        {session.mix.map((item, itemIndex) => (
                                                            <ListItem
                                                                key={itemIndex}
                                                                sx={{
                                                                    py: 0.75,
                                                                    px: 1.5,
                                                                    borderRadius: 1,
                                                                    mb: 0.5,
                                                                    bgcolor: 'rgba(255, 152, 0, 0.05)',
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                                    <SmokingRoomsIcon
                                                                        fontSize="small"
                                                                        color="secondary"
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={
                                                                        <Typography variant="body2" fontWeight={500}>
                                                                            {item.tobacco_name || 'Неизвестный табак'}
                                                                        </Typography>
                                                                    }
                                                                    secondary={
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {item.grams_used} гр
                                                                            {item.price_per_gram && parseFloat(item.price_per_gram) > 0 && (
                                                                                <>
                                                                                    {' × '}
                                                                                    {parseFloat(item.price_per_gram).toFixed(2)} ₽/г
                                                                                    {' = '}
                                                                                    <Box component="span" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                                                                                        {(item.grams_used * parseFloat(item.price_per_gram)).toFixed(2)} ₽
                                                                                    </Box>
                                                                                </>
                                                                            )}
                                                                        </Typography>
                                                                    }
                                                                />
                                                                <Chip
                                                                    label={`${item.grams_used} гр`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="secondary"
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                                                        Состав не найден
                                                    </Typography>
                                                )}

                                                {/* Итоговая строка */}
                                                {session.mix && session.mix.length > 1 && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            mt: 2,
                                                            pt: 1,
                                                            borderTop: '1px dashed',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Итого:
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={`${totalGrams} гр`}
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            size="small"
                                                            label={`${formatCost(session.total_cost)} ₽`}
                                                            color="secondary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Collapse>

                                        {/* Превью состава (когда свёрнуто) */}
                                        {!isExpanded && session.mix && session.mix.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {session.mix.slice(0, 3).map((item, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={`${item.tobacco_name?.split(' - ').pop() || 'Табак'} (${item.grams_used}г)`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ 
                                                            maxWidth: 200, 
                                                            '& .MuiChip-label': { 
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }
                                                        }}
                                                    />
                                                ))}
                                                {session.mix.length > 3 && (
                                                    <Chip
                                                        label={`+${session.mix.length - 3} ещё`}
                                                        size="small"
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>
                    );
                })}

                {/* Пагинация */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Stack>

            {/* ========== ДИАЛОГ ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ========== */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon color="warning" />
                        <Typography variant="h6" fontWeight={600}>
                            Удалить забивку?
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Вы уверены, что хотите удалить забивку #{sessionToDelete?.id}?
                    </DialogContentText>

                    {sessionToDelete && (
                        <Alert
                            severity="info"
                            icon={<UndoIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            <Typography variant="body2" fontWeight={500}>
                                Табак будет возвращён на склад:
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                {sessionToDelete.mix?.map((item, index) => (
                                    <li key={index}>
                                        <Typography variant="body2">
                                            {item.tobacco_name}: <strong>+{item.grams_used} гр</strong>
                                        </Typography>
                                    </li>
                                ))}
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Всего: <strong>+{getTotalGrams(sessionToDelete)} гр</strong>
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        disabled={deleting}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        startIcon={deleting ? null : <DeleteOutlineIcon />}
                    >
                        {deleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========== SNACKBAR УВЕДОМЛЕНИЯ ========== */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', boxShadow: 6 }}
                    icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default HistoryPage;
