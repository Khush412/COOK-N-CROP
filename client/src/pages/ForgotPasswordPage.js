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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import LockResetIcon from '@mui/icons-material/LockReset';
import Loader from '../custom_components/Loader';

const ForgotPasswordPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    <Container component="main" maxWidth="sm" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${theme.palette.primary.main}0D, ${theme.palette.secondary.main}0D)` }}>
        <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Forgot Password
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
          We'll help you get back into your account.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: isMobile ? 1 : 2, width: isMobile ? 40 : 56, height: isMobile ? 40 : 56 }}>
          <LockResetIcon sx={{ fontSize: isMobile ? 20 : 28 }} />
        </Avatar>
        <Typography color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
          No worries! Enter your email and we'll send you a reset link.
        </Typography>

        {feedback.message && <Alert severity={feedback.severity} sx={{ width: '100%', mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{feedback.message}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={isMobile ? 1.5 : 2} alignItems="center">
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
              disabled={loading || feedback.severity === 'success'}
              sx={{ 
                py: isMobile ? 1 : 1.5, 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 'bold', 
                borderRadius: '50px',
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }}
              size={isMobile ? "small" : "large"}
            >
              {loading ? <Loader size="small" /> : (isMobile ? 'Send Link' : 'Send Reset Link')}
            </Button>
            <Button 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;