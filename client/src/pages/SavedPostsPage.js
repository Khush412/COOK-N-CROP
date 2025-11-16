import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
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
import Loader from '../custom_components/Loader';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', mt: { xs: 8, sm: 12 } }}>
        <Loader size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, mt: { xs: 8, sm: 12 } }}>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 12 }, py: { xs: 2, sm: 4 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
          My Saved Posts
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
          Your collection of favorite posts and recipes.
        </Typography>
      </Paper>
      
      {savedPosts.length === 0 ? (
        <Paper sx={{ p: { xs: 2, sm: 3, md: 6 }, textAlign: 'center', mt: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <BookmarksIcon sx={{ fontSize: { xs: 40, sm: 80 }, color: 'grey.400', mb: { xs: 1, sm: 2 } }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: { xs: 1, sm: 2 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            You haven't saved any posts yet.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: { xs: 1, sm: 1 }, fontFamily: theme.typography.fontFamily, mb: { xs: 2, sm: 3 }, maxWidth: { xs: '100%', sm: 500 }, mx: 'auto', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Click the bookmark icon on a post to save it for later.
          </Typography>
          <Button component={RouterLink} to="/community" variant="contained" sx={{ mt: { xs: 2, sm: 3 }, borderRadius: '50px', px: { xs: 2, sm: 4 }, fontFamily: theme.typography.fontFamily, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Explore Community
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and Search */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 } }}>
            <Stack direction="column" spacing={{ xs: 1, sm: 2 }} sx={{ width: '100%' }}>
              <TextField
                placeholder="Search saved posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: '20px', height: { xs: 36, sm: 40 } },
                  '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              
              <Stack direction="row" spacing={8} sx={{ width: '100%' }}>
                <FormControl sx={{ width: { xs: '50%', sm: 'auto' } }}>
                  <ToggleButtonGroup
                    value={sortOption}
                    exclusive
                    onChange={(e, newValue) => newValue && setSortOption(newValue)}
                    size="small"
                    sx={{ height: { xs: 36, sm: 40 }, width: { xs: '100%', sm: 'auto' } }}
                  >
                    <ToggleButton value="newest" sx={{ fontFamily: theme.typography.fontFamily, px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Newest
                    </ToggleButton>
                    <ToggleButton value="popular" sx={{ fontFamily: theme.typography.fontFamily, px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Popular
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <FormControl sx={{ width: { xs: '50%', sm: 'auto' } }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newValue) => newValue && setViewMode(newValue)}
                    size="small"
                    sx={{ height: { xs: 36, sm: 40 }, width: { xs: '100%', sm: 'auto' } }}
                  >
                    <ToggleButton value="grid" sx={{ fontFamily: theme.typography.fontFamily, px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <ViewModuleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    </ToggleButton>
                    <ToggleButton value="list" sx={{ fontFamily: theme.typography.fontFamily, px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <ViewListIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Stack>
            </Stack>
          </Paper>
          
          {paginatedPosts.length === 0 ? (
            <Paper sx={{ p: { xs: 2, sm: 3, md: 6 }, textAlign: 'center', mt: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                No saved posts found matching your search.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Grid container spacing={{ xs: 1, sm: 3 }}>
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
                <Stack spacing={{ xs: 1, sm: 2 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 4 } }}>
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