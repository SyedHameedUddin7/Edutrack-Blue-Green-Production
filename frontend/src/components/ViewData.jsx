import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import { People, School, FilterList, Clear, Delete, Warning } from '@mui/icons-material';

const ViewData = () => {
  const { API_URL } = useAuth();
  const [activeView, setActiveView] = useState(0);
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Filter states for Students
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [studentSectionFilter, setStudentSectionFilter] = useState('');
  
  // Filter state for Faculty
  const [facultyClassSectionFilter, setFacultyClassSectionFilter] = useState('');

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: '', // 'faculty' or 'student'
    id: '',
    name: ''
  });

  // Snackbar for success/error messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (activeView === 0) {
      fetchFaculties();
    } else {
      fetchStudents();
    }
  }, [activeView]);

  const fetchFaculties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/faculties`);
      setFaculties(response.data);
    } catch (error) {
      setError('Failed to fetch faculties');
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/students`);
      setStudents(response.data);
    } catch (error) {
      setError('Failed to fetch students');
    }
    setLoading(false);
  };

  // Get unique class-sections for faculty
  const getUniqueFacultyClassSections = () => {
    const classesSet = new Set();
    faculties.forEach(faculty => {
      if (faculty.classes && Array.isArray(faculty.classes)) {
        faculty.classes.forEach(cls => {
          classesSet.add(cls);
        });
      }
    });
    return Array.from(classesSet).sort();
  };

  // Get unique classes for students
  const getUniqueStudentClasses = () => {
    return [...new Set(students.map(s => s.class))].filter(Boolean).sort();
  };

  // Get unique sections for students
  const getUniqueStudentSections = () => {
    return [...new Set(students.map(s => s.section))].filter(Boolean).sort();
  };

  // Filter faculties
  const getFilteredFaculties = () => {
    if (!facultyClassSectionFilter) return faculties;

    return faculties.filter(faculty => {
      if (faculty.classes && Array.isArray(faculty.classes)) {
        return faculty.classes.includes(facultyClassSectionFilter);
      }
      return false;
    });
  };

  // Filter students
  const getFilteredStudents = () => {
    let filtered = [...students];

    if (studentClassFilter) {
      filtered = filtered.filter(student => student.class === studentClassFilter);
    }

    if (studentSectionFilter) {
      filtered = filtered.filter(student => student.section === studentSectionFilter);
    }

    return filtered;
  };

  const clearFacultyFilters = () => {
    setFacultyClassSectionFilter('');
  };

  const clearStudentFilters = () => {
    setStudentClassFilter('');
    setStudentSectionFilter('');
  };

  const handleTabChange = (e, newValue) => {
    setActiveView(newValue);
    clearFacultyFilters();
    clearStudentFilters();
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (type, id, name) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      name
    });
  };

  // Close delete dialog
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      type: '',
      id: '',
      name: ''
    });
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    const { type, id, name } = deleteDialog;
    
    try {
      setLoading(true);
      
      if (type === 'faculty') {
        await axios.delete(`${API_URL}/admin/faculty/${id}`);
        setSnackbar({
          open: true,
          message: `Faculty "${name}" deleted successfully`,
          severity: 'success'
        });
        fetchFaculties(); // Refresh faculty list
      } else if (type === 'student') {
        await axios.delete(`${API_URL}/admin/student/${id}`);
        setSnackbar({
          open: true,
          message: `Student "${name}" deleted successfully`,
          severity: 'success'
        });
        fetchStudents(); // Refresh student list
      }
      
      handleDeleteCancel();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to delete ${type}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = getFilteredFaculties();
  const filteredStudents = getFilteredStudents();
  const facultyClassSections = getUniqueFacultyClassSections();
  const studentClasses = getUniqueStudentClasses();
  const studentSections = getUniqueStudentSections();

  return (
    <>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeView} 
            onChange={handleTabChange}
            variant={isSmallMobile ? "fullWidth" : "fullWidth"}
          >
            <Tab
              icon={<People />}
              iconPosition={isMobile ? "top" : "start"}
              label={`Faculties (${faculties.length})`}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
            />
            <Tab
              icon={<School />}
              iconPosition={isMobile ? "top" : "start"}
              label={`Students (${students.length})`}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Faculty Filter - Single Dropdown */}
          {activeView === 0 && faculties.length > 0 && (
            <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <FilterList sx={{ mr: 1, color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Filter Faculties
                </Typography>
              </Box>
              
              <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <Grid item xs={12} sm={9} md={10}>
                  <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
                    <InputLabel id="faculty-class-section-filter">Select Class-Section</InputLabel>
                    <Select
                      labelId="faculty-class-section-filter"
                      value={facultyClassSectionFilter}
                      onChange={(e) => setFacultyClassSectionFilter(e.target.value)}
                      label="Select Class-Section"
                      sx={{ minWidth: { xs: 150, sm: 200, md: 250 } }}
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: { xs: 150, sm: 200, md: 250 } }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>All Classes</em>
                      </MenuItem>
                      {facultyClassSections.map((classSection) => (
                        <MenuItem key={classSection} value={classSection}>
                          {classSection}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Button
                    variant="outlined"
                    startIcon={!isSmallMobile && <Clear />}
                    onClick={clearFacultyFilters}
                    fullWidth
                    size={isSmallMobile ? 'medium' : 'large'}
                    disabled={!facultyClassSectionFilter}
                  >
                    {isSmallMobile ? <Clear /> : 'Clear'}
                  </Button>
                </Grid>
              </Grid>

              {facultyClassSectionFilter && (
                <Box sx={{ mt: { xs: 2, sm: 3 }, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Active Filter:</strong>
                  </Typography>
                  <Chip 
                    label={`Class-Section: ${facultyClassSectionFilter}`} 
                    color="primary"
                    onDelete={clearFacultyFilters}
                    size={isSmallMobile ? 'small' : 'medium'}
                  />
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Showing {filteredFaculties.length} of {faculties.length} faculties
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Student Filters - Two Dropdowns */}
          {activeView === 1 && students.length > 0 && (
            <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <FilterList sx={{ mr: 1, color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Filter Students
                </Typography>
              </Box>
              
              <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <Grid item xs={12} sm={5} md={5}>
                  <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
                    <InputLabel id="student-class-filter">Select Class</InputLabel>
                    <Select
                      labelId="student-class-filter"
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                      label="Select Class"
                      sx={{ minWidth: { xs: 150, sm: 200 } }}
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: { xs: 150, sm: 200 } }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>All Classes</em>
                      </MenuItem>
                      {studentClasses.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          Class {cls}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={5} md={5}>
                  <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
                    <InputLabel id="student-section-filter">Select Section</InputLabel>
                    <Select
                      labelId="student-section-filter"
                      value={studentSectionFilter}
                      onChange={(e) => setStudentSectionFilter(e.target.value)}
                      label="Select Section"
                      sx={{ minWidth: { xs: 150, sm: 200 } }}
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: { xs: 150, sm: 200 } }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>All Sections</em>
                      </MenuItem>
                      {studentSections.map((section) => (
                        <MenuItem key={section} value={section}>
                          Section {section}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={2} md={2}>
                  <Button
                    variant="outlined"
                    startIcon={!isSmallMobile && <Clear />}
                    onClick={clearStudentFilters}
                    fullWidth
                    size={isSmallMobile ? 'medium' : 'large'}
                    disabled={!studentClassFilter && !studentSectionFilter}
                  >
                    {isSmallMobile ? <Clear /> : 'Clear'}
                  </Button>
                </Grid>
              </Grid>

              {(studentClassFilter || studentSectionFilter) && (
                <Box sx={{ mt: { xs: 2, sm: 3 }, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <strong>Active Filters:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {studentClassFilter && (
                      <Chip 
                        label={`Class: ${studentClassFilter}`} 
                        color="secondary"
                        onDelete={() => setStudentClassFilter('')}
                        size={isSmallMobile ? 'small' : 'medium'}
                      />
                    )}
                    {studentSectionFilter && (
                      <Chip 
                        label={`Section: ${studentSectionFilter}`} 
                        color="secondary"
                        onDelete={() => setStudentSectionFilter('')}
                        size={isSmallMobile ? 'small' : 'medium'}
                      />
                    )}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Showing {filteredStudents.length} of {students.length} students
                </Typography>
              </Box>
            </Paper>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>{error}</Alert>}

          {/* Faculty Table */}
          {!loading && activeView === 0 && (
            <TableContainer sx={{ maxHeight: { xs: 500, sm: 600, md: 700 }, overflowX: 'auto' }}>
              <Table stickyHeader size={isSmallMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
                    {!isSmallMobile && (
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Username</TableCell>
                    )}
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Classes</TableCell>
                    {!isSmallMobile && (
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
                    )}
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFaculties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSmallMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {faculties.length === 0 
                            ? 'No faculties found' 
                            : 'No faculties match the selected filter'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFaculties.map((faculty) => (
                      <TableRow key={faculty._id} hover>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{faculty.name}</TableCell>
                        {!isSmallMobile && (
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{faculty.username}</TableCell>
                        )}
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{faculty.subject}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {faculty.classes?.map((cls, idx) => (
                              <Chip
                                key={idx}
                                label={cls}
                                size="small"
                                color={facultyClassSectionFilter === cls ? 'primary' : 'default'}
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        {!isSmallMobile && (
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {new Date(faculty.createdAt).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell>
                          <IconButton
                            color="error"
                            size={isSmallMobile ? "small" : "medium"}
                            onClick={() => handleDeleteClick('faculty', faculty._id, faculty.name)}
                            title="Delete Faculty"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Student Table */}
          {!loading && activeView === 1 && (
            <TableContainer sx={{ maxHeight: { xs: 500, sm: 600, md: 700 }, overflowX: 'auto' }}>
              <Table stickyHeader size={isSmallMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'secondary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Roll No</TableCell>
                    {!isSmallMobile && (
                      <>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Username</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Class</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Section</TableCell>
                      </>
                    )}
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Class-Sec</TableCell>
                    {!isSmallMobile && (
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
                    )}
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSmallMobile ? 4 : 8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {students.length === 0 
                            ? 'No students found' 
                            : 'No students match the selected filters'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{student.name}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{student.rollNumber}</TableCell>
                        {!isSmallMobile && (
                          <>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{student.username}</TableCell>
                            <TableCell>
                              <Chip 
                                label={student.class} 
                                size="small"
                                color={studentClassFilter === student.class ? 'secondary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={student.section} 
                                size="small"
                                color={studentSectionFilter === student.section ? 'secondary' : 'default'}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Chip 
                            label={student.classSection} 
                            color="secondary" 
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          />
                        </TableCell>
                        {!isSmallMobile && (
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {new Date(student.createdAt).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell>
                          <IconButton
                            color="error"
                            size={isSmallMobile ? "small" : "medium"}
                            onClick={() => handleDeleteClick('student', student._id, student.name)}
                            title="Delete Student"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{deleteDialog.type === 'faculty' ? 'faculty' : 'student'}</strong>{' '}
            <strong>"{deleteDialog.name}"</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
            This will permanently delete:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              {deleteDialog.type === 'faculty' ? 'Faculty' : 'Student'} record
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All attendance records
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All grade records
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ViewData;