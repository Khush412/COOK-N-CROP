import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, TextField, Button, Rating, Alert, Snackbar, alpha, useMediaQuery, useTheme
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Feedback as FeedbackIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import supportService from '../services/supportService';
import Loader from '../custom_components/Loader';

const FeedbackPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      // Prepare data for submission
      const feedbackData = {
        name: formData.name,
        email: formData.email,
        subject: 'Feedback',
        message: `Category: ${formData.category}\nRating: ${formData.rating} stars\n\n${formData.message}`
      };

      // Send feedback to backend
      await supportService.sendMessage(feedbackData);
      
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
    <Container maxWidth="md" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
      <Paper sx={{ p: { xs: 4, sm: 5, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3.5, sm: 4 } }}>
          <FeedbackIcon sx={{ fontSize: isMobile ? 24 : 32, color: theme.palette.primary.main, mr: isMobile ? 1 : 1.5 }} />
          <Box>
            <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
              Share Your Feedback
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Help us improve your experience
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: { xs: 3.5, sm: 4 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' }, lineHeight: 1.6 }}>
          We value your opinion and would love to hear about your experience with Cook'n'Crop. 
          Your feedback helps us identify areas for improvement and create a better platform for everyone.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
              Overall Experience
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                size={isMobile ? "small" : "large"}
                sx={{ mr: isMobile ? 1 : 2 }}
              />
              <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {formData.rating} out of 5 stars
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
              Feedback Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 0.5 : 1 }}>
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
                    textTransform: 'none',
                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                    py: isMobile ? 0.5 : 1,
                    px: isMobile ? 1 : 2
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? category.label.split(' ')[0] : category.label}
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
            sx={{ mb: { xs: 2, sm: 3 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            size={isMobile ? "small" : "medium"}
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
            sx={{ mb: { xs: 2, sm: 3 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            size={isMobile ? "small" : "medium"}
          />
          
          <TextField
            fullWidth
            required
            multiline
            rows={isMobile ? 4 : 6}
            label="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: { xs: 2, sm: 3 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '1rem' } } }}
            size={isMobile ? "small" : "medium"}
          />
          
          <Button
            type="submit"
            variant="contained"
            size={isMobile ? "small" : "large"}
            fullWidth
            disabled={loading}
            startIcon={loading ? <Loader size="small" color="inherit" /> : <SendIcon />}
            sx={{ 
              py: isMobile ? 1 : 1.5, 
              fontFamily: theme.typography.fontFamily, 
              fontWeight: 'bold', 
              borderRadius: '50px',
              fontSize: { xs: '0.85rem', sm: '1rem' }
            }}
          >
            {loading ? (isMobile ? 'Submitting' : 'Submit Feedback') : (isMobile ? 'Submit' : 'Submit Feedback')}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackPage;