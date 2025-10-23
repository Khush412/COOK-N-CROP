import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Snackbar, Alert, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CreatePostForm from '../components/CreatePostForm';
import communityService from '../services/communityService';

const CreatePostPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Determine if we are creating a recipe based on the URL
  const isRecipe = location.pathname.includes('/create-recipe');

  const handleCreatePostSubmit = async (postData) => {
    setIsSubmitting(true);
    try {
      const newPost = await communityService.createPost(postData);
      setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
      // Redirect to the new post after a short delay
      setTimeout(() => navigate(`/post/${newPost._id}`), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create post. Please try again.', severity: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          {isRecipe ? 'Create a New Recipe' : 'Create a New Post'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          {isRecipe ? 'Share your culinary creation with the community.' : 'Share your thoughts, questions, or experiences.'}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <CreatePostForm
          onSubmit={handleCreatePostSubmit}
          onCancel={() => navigate(-1)} // Go back to the previous page
          loading={isSubmitting}
          forceRecipe={isRecipe}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreatePostPage;