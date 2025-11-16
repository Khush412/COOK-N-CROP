import React, { useState, useEffect, useRef, useCallback } from "react";
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
  useMediaQuery,
} from "@mui/material";
import {
  Explore as ExploreIcon,
  Search as SearchIcon,
  NewReleases as NewReleasesIcon,
  Forum as ForumIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
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

export default function ExploreAllPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card', 'compact', 'grid'
  const [sort, setSort] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Create refs for infinite scroll
  const observer = useRef();
  const lastPostRef = useRef();

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

  // Modified fetchPosts function for infinite scrolling
  const fetchPosts = useCallback(async (pageToFetch = 1, append = false) => {
    try {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const data = await communityService.getPosts(sort, pageToFetch, {
        isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
        tags: selectedTags,
        search: debouncedSearchTerm,
      });
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(pageToFetch < data.pages);
      setTotalPages(data.pages);
      setPage(pageToFetch);
      setError(null);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [sort, selectedTags, debouncedSearchTerm, contentFilter]);

  useEffect(() => {
    fetchPosts(1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sort, selectedTags, debouncedSearchTerm, contentFilter, fetchPosts]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loading || isLoadingMore) return;
    
    // Disconnect existing observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    const observerCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(page + 1, true);
      }
    };
    
    observer.current = new IntersectionObserver(observerCallback, {
      rootMargin: '100px'
    });
    
    // Observe the last post element if it exists
    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, isLoadingMore, hasMore, page, fetchPosts, viewMode, posts]);

  const handleCreateClick = () => {
    navigate('/create-post');
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return navigate("/login?redirect=/community/explore-all");
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
    if (!isAuthenticated) return navigate("/login?redirect=/community/explore-all");
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: { xs: 8, sm: 9, md: 10 }, pb: 1.5 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 1.5 } }}>
        <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: { xs: 1, sm: 1.5, md: 2 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 800, mb: 0.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
            Explore All Posts
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
            Discover new content from across our community.
          </Typography>
        </Paper>

        {/* Two Column Layout - No Right Sidebar */}
        <Grid container spacing={3}>
          {/* Main Content - Full Width */}
          <Grid size={{ xs: 12 }}>
            <Stack spacing={2.5}>
              {/* Search Bar and Create Post Button */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search all posts..."
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
                      py: 0.5,
                    }
                  }}
                />
                <Button
                  variant="contained"
                  // Show just "Create" text on mobile, "Create" with icon on desktop
                  startIcon={<AddIcon sx={{ fontSize: 18, display: { xs: 'none', md: 'inline' } }} />}
                  onClick={handleCreateClick}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    height: 40,
                    fontSize: '0.875rem',
                    px: 1,
                  }}
                >
                  Create
                </Button>
              </Box>
              
              {/* Filters and View Options */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                  {/* Content Filter Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 80, width: { xs: '40%', md: 'auto' } }}>
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
                  <FormControl size="small" sx={{ minWidth: 80, width: { xs: '40%', md: 'auto' } }}>
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
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="top">Top</MenuItem>
                      <MenuItem value="hot">Hot</MenuItem>
                      <MenuItem value="discussed">Most Discussed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {/* View Mode Toggle - Show on mobile with a more compact design */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
                  size="small"
                  sx={{ 
                    height: 36,
                    // Show on mobile with a more compact design
                    display: { xs: 'flex', md: 'flex' }
                  }}
                >
                  <ToggleButton value="card" sx={{ px: 1, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <GridViewIcon sx={{ fontSize: 16 }} />
                  </ToggleButton>
                  <ToggleButton value="compact" sx={{ px: 1, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <ViewListIcon sx={{ fontSize: 16 }} />
                  </ToggleButton>
                  <ToggleButton value="grid" sx={{ px: 1, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <AppsIcon sx={{ fontSize: 16 }} />
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
                  {posts.map((post, index) => (
                    <Grid size={{ xs: 12, md: 6 }} key={post._id} sx={{ display: 'flex' }}>
                      {viewMode === 'card' && (
                        <div ref={index === posts.length - 1 ? lastPostRef : null} style={{ width: '100%' }}>
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
                        </div>
                      )}
                      {viewMode === 'compact' && (
                        <div ref={index === posts.length - 1 ? lastPostRef : null} style={{ width: '100%' }}>
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
                        </div>
                      )}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Grid view - only show posts with images
                <Grid container spacing={2}>
                  {(() => {
                    const imagePosts = posts.filter(post => post.media && post.media.length > 0);
                    return imagePosts.map((post, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                        <Box 
                          ref={index === imagePosts.length - 1 ? lastPostRef : null}
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
                    ));
                  })()}
                </Grid>
              )}

              {/* Infinite Scroll Indicators */}
              {totalPages > 1 && (
                <>
                  {/* Loading indicator for infinite scroll */}
                  {isLoadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Loader size="medium" />
                    </Box>
                  )}

                  {/* End of content message */}
                  {!hasMore && posts.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 3, mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        You've reached the end of the content
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
