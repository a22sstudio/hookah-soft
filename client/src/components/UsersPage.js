import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';

// Иконки
import PeopleIcon from '@mui/icons-material/People';
import ConstructionIcon from '@mui/icons-material/Construction';

function UsersPage() {
    const theme = useTheme();

    return (
        <Box>
            {/* Заголовок страницы */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                    >
                        <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Пользователи
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Управление пользователями и правами доступа
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Контент-заглушка */}
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
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
                        <ConstructionIcon 
                            sx={{ 
                                fontSize: 64, 
                                color: 'text.secondary',
                                opacity: 0.5,
                            }} 
                        />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Страница в разработке
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                                Здесь будет функционал управления пользователями, 
                                ролями и правами доступа к системе.
                            </Typography>
                        </Box>
                        <Chip 
                            label="Coming Soon" 
                            color="primary" 
                            variant="outlined"
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default UsersPage;
