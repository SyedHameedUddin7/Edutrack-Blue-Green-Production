import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  // Fetch user profile from backend
  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize from localStorage and fetch fresh user data
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Loaded user from localStorage:', parsedUser);
          
          // Set token and configure axios
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Fetch fresh user data from backend to get latest profile picture
          const freshUserData = await fetchUserProfile(storedToken);
          
          if (freshUserData) {
            console.log('Fetched fresh user data:', freshUserData);
            setUser(freshUserData);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));
          } else {
            // If fetch fails, use stored data
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password, role) => {
    try {
      console.log('Sending login request:', { username, role });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
        role
      });
      
      console.log('Login response received:', response.data);
      const { token: newToken, user: newUser } = response.data;

      if (!newUser || !newUser.role) {
        console.error('Invalid user data received:', newUser);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      console.log('Setting user:', newUser);
      console.log('User role:', newUser.role);

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Persist to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data.message || 'Login failed' 
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if backend is running.'
        };
      } else {
        return {
          success: false,
          message: error.message
        };
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Function to update user profile (can be called after profile picture upload)
  const updateUserProfile = async () => {
    if (token) {
      const freshUserData = await fetchUserProfile(token);
      if (freshUserData) {
        setUser(freshUserData);
        localStorage.setItem('user', JSON.stringify(freshUserData));
        return true;
      }
    }
    return false;
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    API_URL,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};