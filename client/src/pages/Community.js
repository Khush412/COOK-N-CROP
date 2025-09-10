import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Message as MessageIcon,
  ThumbUp as ThumbUpIcon,
  Forum as ForumIcon,
  NewReleases as NewReleasesIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorefrontIcon from '@mui/icons-material/Storefront';
import communityService from '../services/communityService'; // Corrected path
import userService from '../services/userService';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';

export default function Community() {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const navigate = useNavigate();

  const communityStats = [
    { label: "Food Lovers", value: "2,847", icon: <PeopleIcon />, color: theme.palette.primary.main },
    { label: "Recipes Shared", value: "1,234", icon: <MenuBookIcon />, color: theme.palette.secondary.main },
    { label: "Local Farmers", value: "150+", icon: <LocalFloristIcon />, color: theme.palette.success.main },
    { label: "Discussions", value: "3,456", icon: <MessageIcon />, color: theme.palette.info.main },
  ];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sort, setSort] = useState('new'); // 'new', 'top', 'discussed'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setPage(1); // Reset to first page on new search
      }
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    // Scroll to top when page or filters change
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    const fetchPosts = async () => {
      try {
        setLoading(true);
        // If search is cleared and we are sorting by relevance, switch back to 'new'
        let currentSort = sort;
        if (!debouncedSearchTerm && sort === 'relevance') {
          setSort('new');
          currentSort = 'new';
        }
        const data = await communityService.getPosts(currentSort, debouncedSearchTerm, page); // This is correct
        setPosts(data.posts);
        setTotalPages(data.pages);
        setError(null);
      } catch (err) {
        setError('Failed to load community posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sort, debouncedSearchTerm, page]);

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/community');
    } else {
      setOpenCreatePost(true);
    }
  };

  const handleCloseCreatePost = () => {
    if (isSubmitting) return;
    setOpenCreatePost(false);
  };

  const handleCreatePostSubmit = async (postData) => {
    setIsSubmitting(true);
    try {
      const newPost = await communityService.createPost(postData);
      setPosts([newPost, ...posts]);
      setOpenCreatePost(false);
      setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create post. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/community');
      return;
    }
    if (upvotingPosts.includes(postId)) return;

    setUpvotingPosts((prev) => [...prev, postId]);

    const originalPosts = [...posts];
    const postIndex = posts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;

    const postToUpdate = { ...posts[postIndex] };
    const hasUpvoted = postToUpdate.upvotes.includes(user.id);

    // Optimistic UI update
    const updatedPost = {
      ...postToUpdate,
      upvotes: hasUpvoted
        ? postToUpdate.upvotes.filter((id) => id !== user.id)
        : [...postToUpdate.upvotes, user.id],
      upvoteCount: hasUpvoted
        ? postToUpdate.upvoteCount - 1
        : postToUpdate.upvoteCount + 1,
    };

    const newPosts = [...posts];
    newPosts[postIndex] = updatedPost;
    setPosts(newPosts);

    try {
      await communityService.toggleUpvote(postId);
    } catch (err) {
      setPosts(originalPosts); // Revert on error
      setSnackbar({ open: true, message: 'Failed to update vote.', severity: 'error' });
    } finally {
      setUpvotingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/community');
      return;
    }
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cook-N-Crop Community
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Connect with food lovers, share recipes, and get tips from local farmers and chefs.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {communityStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                  border: `1px solid ${stat.color}30`,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${stat.color}25`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Community Posts */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Community Posts
            </Typography>
            <TextField
              label="Search Posts"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: 350 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <ToggleButtonGroup
              value={sort}
              exclusive
              onChange={handleSortChange}
              aria-label="post sorting"
            >
              {debouncedSearchTerm && (
                <ToggleButton value="relevance" aria-label="sort by relevance">
                  <StarIcon sx={{ mr: 1 }} />
                  Relevance
                </ToggleButton>
              )}
              <ToggleButton value="new" aria-label="sort by new">
                <NewReleasesIcon sx={{ mr: 1 }} />
                New
              </ToggleButton>
              <ToggleButton value="top" aria-label="sort by top">
                <TrendingUpIcon sx={{ mr: 1 }} />
                Top
              </ToggleButton>
              <ToggleButton value="discussed" aria-label="sort by most discussed">
                <ForumIcon sx={{ mr: 1 }} />
                Discussed
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && posts.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 4 }}>
              No posts yet. Be the first to start a conversation!
            </Typography>
          )}
          <Grid container spacing={3}>
            {!loading && !error && posts.map((post) => (
              <Grid item xs={12} md={6} lg={4} key={post._id}>
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
        </Box>

        {/* Pagination Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          )}
        </Box>

        {/* Call to Action */}
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
            border: `1px solid ${theme.palette.primary.main}30`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
            Join the Conversation
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, maxWidth: 500, mx: "auto" }}>
            Share your favorite recipes, ask for cooking advice, and connect with other foodies in our growing community.
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenCreatePost}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Create a Post
          </Button>
        </Paper>

        <Dialog open={openCreatePost} onClose={handleCloseCreatePost} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Create a New Post</DialogTitle>
          <DialogContent>
            <CreatePostForm
              onSubmit={handleCreatePostSubmit}
              onCancel={handleCloseCreatePost}
              loading={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
