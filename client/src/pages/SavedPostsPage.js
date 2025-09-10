import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Alert,
  Grid,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';

const SavedPostsPage = () => {
  const { user, updateUserSavedPosts } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingPosts, setSavingPosts] = useState([]); // For loading state on save button

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const res = await userService.getSavedPosts();
        if (res.success) {
          setSavedPosts(res.data);
        } else {
          throw new Error(res.message || 'Failed to fetch saved posts.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching saved posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, []);

  const handleToggleSave = async (postId) => {
    setSavingPosts(prev => [...prev, postId]);
    try {
      const res = await userService.toggleSavePost(postId);
      if (res.success) {
        updateUserSavedPosts(res.savedPosts);
        // Remove the post from the current view
        setSavedPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      // Handle error, maybe show a snackbar
    } finally {
      setSavingPosts(prev => prev.filter(id => id !== postId));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        My Saved Posts
      </Typography>
      {savedPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            You haven't saved any posts yet.
          </Typography>
          <Button component={RouterLink} to="/community" variant="contained" sx={{ mt: 2 }}>
            Explore Community
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savedPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard
                post={post}
                user={user}
                onUpvote={() => {}} // Upvoting is handled on the community page
                upvotingPosts={[]}
                onToggleSave={handleToggleSave}
                savingPosts={savingPosts}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SavedPostsPage;
