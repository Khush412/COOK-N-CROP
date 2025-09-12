import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Paper,
  Chip,
  TextField,
  Slider,
  Button,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  Forum as ForumIcon,
  Whatshot as WhatshotIcon,
} from "@mui/icons-material";
import communityService from '../services/communityService';
import userService from '../services/userService';
import PostCard from '../components/PostCard';

const RecipesPage = () => {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [prepTime, setPrepTime] = useState(120);
  const [servings, setServings] = useState(1);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await communityService.getPosts(sort, page, {
          isRecipe: true,
          search: debouncedSearchTerm,
          tags: selectedTags,
          maxPrepTime: prepTime < 120 ? prepTime : undefined, // Only send if not max
          minServings: servings > 1 ? servings : undefined, // Only send if not min
        });
        setPosts(data.posts);
        setTotalPages(data.pages);
        setError(null);
      } catch (err) {
        setError('Failed to load recipes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [page, sort, debouncedSearchTerm, selectedTags, prepTime, servings]);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      const tags = await communityService.getTrendingTags();
      setTrendingTags(tags);
    };
    fetchTrendingTags().catch(console.error);
  }, []);

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return;
    if (upvotingPosts.includes(postId)) return;
    setUpvotingPosts((prev) => [...prev, postId]);
    const originalPosts = [...posts];
    const postIndex = posts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;
    const postToUpdate = { ...posts[postIndex] };
    const hasUpvoted = postToUpdate.upvotes.includes(user.id);
    const updatedPost = {
      ...postToUpdate,
      upvotes: hasUpvoted ? postToUpdate.upvotes.filter((id) => id !== user.id) : [...postToUpdate.upvotes, user.id],
      upvoteCount: hasUpvoted ? postToUpdate.upvoteCount - 1 : postToUpdate.upvoteCount + 1,
    };
    const newPosts = [...posts];
    newPosts[postIndex] = updatedPost;
    setPosts(newPosts);
    try {
      await communityService.toggleUpvote(postId);
    } catch (err) {
      setPosts(originalPosts);
      setSnackbar({ open: true, message: 'Failed to update vote.', severity: 'error' });
    } finally {
      setUpvotingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) return;
    setSavingPosts(prev => [...prev, postId]);
    try {
      const res = await userService.toggleSavePost(postId);
      if (res.success) {
        updateUserSavedPosts(res.savedPosts);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save post.', severity: 'error' });
    } finally {
      setSavingPosts(prev => prev.filter(id => id !== postId));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setPage(1); // Reset to first page on sort change
      setSort(newSort);
    }
  };

  const handleTagClick = (tagToToggle) => {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(tagToToggle)
        ? prev.filter((tag) => tag !== tagToToggle)
        : [...prev, tagToToggle]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4 }}>
        Community Recipes
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end" alignItems="center" sx={{ mb: 4 }}>
        <TextField
          label="Search Recipes by Title or Tag"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <ToggleButtonGroup
          value={sort}
          exclusive
          onChange={handleSortChange}
          aria-label="recipe sorting"
        >
          <ToggleButton value="new" aria-label="sort by new">
            <NewReleasesIcon sx={{ mr: 1 }} />
            Newest
          </ToggleButton>
          <ToggleButton value="top" aria-label="sort by top">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Top Rated
          </ToggleButton>
          <ToggleButton value="discussed" aria-label="sort by most discussed">
            <ForumIcon sx={{ mr: 1 }} />
            Discussed
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
          <WhatshotIcon color="error" sx={{ mr: 1 }} />
          Filter by Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {trendingTags.length > 0 ? trendingTags.map(item => (
            <Chip
              key={item.tag}
              label={item.tag}
              onClick={() => handleTagClick(item.tag)}
              clickable
              color={selectedTags.includes(item.tag) ? 'secondary' : 'default'}
              variant={selectedTags.includes(item.tag) ? 'filled' : 'outlined'}
            />
          )) : (
            <Typography variant="body2" color="text.secondary">No trending tags right now.</Typography>
          )}
          {selectedTags.length > 0 && (
            <Button size="small" onClick={() => setSelectedTags([])} sx={{ ml: 1, textTransform: 'none' }}>
              Clear Filters
            </Button>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Max Prep Time: {prepTime < 120 ? `${prepTime} mins` : 'Any'}
          </Typography>
          <Slider
            value={prepTime}
            onChange={(e, newValue) => setPrepTime(newValue)}
            step={15}
            marks={[{ value: 15, label: '15' }, { value: 60, label: '60' }, { value: 120, label: 'Any' }]}
            min={15}
            max={120}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
            Min Servings: {servings}
          </Typography>
          <Slider
            value={servings}
            onChange={(e, newValue) => setServings(newValue)}
            step={1}
            marks
            min={1}
            max={8}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : posts.length === 0 ? (
        <Alert severity="info">No recipes have been shared yet. Be the first!</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
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
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" />
            </Box>
          )}
        </>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipesPage;
