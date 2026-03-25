import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CheckCircle, Cancel, Send } from '@mui/icons-material';

const MarkAttendance = () => {
  const { API_URL, user } = useAuth();
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const availableClasses = user?.classes || [];

  const fetchStudents = async () => {
    if (!selectedClassSection) {
      setStudents([]);
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.get(
        `${API_URL}/attendance/students/${selectedClassSection}`
      );

      setStudents(response.data);

      // Initialize all students as present by default
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);

      if (response.data.length === 0) {
        setMessage({
          type: 'info',
          text: `No students found in ${selectedClassSection}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch students'
      });
      setStudents([]);
    }

    setLoading(false);
  };

  // Fetch students when class changes
  useEffect(() => {
    fetchStudents();
  }, [selectedClassSection]);

  // Reset attendance to all present when date changes
  useEffect(() => {
    if (students.length > 0) {
      const resetAttendance = {};
      students.forEach(student => {
        resetAttendance[student._id] = 'present';
      });
      setAttendance(resetAttendance);
      console.log('Attendance reset for new date:', date);
    }
  }, [date]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (students.length === 0) {
      setMessage({ type: 'error', text: 'No students to mark attendance for' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id] || 'present'
      }));

      const response = await axios.post(`${API_URL}/attendance/mark`, {
        attendance: attendanceData,
        classSection: selectedClassSection,
        date: date
      });

      setMessage({
        type: 'success',
        text: `Attendance marked successfully for ${response.data.count} students in ${selectedClassSection}!`
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to mark attendance'
      });
    }

    setLoading(false);
  };

  const handleSelectAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  // Calculate counts - recalculates when attendance changes
  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        Mark Attendance
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
            <InputLabel>Select Class-Section</InputLabel>
            <Select
              value={selectedClassSection}
              onChange={(e) => setSelectedClassSection(e.target.value)}
              label="Select Class-Section"
            >
              <MenuItem value="">-- Select Class-Section --</MenuItem>
              {availableClasses.map((cls, index) => (
                <MenuItem key={index} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            size={isSmallMobile ? 'small' : 'medium'}
          />
        </Grid>
      </Grid>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: { xs: 2, sm: 3 } }}>
          {message.text}
        </Alert>
      )}

      {students.length > 0 && (
        <>
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                    {students.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h4" color="success.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                    {presentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Present
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h4" color="error.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
                    {absentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Absent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: { xs: 2, sm: 3 } }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSelectAll('present')}
              startIcon={<CheckCircle />}
              fullWidth={isSmallMobile}
              size={isSmallMobile ? 'medium' : 'large'}
            >
              Mark All Present
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleSelectAll('absent')}
              startIcon={<Cancel />}
              fullWidth={isSmallMobile}
              size={isSmallMobile ? 'medium' : 'large'}
            >
              Mark All Absent
            </Button>
          </Box>

          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              maxHeight: { xs: 400, sm: 500, md: 600 },
              overflowY: 'auto'
            }}
          >
            <Table stickyHeader size={isSmallMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
                  {!isSmallMobile && (
                    <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student._id} hover>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{student.rollNumber}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{student.name}</TableCell>
                    {!isSmallMobile && (
                      <TableCell>
                        <Chip label={student.classSection} size="small" color="primary" />
                      </TableCell>
                    )}
                    <TableCell>
                      <RadioGroup
                        row={!isSmallMobile}
                        value={attendance[student._id]}
                        onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                      >
                        <FormControlLabel
                          value="present"
                          control={<Radio color="success" size={isSmallMobile ? "small" : "medium"} />}
                          label={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>P</Typography>}
                          sx={{ mr: { xs: 1, sm: 2 } }}
                        />
                        <FormControlLabel
                          value="absent"
                          control={<Radio color="error" size={isSmallMobile ? "small" : "medium"} />}
                          label={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>A</Typography>}
                        />
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            size={isSmallMobile ? 'medium' : 'large'}
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            fullWidth
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </>
      )}

      {loading && students.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default MarkAttendance;