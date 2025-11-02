import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, TextField, Button, Rating, CircularProgress, Alert, Snackbar, alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Feedback as FeedbackIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const FeedbackPage = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    category: 'general',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    // Pre-fill form if user is logged in
    if (isAuthenticated && user) {
      setFormData(prev => ({ 
        ...prev, 
        name: user.username, 
        email: user.email 
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real application, you would send this to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({ 
        open: true, 
        message: 'Thank you for your feedback! We appreciate your input.', 
        severity: 'success' 
      });
      
      // Reset form but keep user details
      setFormData({
        name: isAuthenticated ? user.username : '',
        email: isAuthenticated ? user.email : '',
        rating: 5,
        category: 'general',
        message: ''
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to submit feedback. Please try again later.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FeedbackIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              Share Your Feedback
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Help us improve your experience
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3, fontFamily: theme.typography.fontFamily, fontSize: '1.1rem', lineHeight: 1.7 }}>
          We value your opinion and would love to hear about your experience with Cook'n'Crop. 
          Your feedback helps us identify areas for improvement and create a better platform for everyone.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: theme.typography.fontFamily }}>
              Overall Experience
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                size="large"
                sx={{ mr: 2 }}
              />
              <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                {formData.rating} out of 5 stars
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: theme.typography.fontFamily }}>
              Feedback Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { value: 'general', label: 'General Feedback' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'bug', label: 'Bug Report' },
                { value: 'community', label: 'Community' },
                { value: 'performance', label: 'Performance' },
                { value: 'other', label: 'Other' }
              ].map((category) => (
                <Button
                  key={category.value}
                  variant={formData.category === category.value ? 'contained' : 'outlined'}
                  onClick={() => setFormData({ ...formData, category: category.value })}
                  sx={{ 
                    borderRadius: '20px',
                    fontFamily: theme.typography.fontFamily,
                    textTransform: 'none'
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </Box>
          </Box>
          
          <TextField
            fullWidth
            required
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading || isAuthenticated}
            sx={{ mb: 3, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <TextField
            fullWidth
            required
            type="email"
            label="Your Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || isAuthenticated}
            sx={{ mb: 3, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <TextField
            fullWidth
            required
            multiline
            rows={6}
            label="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: 3, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ 
              py: 1.5, 
              fontFamily: theme.typography.fontFamily, 
              fontWeight: 'bold', 
              borderRadius: '50px' 
            }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackPage;