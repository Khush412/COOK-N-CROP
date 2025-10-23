import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, user, loading } = useAuth();  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, p: 4, fontFamily: 'inherit' }}>
        <Typography variant="h4" sx={{ fontFamily: 'inherit' }}>Access Denied</Typography>
        <Typography sx={{ fontFamily: 'inherit' }}>You do not have permission to view this page.</Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;