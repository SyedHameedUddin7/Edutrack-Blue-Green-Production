import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const CreateStudent = () => {
  const { API_URL } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    class: '',
    section: '',
    username: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/admin/create-student`, formData);

      setMessage({ type: 'success', text: response.data.message });
      setFormData({
        name: '',
        rollNumber: '',
        class: '',
        section: '',
        username: '',
        password: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create student'
      });
    }

    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
        <PersonAdd sx={{ fontSize: { xs: 28, sm: 32 }, mr: 2, color: 'secondary.main' }} />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Create Student
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Admission Number"
          name="rollNumber"
          value={formData.rollNumber}
          onChange={handleChange}
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Class"
          name="class"
          value={formData.class}
          onChange={handleChange}
          placeholder="e.g., 10"
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Section"
          name="section"
          value={formData.section}
          onChange={handleChange}
          placeholder="e.g., A"
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        {message.text && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size={isSmallMobile ? 'medium' : 'large'}
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? 'Creating...' : 'Create Student'}
        </Button>
      </form>
    </Paper>
  );
};

export default CreateStudent;