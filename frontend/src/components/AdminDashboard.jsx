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
  CardActionArea,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Logout,
  Home,
  PersonAdd,
  School,
  Visibility,
  Quiz,
  ManageSearch,
  CalendarMonth,
  ViewTimeline,
} from '@mui/icons-material';
import CreateFaculty from './CreateFaculty';
import CreateStudent from './CreateStudent';
import CreateQuiz from './CreateQuiz';
import ManageQuizzes from './ManageQuizzes';
import ViewData from './ViewData';
import GenerateTimetable from './GenerateTimetable';
import ManageTimetables from './ManageTimetables';

const AdminDashboard = () => {
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

  const handleCardClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const tabs = [
    { icon: <Home />, label: 'Home', shortLabel: 'Home' },
    { icon: <PersonAdd />, label: 'Create Faculty', shortLabel: 'Faculty' },
    { icon: <PersonAdd />, label: 'Create Student', shortLabel: 'Student' },
    { icon: <Quiz />, label: 'Create Quiz', shortLabel: 'Quiz' },
    { icon: <ManageSearch />, label: 'Manage Quizzes', shortLabel: 'Quizzes' },
    { icon: <CalendarMonth />, label: 'Generate Timetable', shortLabel: 'Gen TT' },
    { icon: <ViewTimeline />, label: 'Manage Timetables', shortLabel: 'TTs' },
    { icon: <Visibility />, label: 'View Data', shortLabel: 'Data' },
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
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(30px, -30px) scale(1.1)',
          },
          '50%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '75%': {
            transform: 'translate(20px, -10px) scale(1.05)',
          },
        },
      }}
    >
      {/* Floating decorative icons */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
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
        📚
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          fontSize: { xs: '70px', md: '120px' },
          opacity: 0.04,
          zIndex: 0,
          animation: 'floatIcon 18s ease-in-out infinite',
          animationDelay: '2s',
        }}
      >
        🎓
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '15%',
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
            {isSmallMobile ? 'Admin' : 'Admin Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {!isSmallMobile && (
              <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {user?.username}
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
                minWidth: { xs: 60, sm: 100, md: 120 },
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
                left: '10%',
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
                mb: { xs: 2, sm: 3 }, 
                fontWeight: 700,
                textAlign: { xs: 'center', sm: 'left' },
                position: 'relative',
                zIndex: 1,
              }}
            >
              Welcome to Admin Panel
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
              Select an option from the tabs above or click on the cards below
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {/* Create Faculty */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
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
                      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(1)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                      }}
                    >
                      <PersonAdd sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Create Faculty
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      Add faculty members
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Create Student */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(118, 75, 162, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(2)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(118, 75, 162, 0.4)',
                      }}
                    >
                      <School sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Create Student
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      Register students
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Create Quiz */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(40, 167, 69, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(40, 167, 69, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(3)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(40, 167, 69, 0.4)',
                      }}
                    >
                      <Quiz sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Create Quiz
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      AI-powered quizzes
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Manage Quizzes */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(255, 193, 7, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(4)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'warning.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(255, 193, 7, 0.4)',
                      }}
                    >
                      <ManageSearch sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Manage Quizzes
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      View and manage
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Generate Timetable */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(220, 53, 69, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(220, 53, 69, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(5)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'error.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(220, 53, 69, 0.4)',
                      }}
                    >
                      <CalendarMonth sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Generate Timetable
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      Smart generator
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Manage Timetables */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #17a2b8 0%, #138496 100%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-30px',
                      right: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(23, 162, 184, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(23, 162, 184, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(6)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'info.main',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(23, 162, 184, 0.4)',
                      }}
                    >
                      <ViewTimeline sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Manage Timetables
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      View all timetables
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* View Data */}
              <Grid item xs={6} sm={4} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 160, sm: 180, md: 200 },
                    transition: 'transform 0.3s, box-shadow 0.3s',
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
                      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleCardClick(7)} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.dark',
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        mb: { xs: 1.5, sm: 2 },
                        boxShadow: '0 4px 14px rgba(76, 95, 213, 0.4)',
                      }}
                    >
                      <Visibility sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      View Data
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                      }}
                    >
                      View all records
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && <CreateFaculty />}
        {activeTab === 2 && <CreateStudent />}
        {activeTab === 3 && <CreateQuiz />}
        {activeTab === 4 && <ManageQuizzes />}
        {activeTab === 5 && <GenerateTimetable />}
        {activeTab === 6 && <ManageTimetables />}
        {activeTab === 7 && <ViewData />}
      </Container>
    </Box>
  );
};

export default AdminDashboard;