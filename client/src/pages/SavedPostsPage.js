import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  Stack,
  Chip,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import communityService from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import {
  Bookmarks as BookmarksIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

const SavedPostsPage = () => {
  const theme = useTheme();
  const { user, updateUserSavedPosts } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingPosts, setSavingPosts] = useState([]); // For loading state on save button
  const [upvotingPosts, setUpvotingPosts] = useState([]); // For loading state on upvote button
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('newest');
  const [page, setPage] = useState(1);
  const postsPerPage = 6;

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

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = savedPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => b.upvoteCount - a.upvoteCount);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [savedPosts, searchTerm, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * postsPerPage;
    return filteredAndSortedPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredAndSortedPosts, page]);

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

  const handlePageChange = (event, value) => {
    setPage(value);
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
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            You haven't saved any posts yet.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
            Click the bookmark icon on a post to save it for later.
          </Typography>
          <Button component={RouterLink} to="/community" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Explore Community
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search saved posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '20px' },
                  '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
                }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              
              <FormControl>
                <ToggleButtonGroup
                  value={sortOption}
                  exclusive
                  onChange={(e, newValue) => newValue && setSortOption(newValue)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="newest" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    Newest
                  </ToggleButton>
                  <ToggleButton value="popular" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    Popular
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
              
              <FormControl>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newValue) => newValue && setViewMode(newValue)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="grid" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="list" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            </Stack>
          </Paper>
          
          {paginatedPosts.length === 0 ? (
            <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No saved posts found matching your search.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {paginatedPosts.filter(p => p).map((post) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                      <PostCard
                        post={post}
                        user={user}
                        onUpvote={handleUpvote}
                        upvotingPosts={upvotingPosts}
                        onToggleSave={handleToggleSave}
                        savingPosts={savingPosts}
                        showSnackbar={() => {}} // Snackbar not needed here as it's a core action
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={2}>
                  {paginatedPosts.filter(p => p).map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      user={user}
                      onUpvote={handleUpvote}
                      upvotingPosts={upvotingPosts}
                      onToggleSave={handleToggleSave}
                      savingPosts={savingPosts}
                      showSnackbar={() => {}} // Snackbar not needed here as it's a core action
                      displayMode="compact"
                    />
                  ))}
                </Stack>
              )}
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ 
                      '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                      '& .Mui-selected': { fontWeight: 'bold' }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default SavedPostsPage;