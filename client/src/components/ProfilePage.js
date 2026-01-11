import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Chip,
    Avatar,
    alpha,
    useTheme,
} from '@mui/material';

// Иконки
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';

function ProfilePage() {
    const theme = useTheme();

    return (
        <Box>
            {/* Заголовок страницы */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                        }}
                    >
                        HA
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Профиль
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Управление личными данными и безопасностью
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Контент-заглушка */}
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
            >
                <CardContent>
                    <Stack 
                        spacing={3} 
                        alignItems="center" 
                        justifyContent="center"
                        sx={{ py: 8 }}
                    >
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                fontSize: '2rem',
                                fontWeight: 700,
                            }}
                        >
                            HA
                        </Avatar>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                HOOKAH ADMIN
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                admin@hookah.local
                            </Typography>
                            <Chip 
                                label="Администратор" 
                                size="small" 
                                color="primary"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <ConstructionIcon 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'text.secondary',
                                    opacity: 0.5,
                                    mb: 1,
                                }} 
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                                Редактирование профиля, смена пароля и настройки 
                                безопасности будут доступны в следующей версии.
                            </Typography>
                        </Box>
                        <Chip 
                            label="Coming Soon" 
                            variant="outlined"
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ProfilePage;
