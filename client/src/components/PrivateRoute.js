import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, p: 4 }}>
        <Typography variant="h4">Access Denied</Typography>
        <Typography>You do not have permission to view this page.</Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;