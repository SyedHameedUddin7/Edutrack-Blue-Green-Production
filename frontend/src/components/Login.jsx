import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { School, AutoAwesome } from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password, formData.role);

    if (result.success) {
      const userRole = result.user?.role || formData.role;
      setTimeout(() => {
        navigate(`/${userRole}`, { replace: true });
      }, 100);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Floating decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      >
        <School sx={{ fontSize: 120, color: 'white' }} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-30px) rotate(10deg)' },
          },
        }}
      >
        <AutoAwesome sx={{ fontSize: 100, color: 'white' }} />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card 
          elevation={20}
          sx={{
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  mb: 2,
                }}
              >
                <Avatar 
                  sx={{ 
                    m: 1, 
                    bgcolor: 'primary.main', 
                    width: { xs: 64, sm: 72 }, 
                    height: { xs: 64, sm: 72 },
                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <School sx={{ fontSize: { xs: 36, sm: 42 } }} />
                </Avatar>
                <Avatar
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'warning.main',
                    width: 28,
                    height: 28,
                    border: '2px solid white',
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 16 }} />
                </Avatar>
              </Box>

              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  mt: 1, 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                EduTrack AI
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mt: 1, 
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Smart Education Management
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  mt: 0.5, 
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.8rem' }
                }}
              >
                Sign in to continue to your portal
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus={!isMobile}
                value={formData.username}
                onChange={handleChange}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                size={isMobile ? 'small' : 'medium'}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: { xs: 1.2, sm: 1.5 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'primary.50', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.100',
                }}
              > */}
                {/* <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ fontWeight: 600 }}>
                  <strong>Default Admin Credentials:</strong>
                </Typography>
                <Typography variant="caption" display="block" align="center" color="text.secondary">
                  Username: admin | Password: admin123
                </Typography> */}
              {/* </Paper> */}
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;