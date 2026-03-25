import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';

const ViewAttendance = () => {
  const { API_URL, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_URL}/attendance/student/${user._id}`
      );
      setAttendanceData(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch attendance');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const { records, statistics } = attendanceData || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        My Attendance
      </Typography>

      {statistics && (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <CalendarToday sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {statistics.totalDays}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  Total Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <CheckCircle sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {statistics.presentDays}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  Present
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <Cancel sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: 'error.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {statistics.absentDays}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  Absent
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                <TrendingUp sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {statistics.attendancePercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  Attendance
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(statistics.attendancePercentage)}
                  sx={{ mt: 2, height: { xs: 6, sm: 8 }, borderRadius: 4 }}
                  color={statistics.attendancePercentage >= 75 ? 'success' : 'error'}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {records && records.length > 0 ? (
        <Paper elevation={3}>
          <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Attendance History
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
            <Table stickyHeader size={isSmallMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                  {!isSmallMobile && (
                    <TableCell sx={{ fontWeight: 600 }}>Marked By</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record._id} hover>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: isSmallMobile ? '2-digit' : 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        color={record.status === 'present' ? 'success' : 'error'}
                        size="small"
                        icon={record.status === 'present' ? <CheckCircle /> : <Cancel />}
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                      />
                    </TableCell>
                    {!isSmallMobile && (
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{record.faculty?.name || 'N/A'}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No attendance records found.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ViewAttendance;