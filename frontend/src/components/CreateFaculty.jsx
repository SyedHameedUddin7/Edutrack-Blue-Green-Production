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

const CreateFaculty = () => {
  const { API_URL } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    classes: '',
    subject: '',
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
      const classesArray = formData.classes.split(',').map(c => c.trim());

      const response = await axios.post(`${API_URL}/admin/create-faculty`, {
        ...formData,
        classes: classesArray
      });

      setMessage({ type: 'success', text: response.data.message });
      setFormData({
        name: '',
        classes: '',
        subject: '',
        username: '',
        password: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create faculty'
      });
    }

    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
        <PersonAdd sx={{ fontSize: { xs: 28, sm: 32 }, mr: 2, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Create Faculty
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
          label="Classes (comma-separated)"
          name="classes"
          value={formData.classes}
          onChange={handleChange}
          placeholder="e.g., 10A, 10B, 11A"
          helperText="Enter class with section (e.g., 10A means Class 10 Section A)"
          required
          size={isSmallMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
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
          {loading ? 'Creating...' : 'Create Faculty'}
        </Button>
      </form>
    </Paper>
  );
};

export default CreateFaculty;