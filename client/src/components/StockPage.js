// ============================================
// ФАЙЛ: StockPage.js
// Страница управления складом табака
// ============================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Stack,
    List,
    ListItem,
    IconButton,
    Autocomplete,
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

// API и Auth Context
import { api, useAuth } from '../context/AuthContext';

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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

const getTobaccoFullName = (tobacco) => {
    if (!tobacco) return '';
    return tobacco.line
        ? `${tobacco.brand} ${tobacco.line} - ${tobacco.name}`
        : `${tobacco.brand} - ${tobacco.name}`;
};

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

// ============================================
// КОМПОНЕНТ: Форма добавления табака
// ============================================
function AddTobaccoForm({ onSuccess, showSnackbar }) {
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
            await api.post('/api/tobaccos', tobaccoData);
            setFormSuccess(`Табак "${formData.brand} - ${formData.name}" добавлен!`);
            resetForm();
            onSuccess();
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (error) {
            console.error('Ошибка при добавлении табака:', error);
            const errorMessage = error.response?.data?.error || 'Ошибка соединения с сервером';
            setFormError(errorMessage);
        }
    };

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={3}>
                    {/* Заголовок */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddCircleOutlineIcon 
                            color="primary" 
                            sx={{ fontSize: { xs: 24, sm: 28 } }} 
                        />
                        <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                        >
                            Добавить табак
                        </Typography>
                    </Box>

                    {/* Алерты */}
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

                    {/* Форма */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Бренд */}
                            <Grid item xs={12} sm={6} md={4}>
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
                                            <InputAdornment position="start">
                                                <LocalFireDepartmentIcon 
                                                    sx={{ color: 'text.secondary', fontSize: 20 }} 
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Линейка */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Линейка"
                                    placeholder="Core, Rare, Base..."
                                    value={formData.line}
                                    onChange={handleFormChange('line')}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CategoryIcon 
                                                    sx={{ color: 'text.secondary', fontSize: 20 }} 
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Название вкуса */}
                            <Grid item xs={12} md={4}>
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
                                            <InputAdornment position="start">
                                                <SmokingRoomsIcon 
                                                    sx={{ color: 'text.secondary', fontSize: 20 }} 
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Слайдер крепости */}
                            <Grid item xs={12}>
                                <Box sx={{ px: { xs: 1, sm: 2 } }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <WhatshotIcon fontSize="small" />
                                        Крепость ({formData.strength}/10):
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

                            {/* Кнопка дополнительных полей */}
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

                            {/* Дополнительные поля */}
                            <Grid item xs={12}>
                                <Collapse in={showAdvanced}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Начальный вес (гр)"
                                                type="number"
                                                value={formData.currentWeight}
                                                onChange={handleFormChange('currentWeight')}
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <ScaleIcon 
                                                                sx={{ color: 'text.secondary', fontSize: 20 }} 
                                                            />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                helperText="Можно пополнить позже"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
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

                            {/* Кнопка отправки */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    disabled={!formData.brand || !formData.name}
                                    fullWidth
                                    sx={{ height: 44 }}
                                >
                                    Добавить на склад
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

// ============================================
// КОМПОНЕНТ: Список табаков на складе
// ============================================
function TobaccoList({ tobaccos, loading, onOpenRestock, onOpenInventory }) {
    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                    {/* Заголовок */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <InventoryIcon 
                                color="primary" 
                                sx={{ fontSize: { xs: 24, sm: 28 } }} 
                            />
                            <Typography 
                                variant="h6" 
                                fontWeight={600}
                                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
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
                            onClick={onOpenRestock}
                            size="small"
                            sx={{ 
                                whiteSpace: 'nowrap',
                                minWidth: { xs: '100%', sm: 'auto' },
                            }}
                        >
                            Приход товара
                        </Button>
                    </Box>

                    <Divider />

                    {/* Индикатор загрузки */}
                    {loading && <LinearProgress />}

                    {/* Пустой склад */}
                    {!loading && tobaccos.length === 0 ? (
                        <Alert
                            severity="info"
                            icon={<InventoryIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Склад пуст. Добавьте первый табак!
                        </Alert>
                    ) : (
                        /* Список табаков */
                        <List sx={{ 
                            maxHeight: { xs: 400, sm: 500, md: 600 }, 
                            overflow: 'auto',
                            mx: -1,
                            px: 1,
                        }}>
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
                                            p: { xs: 1.5, sm: 2 },
                                        }}
                                    >
                                        {/* Верхняя часть: название и вес */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            mb: 1,
                                            gap: 1,
                                        }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: 1,
                                                minWidth: 0,
                                                flex: 1,
                                            }}>
                                                <SmokingRoomsIcon
                                                    color={getWeightColor(
                                                        tobacco.current_weight,
                                                        tobacco.threshold_weight
                                                    )}
                                                    sx={{ mt: 0.5, flexShrink: 0 }}
                                                />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography 
                                                        fontWeight={600}
                                                        sx={{
                                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
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
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        sx={{ wordBreak: 'break-word' }}
                                                    >
                                                        {tobacco.name}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Правая часть: вес и кнопка редактирования */}
                                            <Stack 
                                                direction="row" 
                                                spacing={0.5} 
                                                alignItems="center"
                                                sx={{ flexShrink: 0 }}
                                            >
                                                {tobacco.current_weight <= tobacco.threshold_weight && (
                                                    <Tooltip title="Заканчивается!">
                                                        <WarningAmberIcon 
                                                            color="warning" 
                                                            sx={{ fontSize: { xs: 18, sm: 20 } }}
                                                        />
                                                    </Tooltip>
                                                )}
                                                <Chip
                                                    label={`${tobacco.current_weight} гр`}
                                                    color={getWeightColor(
                                                        tobacco.current_weight,
                                                        tobacco.threshold_weight
                                                    )}
                                                    size="small"
                                                    sx={{ 
                                                        minWidth: { xs: 65, sm: 80 }, 
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                                    }}
                                                />
                                                <Tooltip title="Корректировка остатка">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onOpenInventory(tobacco)}
                                                        sx={{
                                                            color: 'text.secondary',
                                                            p: { xs: 0.5, sm: 1 },
                                                            '&:hover': {
                                                                color: 'primary.main',
                                                                bgcolor: 'rgba(0, 174, 239, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Box>

                                        {/* Прогресс-бар */}
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

                                        {/* Чипсы с информацией */}
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            flexWrap="wrap"
                                            useFlexGap
                                            sx={{ gap: 0.5 }}
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
    );
}

// ============================================
// КОМПОНЕНТ: Конструктор забивки
// ============================================
function MixConstructor({ 
    tobaccos, 
    onMixCreated, 
    showSnackbar,
    user,
}) {
    const [selectedTobaccos, setSelectedTobaccos] = useState([]);
    const [mixGrams, setMixGrams] = useState({});
    const [creatingSession, setCreatingSession] = useState(false);

    const availableTobaccos = tobaccos.filter((t) => t.current_weight > 0);

    // Обработчик выбора табаков
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

    const handleGramsChange = (tobaccoId, value) => {
        setMixGrams((prev) => ({
            ...prev,
            [tobaccoId]: value,
        }));
    };

    const handleRemoveFromMix = (tobaccoId) => {
        setSelectedTobaccos((prev) => prev.filter((t) => t.id !== tobaccoId));
        setMixGrams((prev) => {
            const newGrams = { ...prev };
            delete newGrams[tobaccoId];
            return newGrams;
        });
    };

    const handleClearMix = () => {
        setSelectedTobaccos([]);
        setMixGrams({});
    };

    // Расчёты
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

    // Создание забивки
    const handleCreateMix = async () => {
        if (!isMixValid) return;

        setCreatingSession(true);

        try {
            const sessionData = {
                userId: user?.id || 1,
                mix: selectedTobaccos.map((tobacco) => ({
                    id: tobacco.id,
                    grams: parseFloat(mixGrams[tobacco.id]),
                })),
            };

            const response = await api.post('/api/sessions', sessionData);
            const data = response.data;

            handleClearMix();
            onMixCreated();

            showSnackbar(
                `Забивка создана! Себестоимость: ${data.session.totalCost.toFixed(2)} ₽`,
                'success'
            );
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            const errorMessage = error.response?.data?.error || 'Ошибка соединения с сервером';
            showSnackbar(errorMessage, 'error');
        } finally {
            setCreatingSession(false);
        }
    };

    return (
        <Card sx={{ 
            position: { xs: 'relative', lg: 'sticky' }, 
            top: { lg: 20 },
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={3}>
                    {/* Заголовок */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BlenderIcon 
                            color="secondary" 
                            sx={{ fontSize: { xs: 24, sm: 28 } }} 
                        />
                        <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                        >
                            Конструктор забивки
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Автокомплит для выбора табаков */}
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
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography 
                                            variant="body2" 
                                            fontWeight={500}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {getTobaccoFullName(option)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.price_per_gram > 0
                                                ? `${parseFloat(option.price_per_gram).toFixed(2)} ₽/г`
                                                : 'Цена не указана'}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
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
                                    label={`${option.brand} ${option.name}`}
                                    size="small"
                                    {...getTagProps({ index })}
                                    sx={{ 
                                        maxWidth: { xs: 100, sm: 150 },
                                        '& .MuiChip-label': {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        },
                                    }}
                                />
                            ))
                        }
                    />

                    {/* Список выбранных табаков с граммовкой */}
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
                                                    p: { xs: 1.5, sm: 2 },
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
                                                    {/* Название и кнопка удаления */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        gap: 1,
                                                    }}>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography 
                                                                fontWeight={600} 
                                                                variant="body2"
                                                                sx={{
                                                                    wordBreak: 'break-word',
                                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                                }}
                                                            >
                                                                {getTobaccoFullName(tobacco)}
                                                            </Typography>
                                                            <Stack 
                                                                direction="row" 
                                                                spacing={0.5} 
                                                                sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}
                                                            >
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
                                                            sx={{ flexShrink: 0 }}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Ввод граммовки */}
                                                    <Stack 
                                                        direction={{ xs: 'column', sm: 'row' }} 
                                                        spacing={1} 
                                                        alignItems={{ xs: 'stretch', sm: 'center' }}
                                                    >
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={mixGrams[tobacco.id] || ''}
                                                            onChange={(e) => handleGramsChange(tobacco.id, e.target.value)}
                                                            placeholder="0"
                                                            error={isOverLimit}
                                                            helperText={isOverLimit ? 'Превышает остаток!' : ''}
                                                            disabled={creatingSession}
                                                            sx={{ 
                                                                width: { xs: '100%', sm: 120 },
                                                                flexShrink: 0,
                                                            }}
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

                    {/* Итоговая информация */}
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
                                        flexWrap: 'wrap',
                                        gap: 1,
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
                                        flexWrap: 'wrap',
                                        gap: 1,
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
                                            flexWrap: 'wrap',
                                            gap: 1,
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

                    {/* Пустое состояние */}
                    {selectedTobaccos.length === 0 && (
                        <Alert
                            severity="info"
                            icon={<BlenderIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Выберите табаки для создания микса
                        </Alert>
                    )}

                    {/* Индикатор загрузки */}
                    {creatingSession && <LinearProgress color="secondary" />}

                    {/* Кнопки действий */}
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2}
                    >
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
    );
}

// ============================================
// КОМПОНЕНТ: Диалог корректировки остатков
// ============================================
function InventoryDialog({ 
    open, 
    onClose, 
    tobacco, 
    onSave, 
}) {
    const [newWeight, setNewWeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Сброс состояния при открытии
    useEffect(() => {
        if (open && tobacco) {
            setNewWeight(tobacco.current_weight.toString());
            setError('');
        }
    }, [open, tobacco]);

    const handleSave = async () => {
        if (!tobacco) return;

        const parsedWeight = parseFloat(newWeight);

        if (isNaN(parsedWeight) || parsedWeight < 0) {
            setError('Введите корректный вес (≥ 0)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSave(tobacco.id, parsedWeight);
            onClose();
        } catch (err) {
            setError(err.message || 'Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const weightDiff = tobacco && newWeight !== '' 
        ? parseFloat(newWeight) - tobacco.current_weight 
        : 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    borderRadius: 3,
                    m: { xs: 2, sm: 3 },
                },
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryOutlinedIcon color="primary" />
                    <Typography 
                        variant="h6" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                        Корректировка остатка
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {tobacco && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={500}>
                                {getTobaccoFullName(tobacco)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Текущий остаток: {tobacco.current_weight} гр
                            </Typography>
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
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

                    {tobacco && newWeight !== '' && (
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
                                    weightDiff > 0 ? 'success.main' :
                                    weightDiff < 0 ? 'error.main' : 'text.secondary'
                                }
                            >
                                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(0)} гр
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ 
                p: 2, 
                pt: 0, 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 1,
            }}>
                <Button
                    onClick={onClose}
                    startIcon={<CloseIcon />}
                    disabled={loading}
                    fullWidth
                    sx={{ order: { xs: 2, sm: 1 } }}
                >
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    disabled={loading || newWeight === ''}
                    fullWidth
                    sx={{ order: { xs: 1, sm: 2 } }}
                >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
// ============================================
function StockPage() {
    const { user } = useAuth();

    // Состояния
    const [tobaccos, setTobaccos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restockModalOpen, setRestockModalOpen] = useState(false);
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
    const [selectedTobaccoForEdit, setSelectedTobaccoForEdit] = useState(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback((event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    // Загрузка данных
    const fetchTobaccos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/tobaccos');
            setTobaccos(response.data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showSnackbar('Ошибка загрузки данных', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchTobaccos();
    }, [fetchTobaccos]);

    // Обработчики корректировки остатков
    const handleOpenInventoryDialog = (tobacco) => {
        setSelectedTobaccoForEdit(tobacco);
        setInventoryDialogOpen(true);
    };

    const handleCloseInventoryDialog = () => {
        setInventoryDialogOpen(false);
        setSelectedTobaccoForEdit(null);
    };

    const handleSaveInventory = async (tobaccoId, newWeight) => {
        const response = await api.patch(
            `/api/tobaccos/${tobaccoId}/inventory`,
            { newWeight }
        );

        setTobaccos((prev) =>
            prev.map((t) =>
                t.id === tobaccoId
                    ? { ...t, current_weight: newWeight }
                    : t
            )
        );

        showSnackbar(response.data.message || 'Остаток обновлён', 'success');
    };

    // ============================================
    // РЕНДЕР
    // ============================================
    return (
        <Box>
            {/* 
                ============================================
                ГЛАВНАЯ СЕТКА СТРАНИЦЫ
                
                Структура:
                - На мобильных (xs): все в одну колонку (12 из 12)
                - На планшетах (md): все в одну колонку
                - На десктопах (lg+): две колонки (7 + 5)
                
                spacing={3} = 24px между элементами (theme.spacing(3))
                ============================================
            */}
            <Grid container spacing={3}>
                {/* ===== ЛЕВАЯ КОЛОНКА: СКЛАД ===== */}
                <Grid item xs={12} lg={7}>
                    <Stack spacing={3}>
                        {/* Форма добавления табака */}
                        <Fade in timeout={500}>
                            <Box>
                                <AddTobaccoForm 
                                    onSuccess={fetchTobaccos} 
                                    showSnackbar={showSnackbar}
                                />
                            </Box>
                        </Fade>

                        {/* Список табаков */}
                        <Fade in timeout={700}>
                            <Box>
                                <TobaccoList
                                    tobaccos={tobaccos}
                                    loading={loading}
                                    onOpenRestock={() => setRestockModalOpen(true)}
                                    onOpenInventory={handleOpenInventoryDialog}
                                />
                            </Box>
                        </Fade>
                    </Stack>
                </Grid>

                {/* ===== ПРАВАЯ КОЛОНКА: КОНСТРУКТОР ЗАБИВКИ ===== */}
                <Grid item xs={12} lg={5}>
                    <Fade in timeout={900}>
                        <Box>
                            <MixConstructor
                                tobaccos={tobaccos}
                                onMixCreated={fetchTobaccos}
                                showSnackbar={showSnackbar}
                                user={user}
                            />
                        </Box>
                    </Fade>
                </Grid>
            </Grid>

            {/* ===== МОДАЛЬНЫЕ ОКНА ===== */}
            
            {/* Модалка прихода товара */}
            <RestockModal
                open={restockModalOpen}
                onClose={() => setRestockModalOpen(false)}
                tobaccos={tobaccos}
                onRestockComplete={fetchTobaccos}
            />

            {/* Диалог корректировки остатков */}
            <InventoryDialog
                open={inventoryDialogOpen}
                onClose={handleCloseInventoryDialog}
                tobacco={selectedTobaccoForEdit}
                onSave={handleSaveInventory}
            />

            {/* ===== SNACKBAR УВЕДОМЛЕНИЯ ===== */}
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
        </Box>
    );
}

export default StockPage;
