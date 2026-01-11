import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    Typography,
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Divider,
    Alert,
    LinearProgress,
    Tooltip,
    InputAdornment,
} from '@mui/material';

// Иконки
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScaleIcon from '@mui/icons-material/Scale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';

function RestockModal({ open, onClose, tobaccos, onRestockComplete }) {
    // ============================================
    // Состояния
    // ============================================
    const [selectedTobacco, setSelectedTobacco] = useState(null);
    const [gramsAdded, setGramsAdded] = useState('');
    const [totalCost, setTotalCost] = useState('');
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ============================================
    // Добавление позиции в накладную
    // ============================================
    const handleAddToInvoice = () => {
        if (!selectedTobacco || !gramsAdded || !totalCost) {
            setError('Заполните все поля');
            return;
        }

        const grams = parseInt(gramsAdded, 10);
        const cost = parseFloat(totalCost);

        if (isNaN(grams) || grams <= 0) {
            setError('Количество грамм должно быть положительным числом');
            return;
        }

        if (isNaN(cost) || cost < 0) {
            setError('Стоимость не может быть отрицательной');
            return;
        }

        // Проверка на дубликат
        const existingItem = invoiceItems.find(
            (item) => item.tobaccoId === selectedTobacco.id
        );

        if (existingItem) {
            setError('Этот табак уже добавлен в накладную');
            return;
        }

        const newItem = {
            id: Date.now(),
            tobaccoId: selectedTobacco.id,
            brand: selectedTobacco.brand,
            line: selectedTobacco.line,
            name: selectedTobacco.name,
            fullName: selectedTobacco.line
                ? `${selectedTobacco.brand} ${selectedTobacco.line} - ${selectedTobacco.name}`
                : `${selectedTobacco.brand} - ${selectedTobacco.name}`,
            gramsAdded: grams,
            totalCost: cost,
            pricePerGram: cost / grams,
        };

        setInvoiceItems([...invoiceItems, newItem]);
        setSelectedTobacco(null);
        setGramsAdded('');
        setTotalCost('');
        setError('');
    };

    // ============================================
    // Удаление позиции из накладной
    // ============================================
    const handleRemoveFromInvoice = (itemId) => {
        setInvoiceItems(invoiceItems.filter((item) => item.id !== itemId));
    };

    // ============================================
    // Проведение прихода
    // ============================================
    const handleProcessRestock = async () => {
        if (invoiceItems.length === 0) {
            setError('Добавьте хотя бы одну позицию');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Последовательно обрабатываем каждую позицию
            for (const item of invoiceItems) {
                const response = await fetch(
                    `http://localhost:3001/api/tobaccos/${item.tobaccoId}/restock`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gramsAdded: item.gramsAdded,
                            totalCost: item.totalCost,
                        }),
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || `Ошибка при пополнении ${item.fullName}`);
                }
            }

            setSuccess(`Приход успешно проведён: ${invoiceItems.length} позиций`);
            setInvoiceItems([]);

            // Уведомляем родительский компонент
            if (onRestockComplete) {
                onRestockComplete();
            }

            // Закрываем модальное окно через 1.5 секунды
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (err) {
            console.error('Ошибка при проведении прихода:', err);
            setError(err.message || 'Ошибка при проведении прихода');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Закрытие модального окна
    // ============================================
    const handleClose = () => {
        setSelectedTobacco(null);
        setGramsAdded('');
        setTotalCost('');
        setInvoiceItems([]);
        setError('');
        setSuccess('');
        onClose();
    };

    // ============================================
    // Расчёты для отображения
    // ============================================
    const totalGrams = invoiceItems.reduce((sum, item) => sum + item.gramsAdded, 0);
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.totalCost, 0);

    // Расчёт цены за грамм для текущего ввода
    const currentPricePerGram =
        gramsAdded && totalCost && parseInt(gramsAdded) > 0
            ? (parseFloat(totalCost) / parseInt(gramsAdded)).toFixed(2)
            : null;

    // ============================================
    // Рендер
    // ============================================
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
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
                    <LocalShippingIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        Приходная накладная
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {/* Сообщения */}
                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" icon={<CheckCircleIcon />}>
                            {success}
                        </Alert>
                    )}

                    {loading && <LinearProgress />}

                    {/* Форма добавления позиции */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'rgba(0, 174, 239, 0.05)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'primary.main',
                        }}
                    >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Добавить позицию
                        </Typography>
                        <Stack spacing={2}>
                            {/* Выбор табака */}
                            <Autocomplete
                                value={selectedTobacco}
                                onChange={(_, newValue) => setSelectedTobacco(newValue)}
                                options={tobaccos}
                                getOptionLabel={(option) =>
                                    option.line
                                        ? `${option.brand} ${option.line} - ${option.name}`
                                        : `${option.brand} - ${option.name}`
                                }
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ width: '100%' }}
                                        >
                                            <Box>
                                                <Typography variant="body2">
                                                    {option.brand}
                                                    {option.line && (
                                                        <Typography
                                                            component="span"
                                                            color="primary.main"
                                                            sx={{ ml: 1 }}
                                                        >
                                                            {option.line}
                                                        </Typography>
                                                    )}
                                                    {' — '}
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`${option.current_weight} гр`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Выберите табак"
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <SmokingRoomsIcon
                                                        sx={{ mr: 1, color: 'text.secondary' }}
                                                    />
                                                    {params.InputProps.startAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                disabled={loading}
                            />

                            {/* Граммы и стоимость */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Грамм добавлено"
                                    type="number"
                                    value={gramsAdded}
                                    onChange={(e) => setGramsAdded(e.target.value)}
                                    size="small"
                                    fullWidth
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ScaleIcon sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">гр</InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="Общая стоимость"
                                    type="number"
                                    value={totalCost}
                                    onChange={(e) => setTotalCost(e.target.value)}
                                    size="small"
                                    fullWidth
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoneyIcon sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">₽</InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>

                            {/* Цена за грамм (информативно) */}
                            {currentPricePerGram && (
                                <Alert severity="info" sx={{ py: 0 }}>
                                    Цена за грамм: <strong>{currentPricePerGram} ₽/г</strong>
                                </Alert>
                            )}

                            {/* Кнопка добавления */}
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddToInvoice}
                                disabled={!selectedTobacco || !gramsAdded || !totalCost || loading}
                            >
                                Добавить в накладную
                            </Button>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Список позиций накладной */}
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReceiptLongIcon color="secondary" />
                                <Typography variant="h6" fontWeight={500}>
                                    Позиции накладной
                                </Typography>
                            </Box>
                            {invoiceItems.length > 0 && (
                                <Chip
                                    label={`${invoiceItems.length} позиций`}
                                    color="secondary"
                                    size="small"
                                />
                            )}
                        </Box>

                        {invoiceItems.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                Накладная пуста. Добавьте позиции для пополнения склада.
                            </Alert>
                        ) : (
                            <>
                                <List dense>
                                    {invoiceItems.map((item, index) => (
                                        <ListItem
                                            key={item.id}
                                            sx={{
                                                mb: 1,
                                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'secondary.main',
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography fontWeight={500}>
                                                        {item.fullName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        <Chip
                                                            label={`+${item.gramsAdded} гр`}
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={`${item.totalCost} ₽`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={`${item.pricePerGram.toFixed(2)} ₽/г`}
                                                            size="small"
                                                            color="info"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Удалить">
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleRemoveFromInvoice(item.id)}
                                                        color="error"
                                                        disabled={loading}
                                                    >
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>

                                {/* Итого */}
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: 'rgba(255, 152, 0, 0.2)',
                                        borderRadius: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        ИТОГО:
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <Chip
                                            icon={<ScaleIcon />}
                                            label={`${totalGrams} гр`}
                                            color="success"
                                        />
                                        <Chip
                                            icon={<AttachMoneyIcon />}
                                            label={`${totalAmount.toFixed(2)} ₽`}
                                            color="secondary"
                                        />
                                    </Stack>
                                </Box>
                            </>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={handleClose}
                    startIcon={<CloseIcon />}
                    disabled={loading}
                >
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleProcessRestock}
                    disabled={invoiceItems.length === 0 || loading}
                    sx={{
                        minWidth: 180,
                    }}
                >
                    {loading ? 'Проведение...' : 'Провести приход'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RestockModal;
