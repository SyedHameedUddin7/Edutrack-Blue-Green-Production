import { useState, useEffect, useRef } from 'react';
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
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Print, School, Person, Assessment } from '@mui/icons-material';

const ReportCard = () => {
  const { API_URL, user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState('FA4');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [error, setError] = useState('');
  const printRef = useRef();
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (term && academicYear) {
      fetchReportCard();
    }
  }, [term, academicYear]);

  const fetchReportCard = async () => {
    setLoading(true);
    setError('');
    try {
      const studentId = user.role === 'student' ? user._id : user.id;
      
      const response = await axios.get(
        `${API_URL}/grades/report-card/${studentId}?term=${term}&academicYear=${academicYear}`
      );
      
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report card:', error);
      setError(error.response?.data?.message || 'Failed to fetch report card');
      setReportData(null);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasGrades = reportData && reportData.grades;

  return (
    <Box>
      {/* Controls - Always Visible */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, '@media print': { display: 'none' } }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          View Report Card
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
              <InputLabel>Select Term</InputLabel>
              <Select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                label="Select Term"
              >
                <MenuItem value="FA1">FA1 - Formative Assessment 1</MenuItem>
                <MenuItem value="FA2">FA2 - Formative Assessment 2</MenuItem>
                <MenuItem value="FA3">FA3 - Formative Assessment 3</MenuItem>
                <MenuItem value="FA4">FA4 - Formative Assessment 4</MenuItem>
                <MenuItem value="SA1">SA1 - Summative Assessment 1</MenuItem>
                <MenuItem value="SA2">SA2 - Summative Assessment 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                label="Academic Year"
              >
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              fullWidth
              size={isSmallMobile ? 'medium' : 'large'}
              disabled={!hasGrades}
            >
              Print Report Card
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No Grades Available */}
      {!loading && !hasGrades && (
        <Paper elevation={3} sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Report Card Not Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            No grades have been published for <strong>{term}</strong> - Academic Year <strong>{academicYear}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a different term or contact your class teacher.
          </Typography>
          
          {error && (
            <Alert severity="info" sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
              {error}
            </Alert>
          )}
        </Paper>
      )}

      {/* Report Card - Only show if grades exist */}
      {!loading && hasGrades && (
        <Paper 
          elevation={3} 
          ref={printRef}
          sx={{ 
            '@media print': {
              boxShadow: 'none',
              margin: 0,
              padding: 0,
            }
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              '@media print': {
                background: 'none',
                color: 'black',
                borderBottom: '3px solid black',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <School sx={{ fontSize: { xs: 40, sm: 60 } }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  EduTrack AI
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Affiliated to the State Board
                </Typography>
              </Box>
              <School sx={{ fontSize: { xs: 40, sm: 60 } }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
              Report Card - {term}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Academic Year: {academicYear}
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Student Information */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{reportData.student.name}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Roll Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{reportData.student.rollNumber}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Class</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{reportData.student.class}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Section</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{reportData.student.section}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Marks Table */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Academic Performance
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size={isSmallMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Marks</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Grade</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Points</TableCell>
                    {!isSmallMobile && (
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Remarks</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.grades.subjects.map((subject, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{subject.name}</TableCell>
                      <TableCell align="center">{subject.marksObtained}/{subject.totalMarks}</TableCell>
                      <TableCell align="center">
                        <Chip label={subject.grade} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">{subject.points}</TableCell>
                      {!isSmallMobile && (
                        <TableCell>{subject.remarks || '-'}</TableCell>
                      )}
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{reportData.grades.totalMarks}</TableCell>
                    <TableCell colSpan={isSmallMobile ? 2 : 3}></TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {reportData.grades.percentage}%
                    </TableCell>
                    <TableCell colSpan={isSmallMobile ? 2 : 3}></TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'success.50' }}>
                    <TableCell sx={{ fontWeight: 700 }} colSpan={2}>Final Grade / GPA</TableCell>
                    <TableCell align="center" colSpan={isSmallMobile ? 2 : 3} sx={{ fontWeight: 700 }}>
                      <Chip label={reportData.grades.finalGrade} color="success" sx={{ mr: 1 }} />
                      <Chip label={`GPA: ${reportData.grades.gpa}`} color="info" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Extra Curricular */}
            {reportData.grades.extraCurricular && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Extra Curricular Activities
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="caption" color="text.secondary">General Knowledge</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {reportData.grades.extraCurricular.gk?.grade || '-'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="caption" color="text.secondary">Computer</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          {reportData.grades.extraCurricular.computer?.grade || '-'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="caption" color="text.secondary">Sports</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {reportData.grades.extraCurricular.sports?.grade || '-'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Descriptive Indicators */}
            {reportData.grades.descriptiveIndicators && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Teacher's Remarks
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    {reportData.grades.descriptiveIndicators}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Signatures - Print Only */}
            <Grid container spacing={3} sx={{ mt: 4, '@media screen': { display: 'none' }, '@media print': { display: 'flex' } }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Divider sx={{ mb: 1, borderColor: 'black' }} />
                  <Typography variant="caption">Class Teacher's Signature</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Divider sx={{ mb: 1, borderColor: 'black' }} />
                  <Typography variant="caption">Parent's Signature</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Divider sx={{ mb: 1, borderColor: 'black' }} />
                  <Typography variant="caption">Principal's Signature</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReportCard;