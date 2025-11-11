import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  alpha,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  NewReleases as NewReleasesIcon,
  Forum as ForumIcon,
  Restaurant as RestaurantIcon,
  Whatshot as WhatshotIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Bookmark as BookmarkIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  PushPin as PushPinIcon,
  MenuBook as MenuBookIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Clear as ClearIcon,
  ThumbUp as ThumbUpIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Apps as AppsIcon,
} from "@mui/icons-material";
import communityService from "../services/communityService";
import userService from "../services/userService";
import PostCard from "../components/PostCard";
import Loader from "../custom_components/Loader";

export default function PopularPostsPage() {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('card'); // 'card', 'compact', 'grid'
  const [sort, setSort] = useState("top");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Initialize search term from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
      setDebouncedSearchTerm(decodeURIComponent(searchParam));
    }
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await communityService.getPosts(sort, page, {
          isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
          tags: selectedTags,
          search: debouncedSearchTerm,
        });
        setPosts(data.posts);
        setTotalPages(data.pages);
        setError(null);
      } catch {
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sort, page, selectedTags, debouncedSearchTerm, contentFilter]);

  const handleCreateClick = () => {
    navigate('/create-post');
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return navigate("/login?redirect=/community/popular");
    if (upvotingPosts.includes(postId)) return;

    setUpvotingPosts((prev) => [...prev, postId]);
    const original = [...posts];
    const index = posts.findIndex((p) => p._id === postId);
    if (index === -1) return;

    const post = posts[index];
    const userHasUpvoted = post.upvotes.includes(user.id);
    const updatedPost = {
      ...post,
      upvotes: userHasUpvoted ? post.upvotes.filter((id) => id !== user.id) : [...post.upvotes, user.id],
      upvoteCount: userHasUpvoted ? post.upvoteCount - 1 : post.upvoteCount + 1,
    };
    const newPosts = [...posts];
    newPosts[index] = updatedPost;
    setPosts(newPosts);

    try {
      await communityService.toggleUpvote(postId);
    } catch {
      setPosts(original);
      setSnackbar({ open: true, message: "Failed to update vote.", severity: "error" });
    } finally {
      setUpvotingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) return navigate("/login?redirect=/community/popular");
    setSavingPosts((prev) => [...prev, postId]);
    try {
      const res = await userService.toggleSavePost(postId);
      if (res.success) updateUserSavedPosts(res.savedPosts);
    } catch {
      setSnackbar({ open: true, message: "Failed to save post.", severity: "error" });
    } finally {
      setSavingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSort(newSort);
      setPage(1);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTagClick = (tagToToggle) => {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(tagToToggle)
        ? prev.filter((tag) => tag !== tagToToggle)
        : [tagToToggle]
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: { xs: 8, md: 12 }, pb: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Hero Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pt: { xs: 4, sm: 6 },
            pb: { xs: 3, sm: 4 },
            mb: 3,
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.secondary.main, 0.15),
                border: `3px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Popular Posts
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 500 }}
            >
              Discover the most engaging content from our community
            </Typography>
          </Stack>
        </Box>

        {/* Two Column Layout - No Right Sidebar */}
        <Grid container spacing={3}>
          {/* Main Content - Full Width */}
          <Grid size={{ xs: 12 }}>
            <Stack spacing={2.5}>
              {/* Search Bar and Create Post Button */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search popular posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: theme.typography.fontFamily,
                      height: 40,
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: theme.typography.fontFamily,
                      fontSize: '0.875rem',
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  onClick={handleCreateClick}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    height: 40,
                    fontSize: '0.875rem',
                    px: 1.5,
                  }}
                >
                  Create
                </Button>
              </Box>
              
              {/* Filters and View Options */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {/* Content Filter Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={contentFilter}
                      onChange={(e) => {
                        setContentFilter(e.target.value);
                        setPage(1);
                      }}
                      sx={{ 
                        borderRadius: 2,
                        height: 36,
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': {
                          py: 1,
                          pl: 1.5,
                          pr: 3,
                        }
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="recipes">Recipes</MenuItem>
                      <MenuItem value="discussions">Discussions</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Sort Options Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      sx={{ 
                        borderRadius: 2,
                        height: 36,
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': {
                          py: 1,
                          pl: 1.5,
                          pr: 3,
                        }
                      }}
                    >
                      <MenuItem value="top">Top</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="hot">Hot</MenuItem>
                      <MenuItem value="discussed">Most Discussed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
                  size="small"
                  sx={{ height: 36 }}
                >
                  <ToggleButton value="card" sx={{ px: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <GridViewIcon sx={{ fontSize: 20 }} />
                  </ToggleButton>
                  <ToggleButton value="compact" sx={{ px: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <ViewListIcon sx={{ fontSize: 20 }} />
                  </ToggleButton>
                  <ToggleButton value="grid" sx={{ px: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <AppsIcon sx={{ fontSize: 20 }} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Loader size="medium" />
                </Box>
              )}
              {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
              {!loading && !error && posts.length === 0 && (
                viewMode !== 'grid' ? (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 8, 
                      textAlign: 'center', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="h5" sx={{ color: "text.secondary", fontSize: 20, fontWeight: 700, mb: 2 }}>
                      No posts found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your search or filters
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleCreateClick}
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                    >
                      Create Post
                    </Button>
                  </Paper>
                ) : (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 8, 
                      textAlign: 'center', 
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="h5" sx={{ color: "text.secondary", fontSize: 20, fontWeight: 700, mb: 2 }}>
                      No image posts found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your search or filters
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleCreateClick}
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                    >
                      Create Post
                    </Button>
                  </Paper>
                )
              )}
              
              {viewMode !== 'grid' ? (
                <Grid container spacing={2} sx={{ alignContent: 'flex-start' }}>
                  {posts.map((post) => (
                    <Grid size={{ xs: 12, md: 6 }} key={post._id} sx={{ display: 'flex' }}>
                      <React.Fragment>
                        {viewMode === 'card' && (
                          <PostCard
                            post={post}
                            user={user}
                            onUpvote={handleUpvote}
                            upvotingPosts={upvotingPosts}
                            onToggleSave={handleToggleSave}
                            savingPosts={savingPosts}
                            showSnackbar={setSnackbar}
                            displayMode="card"
                            sx={{ height: '100%' }}
                          />
                        )}
                        {viewMode === 'compact' && (
                          <PostCard
                            post={post}
                            user={user}
                            onUpvote={handleUpvote}
                            upvotingPosts={upvotingPosts}
                            onToggleSave={handleToggleSave}
                            savingPosts={savingPosts}
                            showSnackbar={setSnackbar}
                            displayMode="compact"
                            sx={{ height: '100%' }}
                          />
                        )}
                      </React.Fragment>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Grid view - only show posts with images
                <Grid container spacing={2}>
                  {posts.filter(post => post.media && post.media.length > 0).map((post) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                      <Box 
                        onClick={() => navigate(`/post/${post._id}`)}
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                          },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                        }}
                      >
                        <Box
                          component="img"
                          src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`}
                          alt={post.title}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <Box sx={{ p: 2 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: 16, 
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontFamily: theme.typography.fontFamily,
                              mb: 1,
                            }}
                          >
                            {post.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Avatar 
                              src={post.user?.profilePic ? `${process.env.REACT_APP_API_URL}${post.user.profilePic}` : undefined}
                              alt={post.user?.username || 'User'}
                              sx={{ width: 24, height: 24, fontSize: 12 }}
                            >
                              {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 500, 
                                color: 'text.secondary',
                                fontFamily: theme.typography.fontFamily,
                              }}
                            >
                              {post.user?.username || 'Unknown'}
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <Pagination
                    color="primary"
                    size="large"
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '50%',
                        fontWeight: 600,
                        fontSize: 15,
                      }
                    }}
                  />
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ open: false, message: "", severity: "success" })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
