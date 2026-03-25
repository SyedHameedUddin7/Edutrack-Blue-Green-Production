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
  Assessment,
  School,
  Person,
  Article,
  Quiz,
  History,
  CalendarMonth,
  CheckCircle,
  Description,
  QuizOutlined,
  HistoryEdu,
  Schedule,
  ArrowForward,
} from '@mui/icons-material';
import ViewAttendance from './ViewAttendance';
import ReportCard from './ReportCard';
import TakeQuiz from './TakeQuiz';
import QuizHistory from './QuizHistory';
import ViewTimetable from './ViewTimetable';
import ProfileUpload from './ProfileUpload';

const StudentDashboard = () => {
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
    { icon: <Assessment />, label: 'My Attendance', shortLabel: 'Attend' },
    { icon: <Article />, label: 'Report Card', shortLabel: 'Report' },
    { icon: <Quiz />, label: 'Take Quiz', shortLabel: 'Quiz' },
    { icon: <CalendarMonth />, label: 'My Timetable', shortLabel: 'Time' },
    { icon: <History />, label: 'Quiz History', shortLabel: 'History' },
  ];

  const quickLinks = [
    { icon: <CheckCircle color="primary" />, text: 'View Attendance', description: 'Check attendance records', tabIndex: 1, color: 'primary.light' },
    { icon: <Description color="secondary" />, text: 'View Report Card', description: 'See your grades', tabIndex: 2, color: 'secondary.light' },
    { icon: <QuizOutlined color="success" />, text: 'Take Quizzes', description: 'Attempt available quizzes', tabIndex: 3, color: 'success.light' },
    { icon: <HistoryEdu color="info" />, text: 'Quiz History', description: 'View past quiz scores', tabIndex: 5, color: 'info.light' },
    { icon: <Schedule color="warning" />, text: 'My Timetable', description: 'View class schedule', tabIndex: 4, color: 'warning.light' },
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
      {/* Floating decorative icons */}
      <Box
        sx={{
          position: 'absolute',
          top: '18%',
          left: '8%',
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
        🎓
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          fontSize: { xs: '70px', md: '110px' },
          opacity: 0.04,
          zIndex: 0,
          animation: 'floatIcon 18s ease-in-out infinite',
          animationDelay: '2s',
        }}
      >
        📖
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '20%',
          fontSize: { xs: '50px', md: '80px' },
          opacity: 0.03,
          zIndex: 0,
          animation: 'floatIcon 12s ease-in-out infinite',
          animationDelay: '1s',
        }}
      >
        ⭐
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
            {isSmallMobile ? 'Student' : 'Student Dashboard'}
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
              Welcome to Student Portal!
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
              View your attendance, grades, and academic information
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Profile Picture Card */}
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    minHeight: { xs: 'auto', md: 500 },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
                        <Person sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600 }}>
                        Profile Picture
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <ProfileUpload />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Your Details Card */}
              <Grid item xs={12} md={6} lg={3}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    minHeight: { xs: 'auto', md: 500 },
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
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          mr: 2, 
                          width: { xs: 48, sm: 56 }, 
                          height: { xs: 48, sm: 56 },
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Person sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600 }}>
                        Your Details
                      </Typography>
                    </Box>

                    <Stack spacing={2.5} sx={{ flex: 1, justifyContent: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mt: 0.5 }}>
                          {user?.name}
                        </Typography>
                      </Box>

                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Roll Number
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mt: 0.5 }}>
                          {user?.rollNumber}
                        </Typography>
                      </Box>

                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Class
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mt: 0.5 }}>
                          {user?.class} - Section {user?.section}
                        </Typography>
                      </Box>

                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Box sx={{ textAlign: 'center', pt: 1 }}>
                        <Chip 
                          label={user?.classSection} 
                          sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            px: 2,
                            py: 2.5,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Links Card */}
              <Grid item xs={12} lg={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    minHeight: { xs: 'auto', md: 500 },
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
                  <CardContent sx={{ p: { xs: 3, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>
                        <Assessment sx={{ fontSize: { xs: 24, sm: 28 } }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600 }}>
                        Quick Links
                      </Typography>
                    </Box>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {quickLinks.map((link, index) => (
                        <Paper
                          key={index}
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
                              background: `linear-gradient(90deg, transparent, ${link.color}20, transparent)`,
                              transition: 'left 0.5s',
                            },
                            '&:hover': {
                              borderColor: link.color,
                              bgcolor: `${link.color}10`,
                              transform: 'translateX(8px)',
                              boxShadow: 2,
                              '&::before': {
                                left: '100%',
                              },
                            },
                          }}
                          onClick={() => setActiveTab(link.tabIndex)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <Box sx={{ mr: 2 }}>
                                {link.icon}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                  {link.text}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                  {link.description}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                              <ArrowForward sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && <ViewAttendance />}
        {activeTab === 2 && <ReportCard />}
        {activeTab === 3 && <TakeQuiz />}
        {activeTab === 4 && <ViewTimetable />}
        {activeTab === 5 && <QuizHistory />}
      </Container>
    </Box>
  );
};

export default StudentDashboard;