import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../config/axios';

// Create Auth Context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token
  const loadUser = useCallback(async () => {
    if (localStorage.getItem('token')) {
      try {
        const res = await api.get('/auth/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: res.data.user,
            token: localStorage.getItem('token')
          }
        });
      } catch (error) {
        localStorage.removeItem('token');
        dispatch({
          type: 'AUTH_FAIL',
          payload: error.response?.data?.message || 'Failed to load user'
        });
      }
    } else {
      dispatch({ type: 'AUTH_FAIL', payload: null });
    }
  }, []);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const res = await api.post('/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      return { success: false, message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const code = error.response?.data?.code;
      const status = error.response?.status;
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      return { success: false, message, status, code };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/auth/profile', userData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: res.data.user
      });
      
      return { success: true, user: res.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const res = await api.put('/auth/preferences', { preferences });
      
      dispatch({
        type: 'UPDATE_USER',
        payload: { preferences: res.data.preferences }
      });
      
      return { success: true, preferences: res.data.preferences };
    } catch (error) {
      const message = error.response?.data?.message || 'Preferences update failed';
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = (token) => {
    localStorage.setItem('token', token);
    loadUser();
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    updatePreferences,
    clearError,
    handleOAuthCallback,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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
