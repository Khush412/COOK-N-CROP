import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button, Divider,
  alpha,
  Drawer,
  FormControl,
  InputLabel,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  Forum as ForumIcon,
  Whatshot as WhatshotIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import communityService from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import PostCard from '../components/PostCard';

const RecipesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
  const [quickCook, setQuickCook] = useState(false); // Quick cook filter (under 30 mins)
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchRecipes = useCallback(async () => {
      try {
        setLoading(true);
        const data = await communityService.getPosts(sort, page, {
          isRecipe: true,
          search: debouncedSearchTerm,
          tags: selectedTags,
          maxPrepTime: quickCook ? 30 : (prepTime < 120 ? prepTime : undefined),
          minServings: servings > 1 ? servings : undefined,
        });
        setPosts(data.posts);
        setTotalPages(data.pages);
        setError(null);
      } catch (err) {
        setError('Failed to load recipes.');
      } finally {
        setLoading(false);
      }
    }, [sort, page, debouncedSearchTerm, selectedTags, prepTime, servings, quickCook]);

  useEffect(() => {
    fetchRecipes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchRecipes]);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      const cachedTags = sessionStorage.getItem('trendingTags');
      const cacheTime = sessionStorage.getItem('trendingTags_time');
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes cache duration

      if (cachedTags && cacheTime && (Date.now() - cacheTime < fiveMinutes)) {
        setTrendingTags(JSON.parse(cachedTags));
        return;
      }

      try {
        const tags = await communityService.getTrendingTags();
        setTrendingTags(tags);
        sessionStorage.setItem('trendingTags', JSON.stringify(tags));
        sessionStorage.setItem('trendingTags_time', Date.now());
      } catch (err) {
        console.error("Error fetching trending tags: ", err);
      }
    };
    fetchTrendingTags();
  }, []);

  const handleUpvote = useCallback(async (postId) => {
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
  }, [isAuthenticated, posts, upvotingPosts, user?.id]);

  const handleToggleSave = useCallback(async (postId) => {
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
  }, [isAuthenticated, updateUserSavedPosts]);

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

  const handleOpenCreatePost = () => {
    navigate('/create-recipe');
  };

  const FilterSidebar = () => (
    <Stack spacing={3}>
      {/* Quick Cook Filter */}
      <Paper sx={{ p: 2, borderRadius: 2, background: `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.warning.main, 0.08)})` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
          <TimerIcon sx={{ mr: 1, color: theme.palette.success.main }} />
          Quick Cook
        </Typography>
        <Chip
          label="⚡ Under 30 mins"
          onClick={() => { setQuickCook(!quickCook); setPage(1); }}
          color={quickCook ? 'success' : 'default'}
          variant={quickCook ? 'filled' : 'outlined'}
          sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, fontSize: '0.95rem', width: '100%', py: 2 }}
          clickable
        />
      </Paper>
      
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
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
              sx={{ fontFamily: theme.typography.fontFamily }}
            />
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No trending tags right now.</Typography>
          )}
          {selectedTags.length > 0 && (
            <Button size="small" onClick={() => setSelectedTags([])} sx={{ ml: 1, textTransform: 'none', fontFamily: theme.typography.fontFamily }}>
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={3} sx={{ px: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Max Prep Time</InputLabel>
            <Select
              value={prepTime}
              label="Max Prep Time"
              onChange={(e) => setPrepTime(e.target.value)}
              sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
              }}
            >
              <MenuItem value={120} sx={{ fontFamily: theme.typography.fontFamily }}>Any</MenuItem>
              <MenuItem value={15} sx={{ fontFamily: theme.typography.fontFamily }}>Under 15 mins</MenuItem>
              <MenuItem value={30} sx={{ fontFamily: theme.typography.fontFamily }}>Under 30 mins</MenuItem>
              <MenuItem value={45} sx={{ fontFamily: theme.typography.fontFamily }}>Under 45 mins</MenuItem>
              <MenuItem value={60} sx={{ fontFamily: theme.typography.fontFamily }}>Under 60 mins</MenuItem>
              <MenuItem value={90} sx={{ fontFamily: theme.typography.fontFamily }}>Under 90 mins</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Min Servings</InputLabel>
            <Select
              value={servings}
              label="Min Servings"
              onChange={(e) => setServings(e.target.value)}
              sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <MenuItem key={s} value={s} sx={{ fontFamily: theme.typography.fontFamily }}>{s} or more</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Explore Recipes
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Find inspiration from a community of passionate cooks.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Filters Sidebar */} 
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}> {/* Use size prop */}
          <Box sx={{ position: 'sticky', top: 100 }}>
            <FilterSidebar />
          </Box>
        </Grid>

        {/* Main Content */} 
        <Grid size={{ xs: 12, md: 9 }}> {/* Use size prop */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 2 }}>
            <TextField
              label="Search Recipes"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: '20px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            <ToggleButtonGroup value={sort} exclusive onChange={handleSortChange} aria-label="recipe sorting" sx={{ '& .MuiToggleButton-root': { fontFamily: theme.typography.fontFamily } }}>
              <ToggleButton value="new" aria-label="sort by new"><NewReleasesIcon sx={{ mr: 1 }} />Newest</ToggleButton>
              <ToggleButton value="top" aria-label="sort by top"><TrendingUpIcon sx={{ mr: 1 }} />Top Rated</ToggleButton>
              <ToggleButton value="discussed" aria-label="sort by most discussed"><ForumIcon sx={{ mr: 1 }} />Discussed</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={() => setMobileFiltersOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <FilterListIcon />
            </IconButton>
            <Button variant="contained" onClick={handleOpenCreatePost} startIcon={<AddIcon />} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Create Recipe</Button>
          </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      ) : posts.length === 0 ? (
        <Alert severity="info" sx={{ fontFamily: theme.typography.fontFamily }}>No recipes have been shared yet. Be the first!</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid size={{ xs: 12, sm: 6 }} key={post._id}>
                <PostCard
                  post={post}
                  user={user}
                  onUpvote={handleUpvote}
                  upvotingPosts={upvotingPosts}
                  onToggleSave={handleToggleSave}
                  savingPosts={savingPosts}
                  showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
                  displayMode="compact"
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
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>{snackbar.message}</Alert>
      </Snackbar>

      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <FilterSidebar />
      </Drawer>
    </Container>
  );
};

export default RecipesPage;
