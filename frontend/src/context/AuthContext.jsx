import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch current check-in status
        refreshCheckIn();
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (registerNumber, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        registerNumber,
        password,
      });

      const { token, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Update state
      setUser(userData);

      // Fetch current check-in status
      await refreshCheckIn();

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CHECK_IN);
    setUser(null);
    setCheckIn(null);
  };

  // Refresh check-in status
  const refreshCheckIn = async () => {
    try {
      const response = await apiClient.get('/checkins/current');
      const data = response.data;
      
      // Handle both null and empty array responses
      if (data && !Array.isArray(data) && Object.keys(data).length > 0) {
        setCheckIn(data);
        localStorage.setItem(STORAGE_KEYS.CHECK_IN, JSON.stringify(data));
      } else if (data && !!Array.isArray(data) && data.length > 0) {
        setCheckIn(data[0]);
        localStorage.setItem(STORAGE_KEYS.CHECK_IN, JSON.stringify(data[0]));
      } else {
        setCheckIn(null);
        localStorage.removeItem(STORAGE_KEYS.CHECK_IN);
      }
    } catch (error) {
      console.error('Failed to fetch check-in status:', error);
      setCheckIn(null);
    }
  };

  // Update check-in state
  const updateCheckIn = (checkInData) => {
    setCheckIn(checkInData);
    if (checkInData) {
      localStorage.setItem(STORAGE_KEYS.CHECK_IN, JSON.stringify(checkInData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CHECK_IN);
    }
  };

  const value = {
    user,
    checkIn,
    loading,
    login,
    logout,
    refreshCheckIn,
    setCheckIn: updateCheckIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
