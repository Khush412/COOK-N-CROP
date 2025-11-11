import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, useTheme } from '@mui/material';
import Loader from '../custom_components/Loader';

export default function AuthCallback() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      navigate('/login?error=oauth_failed');
    } else if (token) {
      // Handle successful OAuth
      handleOAuthCallback(token);
      navigate('/');
    } else {
      // No token or error, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Loader size="large" />
      <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
        Completing authentication...
      </Typography>
    </Box>
  );
}
