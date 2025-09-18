import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { resetPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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
    <Container component="main" maxWidth="sm" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Reset Password
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Choose a new, strong password.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
          <LockResetIcon />
        </Avatar>
        <Typography color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
          Enter your new password below.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={2} alignItems="center">
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
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading || !!success} sx={{ py: 1.5, fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px' }}>
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;