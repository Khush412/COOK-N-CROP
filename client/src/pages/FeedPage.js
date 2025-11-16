import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Paper,
  Snackbar,
  alpha,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Drawer,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  useTheme,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import {
  DynamicFeed as DynamicFeedIcon,
  NewReleases as NewReleasesIcon,
  TrendingUp as TrendingUpIcon,
  Forum as ForumIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  Group as GroupIcon,
  Person as PersonIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Apps as AppsIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import communityService from '../services/communityService';
import userService from '../services/userService';
import groupService from '../services/groupService';
import PostCard from '../components/PostCard';
import Loader from '../custom_components/Loader';

const FeedPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('card'); // 'card', 'compact', 'grid'
  const [sort, setSort] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [prepTime, setPrepTime] = useState(120);
  const [servings, setServings] = useState(1);
  const [quickCook, setQuickCook] = useState(false); // Quick cook filter (under 30 mins)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedGroups, setRecommendedGroups] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // State for collapsible sections
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true); // New state for groups section
  
  // Create refs for infinite scroll
  const observer = useRef();
  const lastPostRef = useRef();

  // Modified fetchFeed function for infinite scrolling
  const fetchFeed = useCallback(async (pageToFetch = 1, append = false) => {
    try {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const data = await communityService.getPosts(sort, pageToFetch, {
        isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
        search: debouncedSearchTerm,
        tags: selectedTags,
        maxPrepTime: quickCook ? 30 : (prepTime < 120 ? prepTime : undefined),
        minServings: servings > 1 ? servings : undefined,
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
    } catch (err) {
      setError('Failed to load your feed.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [sort, debouncedSearchTerm, selectedTags, contentFilter, prepTime, servings, quickCook]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/feed');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, isAuthenticated, navigate]);

  useEffect(() => {
    fetchFeed(1, false);
    
    // Also fetch recommendations when feed is loaded
    if (user) {
      fetchRecommendations();
    }
  }, [sort, debouncedSearchTerm, selectedTags, contentFilter, prepTime, servings, quickCook, user, fetchFeed]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loading || isLoadingMore) return;
    
    // Disconnect existing observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    const observerCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchFeed(page + 1, true);
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
  }, [loading, isLoadingMore, hasMore, page, fetchFeed, viewMode, posts]);

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

  useEffect(() => {
    // Fetch recommendations when component mounts
    if (user) {
      console.log('Fetching recommendations for user:', user); // Debug log
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setRecommendationsLoading(true);
    try {
      // Fetch recommended users using the existing getRecommendations function
      const recommendations = await userService.getRecommendations();
      console.log('Full recommendations data:', recommendations); // Debug log
      
      // Handle different response formats
      if (recommendations.users && recommendations.groups) {
        // New format with separate users and groups
        setRecommendedUsers(Array.isArray(recommendations.users) ? recommendations.users : []);
        setRecommendedGroups(Array.isArray(recommendations.groups) ? recommendations.groups : []);
        console.log('Set recommended users:', recommendations.users); // Debug log
        console.log('Set recommended groups:', recommendations.groups); // Debug log
      } else if (Array.isArray(recommendations)) {
        // Old format - assume all are users for now
        setRecommendedUsers(recommendations.filter(item => item && !item.memberCount) || []);
        setRecommendedGroups(recommendations.filter(item => item && item.memberCount) || []);
        console.log('Legacy format - users:', recommendations.filter(item => item && !item.memberCount)); // Debug log
        console.log('Legacy format - groups:', recommendations.filter(item => item && item.memberCount)); // Debug log
      } else {
        // Fallback to empty arrays
        setRecommendedUsers([]);
        setRecommendedGroups([]);
        console.log('Fallback to empty arrays'); // Debug log
      }
    } catch (err) {
      console.error("Error fetching recommendations: ", err);
      // Set empty arrays on error
      setRecommendedUsers([]);
      setRecommendedGroups([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleUpvote = async (postId) => {
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

  const handleTagClick = (tagToToggle) => {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(tagToToggle)
        ? prev.filter((tag) => tag !== tagToToggle)
        : [...prev, tagToToggle]
    );
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const FilterDropdown = () => (
    <Box sx={{ p: 1.5, minWidth: 300 }}>
      <Stack spacing={2}>
        {/* Content Filter */}
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>
            Content Type
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={contentFilter}
              onChange={(e) => {
                setContentFilter(e.target.value);
                setPage(1);
                setMobileFiltersOpen(false); // Close drawer after selection
              }}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                height: 36,
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
                disableScrollLock: true,
              }}
            >
              <MenuItem value="all">All Posts</MenuItem>
              <MenuItem value="recipes">Recipes Only</MenuItem>
              <MenuItem value="discussions">Discussions Only</MenuItem>
            </Select>
          </FormControl>
        </Paper>
        
        {/* Sort Options */}
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>
            Sort By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={sort}
              onChange={(e) => { 
                setSort(e.target.value); 
                setPage(1);
                setMobileFiltersOpen(false); // Close drawer after selection
              }}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                height: 36,
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
                disableScrollLock: true,
              }}
            >
              <MenuItem value="new">Newest First</MenuItem>
              <MenuItem value="top">Top Rated</MenuItem>
              <MenuItem value="hot">Hot Posts</MenuItem>
              <MenuItem value="discussed">Most Discussed</MenuItem>
            </Select>
          </FormControl>
        </Paper>
        
        {/* Quick Cook Filter */}
        <Paper sx={{ p: 1.5, borderRadius: 2, background: `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.warning.main, 0.08)})` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
            <TimerIcon sx={{ mr: 1, color: theme.palette.success.main }} />
            Quick Cook Options
          </Typography>
          <Chip
            label="⚡ Under 30 mins"
            onClick={() => { 
              setQuickCook(!quickCook); 
              setPage(1);
              setMobileFiltersOpen(false); // Close drawer after selection
            }}
            color={quickCook ? 'success' : 'default'}
            variant={quickCook ? 'filled' : 'outlined'}
            sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, fontSize: '0.9rem', width: '100%', py: 1.5 }}
            clickable
          />
        </Paper>
        
        {/* Prep Time Filter */}
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>
            Max Prep Time
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={prepTime}
              onChange={(e) => { 
                setPrepTime(e.target.value); 
                setPage(1);
                setMobileFiltersOpen(false); // Close drawer after selection
              }}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                height: 36,
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
                disableScrollLock: true,
              }}
            >
              <MenuItem value={120} sx={{ fontFamily: theme.typography.fontFamily }}>Any Duration</MenuItem>
              <MenuItem value={15} sx={{ fontFamily: theme.typography.fontFamily }}>Under 15 mins</MenuItem>
              <MenuItem value={30} sx={{ fontFamily: theme.typography.fontFamily }}>Under 30 mins</MenuItem>
              <MenuItem value={45} sx={{ fontFamily: theme.typography.fontFamily }}>Under 45 mins</MenuItem>
              <MenuItem value={60} sx={{ fontFamily: theme.typography.fontFamily }}>Under 60 mins</MenuItem>
              <MenuItem value={90} sx={{ fontFamily: theme.typography.fontFamily }}>Under 90 mins</MenuItem>
            </Select>
          </FormControl>
        </Paper>
        
        {/* Servings Filter */}
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>
            Minimum Servings
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={servings}
              onChange={(e) => { 
                setServings(e.target.value); 
                setPage(1);
                setMobileFiltersOpen(false); // Close drawer after selection
              }}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                height: 36,
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily },
                  },
                },
                disableScrollLock: true,
              }}
            >
              <MenuItem value={1} sx={{ fontFamily: theme.typography.fontFamily }}>Any Number</MenuItem>
              {[2, 3, 4, 5, 6, 7, 8].map(s => (
                <MenuItem key={s} value={s} sx={{ fontFamily: theme.typography.fontFamily }}>{s} or more</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => {
              // Reset all filters
              setContentFilter('all');
              setSort('new');
              setQuickCook(false);
              setPrepTime(120);
              setServings(1);
              setSelectedTags([]);
              setPage(1);
            }}
            sx={{ borderRadius: 2, py: 0.75, fontSize: '0.875rem' }}
          >
            Reset All
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => setMobileFiltersOpen(false)}
            sx={{ borderRadius: 2, py: 0.75, fontSize: '0.875rem' }}
          >
            Apply Filters
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  const RecommendationsSidebar = () => (
    <Paper 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        height: 'auto',
        maxHeight: 'none',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={3} sx={{ flex: 1, overflow: 'visible' }}>
        {/* Recommended Users */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
              <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Recommended Users
            </Typography>
            <IconButton size="small" onClick={() => setRecommendationsOpen(!recommendationsOpen)}>
              {recommendationsOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
          <Collapse in={recommendationsOpen}>
            <Box sx={{ maxHeight: 'none', overflowY: 'visible', overflowX: 'hidden' }}>
              {recommendationsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Loader size="small" />
                </Box>
              ) : recommendedUsers && recommendedUsers.length > 0 ? (
                <List dense>
                  {recommendedUsers.map((recommendedUser) => (
                    <ListItem 
                      key={recommendedUser._id} 
                      sx={{ px: 0, py: 1, cursor: 'pointer' }}
                      onClick={() => {
                        console.log('Navigating to user:', recommendedUser); // Debug log
                        navigate(`/user/${recommendedUser.username}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={recommendedUser.profilePic ? `${process.env.REACT_APP_API_URL}${recommendedUser.profilePic}` : undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          {recommendedUser.username ? recommendedUser.username.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={recommendedUser.username || 'Unknown User'}
                        primaryTypographyProps={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 600,
                          fontFamily: theme.typography.fontFamily 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textAlign: 'center', py: 1 }}>
                  {recommendationsLoading ? 'Loading...' : 'Follow more users to get personalized recommendations'}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Paper>

        {/* Recommended Groups */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
              <GroupIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
              Recommended Groups
            </Typography>
            <IconButton size="small" onClick={() => setGroupsOpen(!groupsOpen)}> {/* Use separate state for groups */}
              {groupsOpen ? <ExpandLess /> : <ExpandMore />} {/* Use separate state for groups */}
            </IconButton>
          </Stack>
          <Collapse in={groupsOpen}> {/* Use separate state for groups */}
            <Box sx={{ maxHeight: 'none', overflowY: 'visible', overflowX: 'hidden' }}>
              {recommendationsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Loader size="small" />
                </Box>
              ) : recommendedGroups && recommendedGroups.length > 0 ? (
                <List dense>
                  {recommendedGroups.map((group) => (
                    <ListItem 
                      key={group._id} 
                      sx={{ px: 0, py: 1, cursor: 'pointer' }}
                      onClick={() => {
                        console.log('Navigating to group:', group); // Debug log
                        navigate(`/g/${group.slug}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={group.coverImage ? `${process.env.REACT_APP_API_URL}${group.coverImage}` : undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={group.name || 'Unnamed Group'}
                        secondary={`${group.memberCount || 0} members`}
                        primaryTypographyProps={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 600,
                          fontFamily: theme.typography.fontFamily 
                        }}
                        secondaryTypographyProps={{ 
                          fontSize: '0.75rem',
                          fontFamily: theme.typography.fontFamily 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textAlign: 'center', py: 1 }}>
                  {recommendationsLoading ? 'Loading...' : 'Join more groups to get personalized recommendations'}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Paper>
      </Stack>
    </Paper>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Loader size="medium" />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (posts.length === 0) {
      return (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <DynamicFeedIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Your feed is empty.</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
            Follow some users or join groups to see their posts here.
          </Typography>
          <Button component={RouterLink} to="/community" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Explore Community
          </Button>
        </Paper>
      );
    }

    return (
      <>
        {viewMode !== 'grid' ? (
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ alignContent: 'flex-start' }}>
            {posts.map((post, index) => (
              <Grid 
                size={{ xs: 12, md: viewMode === 'compact' ? 12 : 6 }} 
                key={post._id} 
                sx={{ display: 'flex' }}
              >
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
          <Grid container spacing={{ xs: 1, md: 2 }}>
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
      </>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 8, sm: 9 }, py: { xs: 1, md: 1.5 } }}>
      <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: { xs: 1, sm: 1.5, md: 2 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 800, mb: 0.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
          My Feed
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
          Posts from the creators you follow.
        </Typography>
      </Paper>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ pr: { md: 2 }, px: { xs: 0.5, md: 0 } }}>
          {/* Search Bar and Create Post Button */}
          <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, mb: { xs: 1.5, md: 2 } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                borderRadius: { xs: 2, md: 3 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, md: 3 },
                  fontFamily: theme.typography.fontFamily,
                  height: { xs: 32, md: 44 },
                },
                '& .MuiInputBase-input': {
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.8rem', md: '1rem' },
                  py: { xs: 0.25, md: 1 },
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: { xs: 14, md: 16 } }} />}
              onClick={handleCreatePost}
              sx={{ 
                borderRadius: { xs: 3, md: 4 },
                fontWeight: 600,
                whiteSpace: 'nowrap',
                height: { xs: 32, md: 44 },
                fontSize: { xs: '0.8rem', md: '1rem' },
                px: { xs: 0.75, md: 3 },
                minWidth: { xs: 'auto', md: 120 },
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 5,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Create Post</Box>
              <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Create</Box>
            </Button>
          </Box>
          
          {/* Filters and View Options */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1, md: 2 }, alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexWrap: 'nowrap', width: '100%' }}>
            <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, alignItems: 'center', flexWrap: 'nowrap' }}>
              {/* Filter Dropdown Button - Hidden on mobile */}
              <Button
                variant="contained"
                startIcon={<FilterListIcon sx={{ fontSize: { xs: 14, md: 16 } }} />}
                onClick={() => setMobileFiltersOpen(true)}
                sx={{ 
                  borderRadius: { xs: 2, md: 3 },
                  fontWeight: 600,
                  height: { xs: 32, md: 44 },
                  fontSize: { xs: '0.7rem', md: '1rem' },
                  px: { xs: 1, md: 2 },
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 3,
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Filters
              </Button>
              
              {/* Sort Options Dropdown */}
              <FormControl size="small" sx={{ minWidth: { xs: 80, md: 120 } }}>
                <Select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                  sx={{ 
                    borderRadius: { xs: 2, md: 3 },
                    height: { xs: 32, md: 44 },
                    fontSize: { xs: '0.7rem', md: '1rem' },
                    '& .MuiSelect-select': {
                      py: { xs: 0.25, md: 1 },
                      pl: { xs: 0.75, md: 1.5 },
                      pr: { xs: 2, md: 3 },
                    }
                  }}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="hot">Hot</MenuItem>
                  <MenuItem value="discussed">Discuss</MenuItem>
                </Select>
              </FormControl>
              
              {/* Content Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: { xs: 80, md: 120 } }}>
                <Select
                  value={contentFilter}
                  onChange={(e) => {
                    setContentFilter(e.target.value);
                    setPage(1);
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                  sx={{ 
                    borderRadius: { xs: 2, md: 3 },
                    height: { xs: 32, md: 44 },
                    fontSize: { xs: '0.7rem', md: '1rem' },
                    '& .MuiSelect-select': {
                      py: { xs: 0.25, md: 1 },
                      pl: { xs: 0.75, md: 1.5 },
                      pr: { xs: 2, md: 3 },
                    }
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="recipes">Food</MenuItem>
                  <MenuItem value="discussions">Posts</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
              size="small"
              sx={{ 
                height: { xs: 32, md: 44 }, 
                flexShrink: 0,
                display: { xs: 'flex', md: 'flex' },
                '& .MuiToggleButton-root': {
                  px: { xs: 0.5, md: 1.5 },
                  minWidth: { xs: 32, md: 44 },
                }
              }}
            >
              <ToggleButton value="card" sx={{ px: { xs: 0.5, md: 1.5 }, borderRadius: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}`, minWidth: { xs: 32, md: 44 } }}>
                <GridViewIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
              </ToggleButton>
              <ToggleButton value="compact" sx={{ px: { xs: 0.5, md: 1.5 }, borderRadius: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}`, minWidth: { xs: 32, md: 44 } }}>
                <ViewListIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
              </ToggleButton>
              <ToggleButton value="grid" sx={{ px: { xs: 0.5, md: 1.5 }, borderRadius: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}`, minWidth: { xs: 32, md: 44 } }}>
                <AppsIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {renderContent()}
        </Grid>

        {/* Right Sidebar - Recommendations - Hidden on mobile */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box 
            sx={{ 
              position: 'relative', 
              top: 0,
              height: 'auto',
              maxHeight: 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible'
            }}
          >
            <RecommendationsSidebar />
          </Box>
        </Grid>
      </Grid>

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

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Filters</Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <FilterDropdown />
      </Drawer>
    </Container>
  );
};

export default FeedPage;