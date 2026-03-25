import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Logout,
  Home,
  CheckCircle,
  School,
  Person,
  Grade,
  Assessment,
  CalendarMonth,
  Quiz,
  EditNote,
  Visibility,
  Assignment,
  Schedule,
  ArrowForward,
} from '@mui/icons-material';
import MarkAttendance from './MarkAttendance';
import EnterGrades from './EnterGrades';
import ViewClassGrades from './ViewClassGrades';
import FacultySchedule from './FacultySchedule';
import FacultyQuizResults from './FacultyQuizResults';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const tabs = [
    { icon: <Home />, label: 'Home', shortLabel: 'Home' },
    { icon: <CheckCircle />, label: 'Mark Attendance', shortLabel: 'Attend' },
    { icon: <CalendarMonth />, label: 'My Schedule', shortLabel: 'Schedule' },
    { icon: <Grade />, label: 'Enter Grades', shortLabel: 'Grades' },
    { icon: <Assessment />, label: 'View Class Grades', shortLabel: 'View' }
  ];

  const quickActions = [
    { icon: <EditNote color="primary" />, text: 'Mark Attendance', description: 'Take class attendance', tabIndex: 1, color: 'primary.light' },
    { icon: <Grade color="secondary" />, text: 'Enter Grades', description: 'Submit student grades', tabIndex: 3, color: 'secondary.light' },
    { icon: <Visibility color="info" />, text: 'View Class Performance', description: 'Check student grades', tabIndex: 4, color: 'info.light' },
    { icon: <Schedule color="warning" />, text: 'My Schedule', description: 'View teaching schedule', tabIndex: 2, color: 'warning.light' },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: '200px', md: '400px' },
          height: { xs: '200px', md: '400px' },
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: { xs: '250px', md: '500px' },
          height: { xs: '250px', md: '500px' },
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 25s ease-in-out infinite reverse',
          zIndex: 0,
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(20px, -10px) scale(1.05)' },
        },
      }}
    >
      {/* Floating decorative icon */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: { xs: '60px', md: '100px' },
          opacity: 0.04,
          zIndex: 0,
          animation: 'floatIcon 15s ease-in-out infinite',
          '@keyframes floatIcon': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-30px) rotate(10deg)' },
          },
        }}
      >
        👨‍🏫
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '12%',
          fontSize: { xs: '70px', md: '110px' },
          opacity: 0.04,
          zIndex: 0,
          animation: 'floatIcon 18s ease-in-out infinite',
          animationDelay: '2s',
        }}
      >
        📊
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          fontSize: { xs: '50px', md: '80px' },
          opacity: 0.03,
          zIndex: 0,
          animation: 'floatIcon 12s ease-in-out infinite',
          animationDelay: '1s',
        }}
      >
        ✏️
      </Box>

      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)',
            animation: 'shimmer 20s linear infinite',
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(50px, 50px)' },
          },
        }}
      >
        <Toolbar sx={{ flexWrap: 'wrap', minHeight: { xs: 56, sm: 64 }, position: 'relative', zIndex: 1 }}>
          <School sx={{ mr: { xs: 1, sm: 2 }, fontSize: { xs: 24, sm: 28 } }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isSmallMobile ? 'Faculty' : 'Faculty Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {!isSmallMobile && (
              <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {user?.name}
              </Typography>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={!isSmallMobile && <Logout />}
              sx={{ 
                borderRadius: 2,
                minWidth: { xs: 'auto', sm: 'auto' },
                px: { xs: 1, sm: 2 }
              }}
            >
              {isSmallMobile ? <Logout /> : 'Logout'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 1, sm: 2, md: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper elevation={2} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                fontWeight: 600,
                minWidth: { xs: 70, sm: 100, md: 120 },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition={isMobile ? "top" : "start"}
                label={isSmallMobile ? tab.shortLabel : tab.label}
              />
            ))}
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '"🎯"',
                position: 'absolute',
                top: '-50px',
                left: '5%',
                fontSize: { xs: '50px', md: '80px' },
                opacity: 0.05,
                zIndex: 0,
              },
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                mb: { xs: 1, sm: 2 }, 
                fontWeight: 700,
                textAlign: { xs: 'center', sm: 'left' },
                position: 'relative',
                zIndex: 1,
              }}
            >
              Welcome to Faculty Portal!
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 3, sm: 4 },
                textAlign: { xs: 'center', sm: 'left' },
                position: 'relative',
                zIndex: 1,
              }}
            >
              Manage your classes and track student progress
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Your Details Card */}
              <Grid item xs={12} lg={4}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200px',
                      height: '200px',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                      animation: 'pulse 10s ease-in-out infinite',
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          mr: 2, 
                          width: { xs: 56, sm: 64 }, 
                          height: { xs: 56, sm: 64 },
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Person sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600 }}>
                        Your Details
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                          {user?.name}
                        </Typography>
                      </Box>

                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Subject
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                          {user?.subject}
                        </Typography>
                      </Box>

                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                          Assigned Classes
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {user?.classes?.map((cls, idx) => (
                            <Chip 
                              key={idx} 
                              label={cls} 
                              sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                                }
                              }}
                              size={isSmallMobile ? "small" : "medium"}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions Card */}
              <Grid item xs={12} lg={8}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-50px',
                      left: '-50px',
                      width: '150px',
                      height: '150px',
                      background: 'radial-gradient(circle, rgba(40, 167, 69, 0.08) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 } }}>
                        <CheckCircle sx={{ fontSize: { xs: 28, sm: 32 } }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 600 }}>
                        Quick Actions
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      {quickActions.map((action, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${action.color}20, transparent)`,
                                transition: 'left 0.5s',
                              },
                              '&:hover': {
                                borderColor: action.color,
                                bgcolor: `${action.color}10`,
                                transform: 'translateX(8px)',
                                boxShadow: 2,
                                '&::before': {
                                  left: '100%',
                                },
                              },
                            }}
                            onClick={() => setActiveTab(action.tabIndex)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: 'transparent',
                                    mr: 2,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {action.icon}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    {action.text}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    {action.description}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <ArrowForward />
                              </IconButton>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && <MarkAttendance />}
        {activeTab === 2 && <FacultySchedule />}
        {activeTab === 3 && <EnterGrades />}
        {activeTab === 4 && <ViewClassGrades />}
      </Container>
    </Box>
  );
};

export default FacultyDashboard;