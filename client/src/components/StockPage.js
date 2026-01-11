import { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Stack,
    List,
    ListItem,
    ListItemIcon,
    IconButton,
    Autocomplete,
    Box,
    Chip,
    Divider,
    Alert,
    Tooltip,
    Fade,
    LinearProgress,
    Slider,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Paper,
    Snackbar,
} from '@mui/material';

// Иконки
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InventoryIcon from '@mui/icons-material/Inventory';
import BlenderIcon from '@mui/icons-material/Blender';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import ScaleIcon from '@mui/icons-material/Scale';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CalculateIcon from '@mui/icons-material/Calculate';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Компоненты
import RestockModal from './RestockModal';

function StockPage() {
    // ============================================
    // Состояния для склада
    // ============================================
    const [tobaccos, setTobaccos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Состояния для формы добавления табака
    const [formData, setFormData] = useState({
        brand: '',
        name: '',
        line: '',
        strength: 5,
        currentWeight: '',
        thresholdWeight: '50',
    });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Состояния для интерактивного конструктора забивки
    const [selectedTobaccos, setSelectedTobaccos] = useState([]);
    const [mixGrams, setMixGrams] = useState({});
    const [creatingSession, setCreatingSession] = useState(false); // НОВОЕ: загрузка создания

    // Состояние модального окна прихода
    const [restockModalOpen, setRestockModalOpen] = useState(false);

    // Состояния для корректировки остатков
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
    const [selectedTobaccoForEdit, setSelectedTobaccoForEdit] = useState(null);
    const [newWeight, setNewWeight] = useState('');
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState('');

    // ============================================
    // НОВОЕ: Состояния для Snackbar уведомлений
    // ============================================
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
    });

    // Функция показа Snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Функция закрытия Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // ============================================
    // Загрузка данных
    // ============================================
    const fetchTobaccos = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/tobaccos');
            const data = await response.json();
            setTobaccos(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showSnackbar('Ошибка загрузки данных', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTobaccos();
    }, []);

    // ============================================
    // Вспомогательные функции для крепости
    // ============================================
    const getStrengthDisplayName = (value) => {
        if (value <= 3) return 'Лёгкий';
        if (value <= 7) return 'Средний';
        return 'Крепкий';
    };

    const getStrengthColorByValue = (value) => {
        if (value <= 3) return 'success';
        if (value <= 7) return 'warning';
        return 'error';
    };

    const getStrengthColor = (strength) => {
        if (typeof strength === 'number') {
            return getStrengthColorByValue(strength);
        }
        switch (strength) {
            case 'light': return 'success';
            case 'medium': return 'warning';
            case 'strong': return 'error';
            default: return 'default';
        }
    };

    const getStrengthName = (strength) => {
        if (typeof strength === 'number') {
            return getStrengthDisplayName(strength);
        }
        switch (strength) {
            case 'light': return 'Лёгкий';
            case 'medium': return 'Средний';
            case 'strong': return 'Крепкий';
            default: return `${strength}`;
        }
    };

    // Полное имя табака
    const getTobaccoFullName = (tobacco) => {
        if (!tobacco) return '';
        return tobacco.line
            ? `${tobacco.brand} ${tobacco.line} - ${tobacco.name}`
            : `${tobacco.brand} - ${tobacco.name}`;
    };

    // ============================================
    // Обработчики формы добавления
    // ============================================
    const handleFormChange = (field) => (event, value) => {
        const newValue = value !== undefined ? value : event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: newValue,
        }));
        setFormError('');
    };

    const resetForm = () => {
        setFormData({
            brand: '',
            name: '',
            line: '',
            strength: 5,
            currentWeight: '',
            thresholdWeight: '50',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.brand.trim() || !formData.name.trim()) {
            setFormError('Заполните бренд и название');
            return;
        }

        const tobaccoData = {
            brand: formData.brand.trim(),
            name: formData.name.trim(),
            line: formData.line.trim() || null,
            strength: formData.strength,
            currentWeight: parseInt(formData.currentWeight) || 0,
            thresholdWeight: parseInt(formData.thresholdWeight) || 50,
        };

        try {
            const response = await fetch('http://localhost:3001/api/tobaccos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tobaccoData),
            });

            const data = await response.json();

            if (response.ok) {
                setFormSuccess(`Табак "${formData.brand} - ${formData.name}" добавлен!`);
                resetForm();
                fetchTobaccos();
                setTimeout(() => setFormSuccess(''), 3000);
            } else {
                setFormError(data.error || 'Ошибка при добавлении');
            }
        } catch (error) {
            console.error('Ошибка при добавлении табака:', error);
            setFormError('Ошибка соединения с сервером');
        }
    };

    // ============================================
    // Обработчики корректировки остатков
    // ============================================
    const handleOpenInventoryDialog = (tobacco) => {
        setSelectedTobaccoForEdit(tobacco);
        setNewWeight(tobacco.current_weight.toString());
        setInventoryError('');
        setInventoryDialogOpen(true);
    };

    const handleCloseInventoryDialog = () => {
        setInventoryDialogOpen(false);
        setSelectedTobaccoForEdit(null);
        setNewWeight('');
        setInventoryError('');
    };

    const handleSaveInventory = async () => {
        if (!selectedTobaccoForEdit) return;

        const parsedWeight = parseFloat(newWeight);

        if (isNaN(parsedWeight) || parsedWeight < 0) {
            setInventoryError('Введите корректный вес (≥ 0)');
            return;
        }

        setInventoryLoading(true);
        setInventoryError('');

        try {
            const response = await fetch(
                `http://localhost:3001/api/tobaccos/${selectedTobaccoForEdit.id}/inventory`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newWeight: parsedWeight }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setTobaccos((prev) =>
                    prev.map((t) =>
                        t.id === selectedTobaccoForEdit.id
                            ? { ...t, current_weight: parsedWeight }
                            : t
                    )
                );
                handleCloseInventoryDialog();
                showSnackbar(data.message || 'Остаток обновлён', 'success');
            } else {
                setInventoryError(data.error || 'Ошибка при сохранении');
            }
        } catch (error) {
            console.error('Ошибка при корректировке:', error);
            setInventoryError('Ошибка соединения с сервером');
        } finally {
            setInventoryLoading(false);
        }
    };

    // ============================================
    // Обработчики конструктора забивки
    // ============================================
    
    // Обработчик выбора табаков в Autocomplete
    const handleTobaccoSelection = (event, newValue) => {
        setSelectedTobaccos(newValue);
        
        const newMixGrams = { ...mixGrams };
        newValue.forEach((tobacco) => {
            if (!(tobacco.id in newMixGrams)) {
                newMixGrams[tobacco.id] = '';
            }
        });
        
        Object.keys(newMixGrams).forEach((id) => {
            if (!newValue.find((t) => t.id === parseInt(id))) {
                delete newMixGrams[id];
            }
        });
        
        setMixGrams(newMixGrams);
    };

    // Обработчик изменения граммов
    const handleGramsChange = (tobaccoId, value) => {
        setMixGrams((prev) => ({
            ...prev,
            [tobaccoId]: value,
        }));
    };

    // Удаление табака из микса
    const handleRemoveFromMix = (tobaccoId) => {
        setSelectedTobaccos((prev) => prev.filter((t) => t.id !== tobaccoId));
        setMixGrams((prev) => {
            const newGrams = { ...prev };
            delete newGrams[tobaccoId];
            return newGrams;
        });
    };

    // Очистка микса
    const handleClearMix = () => {
        setSelectedTobaccos([]);
        setMixGrams({});
    };

    // ============================================
    // Расчёты для микса
    // ============================================
    
    const totalMixWeight = useMemo(() => {
        return selectedTobaccos.reduce((sum, tobacco) => {
            const grams = parseFloat(mixGrams[tobacco.id]) || 0;
            return sum + grams;
        }, 0);
    }, [selectedTobaccos, mixGrams]);

    const totalMixCost = useMemo(() => {
        return selectedTobaccos.reduce((sum, tobacco) => {
            const grams = parseFloat(mixGrams[tobacco.id]) || 0;
            const pricePerGram = parseFloat(tobacco.price_per_gram) || 0;
            return sum + grams * pricePerGram;
        }, 0);
    }, [selectedTobaccos, mixGrams]);

    const isMixValid = useMemo(() => {
        if (selectedTobaccos.length === 0) return false;
        
        return selectedTobaccos.every((tobacco) => {
            const grams = parseFloat(mixGrams[tobacco.id]) || 0;
            return grams > 0 && grams <= tobacco.current_weight;
        });
    }, [selectedTobaccos, mixGrams]);

    // ============================================
    // ОБНОВЛЕНО: Создание забивки с отправкой на сервер
    // ============================================
    const handleCreateMix = async () => {
        if (!isMixValid) return;

        setCreatingSession(true);

        try {
            // Формируем данные для отправки
            const sessionData = {
                userId: 1, // TODO: Заменить на реального пользователя из контекста/auth
                mix: selectedTobaccos.map((tobacco) => ({
                    id: tobacco.id,
                    grams: parseFloat(mixGrams[tobacco.id]),
                })),
            };

            console.log('Отправка данных сессии:', sessionData);

            // Отправляем запрос на создание сессии
            const response = await fetch('http://localhost:3001/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });

            const data = await response.json();

            if (response.status === 201 && data.success) {
                // Успех!
                console.log('Сессия создана:', data);

                // Очищаем конструктор
                handleClearMix();

                // Обновляем список табаков (остатки уменьшились)
                await fetchTobaccos();

                // Показываем уведомление об успехе
                showSnackbar(
                    `Забивка создана! Себестоимость: ${data.session.totalCost.toFixed(2)} ₽`,
                    'success'
                );
            } else {
                // Ошибка от сервера
                console.error('Ошибка создания сессии:', data);
                showSnackbar(data.error || 'Ошибка при создании забивки', 'error');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            showSnackbar('Ошибка соединения с сервером', 'error');
        } finally {
            setCreatingSession(false);
        }
    };

    // ============================================
    // Другие вспомогательные функции
    // ============================================
    const getWeightColor = (currentWeight, thresholdWeight = 100) => {
        if (currentWeight <= thresholdWeight * 0.5) return 'error';
        if (currentWeight <= thresholdWeight) return 'warning';
        return 'success';
    };

    const getWeightProgress = (currentWeight, maxWeight = 500) => {
        return Math.min((currentWeight / maxWeight) * 100, 100);
    };

    const strengthMarks = [
        { value: 1, label: '🍃' },
        { value: 5, label: '🔥' },
        { value: 10, label: '💀' },
    ];

    const availableTobaccos = tobaccos.filter((t) => t.current_weight > 0);

    // ============================================
    // Рендер компонента
    // ============================================
    return (
        <Container maxWidth="xl">
            <Grid container spacing={3}>
                {/* ========== ЛЕВАЯ КОЛОНКА: СКЛАД ========== */}
                <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                        {/* Карточка добавления табака */}
                        <Fade in timeout={500}>
                            <Card>
                                <CardContent>
                                    <Stack spacing={3}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AddCircleOutlineIcon color="primary" fontSize="large" />
                                            <Typography variant="h5" fontWeight={600}>
                                                Добавить табак
                                            </Typography>
                                        </Box>

                                        {formError && (
                                            <Alert severity="error" onClose={() => setFormError('')}>
                                                {formError}
                                            </Alert>
                                        )}
                                        {formSuccess && (
                                            <Alert severity="success" onClose={() => setFormSuccess('')}>
                                                {formSuccess}
                                            </Alert>
                                        )}

                                        <Box component="form" onSubmit={handleSubmit}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        label="Бренд"
                                                        placeholder="Darkside, Tangiers..."
                                                        value={formData.brand}
                                                        onChange={handleFormChange('brand')}
                                                        size="small"
                                                        fullWidth
                                                        required
                                                        InputProps={{
                                                            startAdornment: (
                                                                <LocalFireDepartmentIcon
                                                                    sx={{ mr: 1, color: 'text.secondary' }}
                                                                />
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        label="Линейка"
                                                        placeholder="Core, Rare, Base..."
                                                        value={formData.line}
                                                        onChange={handleFormChange('line')}
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: (
                                                                <CategoryIcon
                                                                    sx={{ mr: 1, color: 'text.secondary' }}
                                                                />
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        label="Название вкуса"
                                                        placeholder="Supernova, Cane Mint..."
                                                        value={formData.name}
                                                        onChange={handleFormChange('name')}
                                                        size="small"
                                                        fullWidth
                                                        required
                                                        InputProps={{
                                                            startAdornment: (
                                                                <SmokingRoomsIcon
                                                                    sx={{ mr: 1, color: 'text.secondary' }}
                                                                />
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Box sx={{ px: 2 }}>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            gutterBottom
                                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                                        >
                                                            <WhatshotIcon fontSize="small" />
                                                            Крепость ({formData.strength}/10):{' '}
                                                            <Chip
                                                                label={getStrengthDisplayName(formData.strength)}
                                                                size="small"
                                                                color={getStrengthColorByValue(formData.strength)}
                                                            />
                                                        </Typography>
                                                        <Slider
                                                            value={formData.strength}
                                                            onChange={handleFormChange('strength')}
                                                            min={1}
                                                            max={10}
                                                            marks={strengthMarks}
                                                            valueLabelDisplay="auto"
                                                            sx={{
                                                                '& .MuiSlider-track': {
                                                                    background: `linear-gradient(90deg, 
                                                                        #4caf50 0%, 
                                                                        #ff9800 50%, 
                                                                        #f44336 100%)`,
                                                                },
                                                                '& .MuiSlider-thumb': {
                                                                    backgroundColor:
                                                                        formData.strength <= 3 ? '#4caf50' :
                                                                        formData.strength <= 7 ? '#ff9800' : '#f44336',
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Button
                                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                                        startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                        size="small"
                                                        color="inherit"
                                                    >
                                                        {showAdvanced ? 'Скрыть' : 'Показать'} дополнительные поля
                                                    </Button>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Collapse in={showAdvanced}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    label="Начальный вес (гр)"
                                                                    type="number"
                                                                    value={formData.currentWeight}
                                                                    onChange={handleFormChange('currentWeight')}
                                                                    size="small"
                                                                    fullWidth
                                                                    InputProps={{
                                                                        startAdornment: (
                                                                            <ScaleIcon
                                                                                sx={{ mr: 1, color: 'text.secondary' }}
                                                                            />
                                                                        ),
                                                                    }}
                                                                    helperText="Можно пополнить позже"
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    label="Порог уведомления (гр)"
                                                                    type="number"
                                                                    value={formData.thresholdWeight}
                                                                    onChange={handleFormChange('thresholdWeight')}
                                                                    size="small"
                                                                    fullWidth
                                                                    helperText="Уведомить о малом остатке"
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Collapse>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        startIcon={<AddIcon />}
                                                        disabled={!formData.brand || !formData.name}
                                                        fullWidth
                                                        sx={{ height: '44px' }}
                                                    >
                                                        Добавить на склад
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>

                        {/* Карточка списка табаков */}
                        <Fade in timeout={700}>
                            <Card>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 2,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <InventoryIcon color="primary" fontSize="large" />
                                                <Typography variant="h5" fontWeight={600}>
                                                    Склад табака
                                                </Typography>
                                                <Chip
                                                    label={`${tobaccos.length} позиций`}
                                                    color="primary"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </Box>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<LocalShippingIcon />}
                                                onClick={() => setRestockModalOpen(true)}
                                            >
                                                Приход товара
                                            </Button>
                                        </Box>

                                        <Divider />

                                        {loading && <LinearProgress />}

                                        {!loading && tobaccos.length === 0 ? (
                                            <Alert
                                                severity="info"
                                                icon={<InventoryIcon />}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Склад пуст. Добавьте первый табак!
                                            </Alert>
                                        ) : (
                                            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
                                                {tobaccos.map((tobacco, index) => (
                                                    <Fade in timeout={300 + index * 50} key={tobacco.id}>
                                                        <ListItem
                                                            sx={{
                                                                mb: 1.5,
                                                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                                                borderRadius: 2,
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                flexDirection: 'column',
                                                                alignItems: 'stretch',
                                                                p: 2,
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                width: '100%',
                                                                mb: 1,
                                                            }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <SmokingRoomsIcon
                                                                        color={getWeightColor(
                                                                            tobacco.current_weight,
                                                                            tobacco.threshold_weight
                                                                        )}
                                                                    />
                                                                    <Box>
                                                                        <Typography fontWeight={600}>
                                                                            {tobacco.brand}
                                                                            {tobacco.line && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    color="primary.main"
                                                                                    sx={{ ml: 1 }}
                                                                                >
                                                                                    {tobacco.line}
                                                                                </Typography>
                                                                            )}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {tobacco.name}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    {tobacco.current_weight <= tobacco.threshold_weight && (
                                                                        <Tooltip title="Заканчивается!">
                                                                            <WarningAmberIcon color="warning" />
                                                                        </Tooltip>
                                                                    )}
                                                                    <Chip
                                                                        label={`${tobacco.current_weight} гр`}
                                                                        color={getWeightColor(
                                                                            tobacco.current_weight,
                                                                            tobacco.threshold_weight
                                                                        )}
                                                                        size="small"
                                                                        sx={{ minWidth: 80, fontWeight: 600 }}
                                                                    />
                                                                    <Tooltip title="Корректировка остатка">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenInventoryDialog(tobacco)}
                                                                            sx={{
                                                                                color: 'text.secondary',
                                                                                '&:hover': {
                                                                                    color: 'primary.main',
                                                                                    bgcolor: 'rgba(0, 174, 239, 0.1)',
                                                                                },
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Box>

                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={getWeightProgress(tobacco.current_weight)}
                                                                color={getWeightColor(
                                                                    tobacco.current_weight,
                                                                    tobacco.threshold_weight
                                                                )}
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 3,
                                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                                    mb: 1.5,
                                                                }}
                                                            />

                                                            <Stack
                                                                direction="row"
                                                                spacing={1}
                                                                flexWrap="wrap"
                                                                useFlexGap
                                                            >
                                                                {tobacco.strength !== null && tobacco.strength !== undefined && (
                                                                    <Chip
                                                                        icon={<WhatshotIcon />}
                                                                        label={
                                                                            typeof tobacco.strength === 'number'
                                                                                ? `${tobacco.strength}/10`
                                                                                : getStrengthName(tobacco.strength)
                                                                        }
                                                                        size="small"
                                                                        color={getStrengthColor(tobacco.strength)}
                                                                        variant="outlined"
                                                                    />
                                                                )}

                                                                {tobacco.price_per_gram > 0 && (
                                                                    <Tooltip title="Средняя цена за грамм">
                                                                        <Chip
                                                                            icon={<AttachMoneyIcon />}
                                                                            label={`${parseFloat(tobacco.price_per_gram).toFixed(2)} ₽/г`}
                                                                            size="small"
                                                                            color="info"
                                                                            variant="outlined"
                                                                        />
                                                                    </Tooltip>
                                                                )}

                                                                {tobacco.price_per_gram > 0 && tobacco.current_weight > 0 && (
                                                                    <Tooltip title="Стоимость остатка">
                                                                        <Chip
                                                                            label={`≈ ${(tobacco.current_weight * tobacco.price_per_gram).toFixed(0)} ₽`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{ color: 'text.secondary' }}
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </Stack>
                                                        </ListItem>
                                                    </Fade>
                                                ))}
                                            </List>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Stack>
                </Grid>

                {/* ========== ПРАВАЯ КОЛОНКА: КОНСТРУКТОР ЗАБИВКИ ========== */}
                <Grid item xs={12} lg={5}>
                    <Fade in timeout={900}>
                        <Card sx={{ position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BlenderIcon color="secondary" fontSize="large" />
                                        <Typography variant="h5" fontWeight={600}>
                                            Конструктор забивки
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    <Autocomplete
                                        multiple
                                        value={selectedTobaccos}
                                        onChange={handleTobaccoSelection}
                                        options={availableTobaccos}
                                        getOptionLabel={(option) => getTobaccoFullName(option)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        filterSelectedOptions
                                        disabled={creatingSession}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Выберите табаки для микса"
                                                placeholder="Начните вводить..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <PlaylistAddIcon sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }} />
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{ width: '100%' }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {getTobaccoFullName(option)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.price_per_gram > 0
                                                                ? `${parseFloat(option.price_per_gram).toFixed(2)} ₽/г`
                                                                : 'Цена не указана'}
                                                        </Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        {option.strength && (
                                                            <WhatshotIcon
                                                                fontSize="small"
                                                                color={getStrengthColor(option.strength)}
                                                            />
                                                        )}
                                                        <Chip
                                                            label={`${option.current_weight}г`}
                                                            size="small"
                                                            color={getWeightColor(option.current_weight, option.threshold_weight)}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={option.brand + ' ' + option.name}
                                                    size="small"
                                                    {...getTagProps({ index })}
                                                    sx={{ maxWidth: 150 }}
                                                />
                                            ))
                                        }
                                    />

                                    {selectedTobaccos.length > 0 && (
                                        <>
                                            <Divider />
                                            
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Укажите граммовку для каждого табака:
                                                </Typography>
                                                
                                                <Stack spacing={2}>
                                                    {selectedTobaccos.map((tobacco) => {
                                                        const grams = parseFloat(mixGrams[tobacco.id]) || 0;
                                                        const pricePerGram = parseFloat(tobacco.price_per_gram) || 0;
                                                        const itemCost = grams * pricePerGram;
                                                        const isOverLimit = grams > tobacco.current_weight;

                                                        return (
                                                            <Paper
                                                                key={tobacco.id}
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: isOverLimit 
                                                                        ? 'rgba(248, 81, 73, 0.1)' 
                                                                        : 'rgba(255, 152, 0, 0.1)',
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: isOverLimit 
                                                                        ? 'error.main' 
                                                                        : 'secondary.main',
                                                                }}
                                                            >
                                                                <Stack spacing={1.5}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'flex-start',
                                                                    }}>
                                                                        <Box>
                                                                            <Typography fontWeight={600} variant="body2">
                                                                                {getTobaccoFullName(tobacco)}
                                                                            </Typography>
                                                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                                                <Chip
                                                                                    label={`Остаток: ${tobacco.current_weight}г`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    color={getWeightColor(tobacco.current_weight, tobacco.threshold_weight)}
                                                                                />
                                                                                {pricePerGram > 0 && (
                                                                                    <Chip
                                                                                        label={`${pricePerGram.toFixed(2)} ₽/г`}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                    />
                                                                                )}
                                                                            </Stack>
                                                                        </Box>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleRemoveFromMix(tobacco.id)}
                                                                            color="error"
                                                                            disabled={creatingSession}
                                                                        >
                                                                            <DeleteOutlineIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>

                                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                                        <TextField
                                                                            type="number"
                                                                            size="small"
                                                                            value={mixGrams[tobacco.id] || ''}
                                                                            onChange={(e) => handleGramsChange(tobacco.id, e.target.value)}
                                                                            placeholder="0"
                                                                            error={isOverLimit}
                                                                            helperText={isOverLimit ? 'Превышает остаток!' : ''}
                                                                            disabled={creatingSession}
                                                                            sx={{ width: 120 }}
                                                                            InputProps={{
                                                                                endAdornment: (
                                                                                    <InputAdornment position="end">гр</InputAdornment>
                                                                                ),
                                                                            }}
                                                                        />
                                                                        {grams > 0 && pricePerGram > 0 && (
                                                                            <Chip
                                                                                icon={<CalculateIcon />}
                                                                                label={`= ${itemCost.toFixed(2)} ₽`}
                                                                                color="secondary"
                                                                                variant="outlined"
                                                                                size="small"
                                                                            />
                                                                        )}
                                                                    </Stack>
                                                                </Stack>
                                                            </Paper>
                                                        );
                                                    })}
                                                </Stack>
                                            </Box>
                                        </>
                                    )}

                                    {selectedTobaccos.length > 0 && (
                                        <>
                                            <Divider />
                                            
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'rgba(0, 174, 239, 0.1)',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'primary.main',
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Общий вес:
                                                        </Typography>
                                                        <Chip
                                                            icon={<ScaleIcon />}
                                                            label={`${totalMixWeight} гр`}
                                                            color="primary"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Себестоимость:
                                                        </Typography>
                                                        <Chip
                                                            icon={<ReceiptIcon />}
                                                            label={`${totalMixCost.toFixed(2)} ₽`}
                                                            color="secondary"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Box>
                                                    {totalMixWeight > 0 && (
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Средняя цена:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {(totalMixCost / totalMixWeight).toFixed(2)} ₽/г
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </>
                                    )}

                                    {selectedTobaccos.length === 0 && (
                                        <Alert
                                            severity="info"
                                            icon={<BlenderIcon />}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Выберите табаки для создания микса
                                        </Alert>
                                    )}

                                    {/* Индикатор загрузки при создании сессии */}
                                    {creatingSession && <LinearProgress color="secondary" />}

                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteOutlineIcon />}
                                            onClick={handleClearMix}
                                            disabled={selectedTobaccos.length === 0 || creatingSession}
                                            fullWidth
                                        >
                                            Очистить
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={creatingSession ? null : <BlenderIcon />}
                                            onClick={handleCreateMix}
                                            disabled={!isMixValid || creatingSession}
                                            fullWidth
                                            sx={{
                                                '&:not(:disabled)': {
                                                    animation: isMixValid && !creatingSession
                                                        ? 'pulse 2s infinite'
                                                        : 'none',
                                                },
                                                '@keyframes pulse': {
                                                    '0%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)' },
                                                    '70%': { boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0)' },
                                                },
                                            }}
                                        >
                                            {creatingSession ? 'Создание...' : 'Создать забивку'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            </Grid>

            {/* ========== МОДАЛЬНЫЕ ОКНА ========== */}
            
            <RestockModal
                open={restockModalOpen}
                onClose={() => setRestockModalOpen(false)}
                tobaccos={tobaccos}
                onRestockComplete={fetchTobaccos}
            />

            <Dialog
                open={inventoryDialogOpen}
                onClose={handleCloseInventoryDialog}
                maxWidth="xs"
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
                        <InventoryOutlinedIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Корректировка остатка
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {selectedTobaccoForEdit && (
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight={500}>
                                    {getTobaccoFullName(selectedTobaccoForEdit)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Текущий остаток: {selectedTobaccoForEdit.current_weight} гр
                                </Typography>
                            </Alert>
                        )}

                        {inventoryError && (
                            <Alert severity="error" onClose={() => setInventoryError('')}>
                                {inventoryError}
                            </Alert>
                        )}

                        <TextField
                            label="Фактический остаток"
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            fullWidth
                            autoFocus
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
                            helperText="Введите фактический вес табака на складе"
                        />

                        {selectedTobaccoForEdit && newWeight !== '' && (
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Изменение:
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    color={
                                        parseFloat(newWeight) > selectedTobaccoForEdit.current_weight
                                            ? 'success.main'
                                            : parseFloat(newWeight) < selectedTobaccoForEdit.current_weight
                                            ? 'error.main'
                                            : 'text.secondary'
                                    }
                                >
                                    {parseFloat(newWeight) - selectedTobaccoForEdit.current_weight > 0 ? '+' : ''}
                                    {(parseFloat(newWeight) - selectedTobaccoForEdit.current_weight).toFixed(0)} гр
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseInventoryDialog}
                        startIcon={<CloseIcon />}
                        disabled={inventoryLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveInventory}
                        startIcon={<SaveIcon />}
                        disabled={inventoryLoading || newWeight === ''}
                    >
                        {inventoryLoading ? 'Сохранение...' : 'Сохранить'}
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
                    sx={{ 
                        width: '100%',
                        boxShadow: 6,
                    }}
                    icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default StockPage;
