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
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import communityService from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

const SavedPostsPage = () => {
  const theme = useTheme();
  const { user, updateUserSavedPosts } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingPosts, setSavingPosts] = useState([]); // For loading state on save button
  const [upvotingPosts, setUpvotingPosts] = useState([]); // For loading state on upvote button

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

  const handleUpvote = async (postId) => {
    if (!user) return;
    if (upvotingPosts.includes(postId)) return;
    setUpvotingPosts((prev) => [...prev, postId]);
    const originalPosts = [...savedPosts];
    const postIndex = savedPosts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;
    const postToUpdate = { ...savedPosts[postIndex] };
    const hasUpvoted = postToUpdate.upvotes.includes(user.id);
    const updatedPost = {
      ...postToUpdate,
      upvotes: hasUpvoted ? postToUpdate.upvotes.filter((id) => id !== user.id) : [...postToUpdate.upvotes, user.id],
      upvoteCount: hasUpvoted ? postToUpdate.upvoteCount - 1 : postToUpdate.upvoteCount + 1,
    };
    const newPosts = [...savedPosts];
    newPosts[postIndex] = updatedPost;
    setSavedPosts(newPosts);
    try {
      await communityService.toggleUpvote(postId);
    } catch (err) {
      setSavedPosts(originalPosts);
    } finally {
      setUpvotingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

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
      <Container maxWidth="md" sx={{ py: 4, mt: 12 }}>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          My Saved Posts
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Your collection of favorite posts and recipes.
        </Typography>
      </Paper>
      {savedPosts.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <BookmarksIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            You haven't saved any posts yet.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
            Click the bookmark icon on a post to save it for later.
          </Typography>
          <Button component={RouterLink} to="/community" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Explore Community
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savedPosts.filter(p => p).map((post) => (
            <Grid size={{ xs: 12, sm: 6 }} key={post._id}>
              <PostCard
                post={post}
                user={user}
                onUpvote={handleUpvote}
                upvotingPosts={upvotingPosts}
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
