import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Stack,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { resetPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import LockResetIcon from '@mui/icons-material/LockReset';
import Loader from '../custom_components/Loader';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { loginWithToken } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await resetPassword(token, password);
      setSuccess('Password reset successfully! Logging you in...');
      setTimeout(() => {
        loginWithToken(res.token, res.user);
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${theme.palette.primary.main}0D, ${theme.palette.secondary.main}0D)` }}>
        <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Reset Password
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
          Choose a new, strong password.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: isMobile ? 1 : 2, width: isMobile ? 40 : 56, height: isMobile ? 40 : 56 }}>
          <LockResetIcon sx={{ fontSize: isMobile ? 20 : 28 }} />
        </Avatar>
        <Typography color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
          Enter your new password below.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={isMobile ? 1.5 : 2} alignItems="center">
            <TextField
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !!success}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: isMobile ? 1 : 2,
                  fontSize: { xs: '0.85rem', sm: '1rem' }
                },
                '& .MuiInputBase-input': {
                  py: isMobile ? 1 : 1.5
                }
              }}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !!success}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: isMobile ? 1 : 2,
                  fontSize: { xs: '0.85rem', sm: '1rem' }
                },
                '& .MuiInputBase-input': {
                  py: isMobile ? 1 : 1.5
                }
              }}
              size={isMobile ? "small" : "medium"}
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={loading || !!success}
              sx={{ 
                py: isMobile ? 1 : 1.5, 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 'bold', 
                borderRadius: '50px',
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }}
              size={isMobile ? "small" : "large"}
            >
              {loading ? <Loader size="small" /> : (isMobile ? 'Reset' : 'Reset Password')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;