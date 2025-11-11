import React, { useState } from 'react';
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
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import LockResetIcon from '@mui/icons-material/LockReset';
import Loader from '../custom_components/Loader';

const ForgotPasswordPage = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ message: '', severity: 'info' });
    try {
      const res = await forgotPassword(email);
      setFeedback({ message: res.message, severity: 'success' });
    } catch (error) {
      setFeedback({ message: error.message || 'An error occurred.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Forgot Password
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          We'll help you get back into your account.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
          <LockResetIcon />
        </Avatar>
        <Typography color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
          No worries! Enter your email and we'll send you a reset link.
        </Typography>

        {feedback.message && <Alert severity={feedback.severity} sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily }}>{feedback.message}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={2} alignItems="center">
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || feedback.severity === 'success'}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || feedback.severity === 'success'}
              sx={{ py: 1.5, fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px' }}
            >
              {loading ? <Loader size="small" /> : 'Send Reset Link'}
            </Button>
            <Button component={RouterLink} to="/login" sx={{ fontFamily: theme.typography.fontFamily }}>
              Back to Login
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;