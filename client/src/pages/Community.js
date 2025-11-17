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
  Alert,
  Divider,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Stack,
  Drawer,
  Chip,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  alpha,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery, // Add this import for mobile detection
} from "@mui/material";
import {
  Forum as ForumIcon,
  NewReleases as NewReleasesIcon,
  TrendingUp as TrendingUpIcon,
  Whatshot as WhatshotIcon,
  Close as CloseIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  GroupAdd as GroupAddIcon,
  Rule as RuleIcon,
  PrivacyTip as PrivacyTipIcon,
  FilterList as FilterListIcon,
  ExpandLess,
  ExpandMore,
  Info as InfoIcon,
  ContactSupport as ContactSupportIcon,
  Help as HelpIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Campaign as CampaignIcon,
  EmojiEvents as EmojiEventsIcon,
  Feedback as FeedbackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Apps as AppsIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

import communityService from "../services/communityService";
import userService from "../services/userService";
import PostCard from "../components/PostCard";
import groupService from "../services/groupService";
import Loader from "../custom_components/Loader";

// Notification badge component
const NotificationBadge = ({ count }) => {
  if (count <= 0) return null;
  
  return (
    <Box
      sx={{
        backgroundColor: 'error.main',
        color: 'white',
        borderRadius: '50%',
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        ml: 1,
      }}
    >
      {count > 9 ? '9+' : count}
    </Box>
  );
};

const GroupCard = ({ group }) => {
  const theme = useTheme();
  return (
    <Paper
      component={RouterLink}
      to={`/g/${group.slug}`}
      variant="outlined"
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': { 
          boxShadow: theme.shadows[3], 
          borderColor: 'primary.light',
          transform: 'translateY(-2px)'
        },
        cursor: 'pointer'
      }}
    >
      <Avatar
        src={group.coverImage ? (group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`) : '/images/default-group-cover.png'}
        alt={group.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      >
        {group.name?.charAt(0)?.toUpperCase() || 'G'}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{group.name}</Typography>
        <Typography variant="caption" color="text.secondary">{group.memberCount} members</Typography>
      </Box>
    </Paper>
  );
};

export default function Community() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Add mobile detection
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
  const [trendingTags, setTrendingTags] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]); // New state for user's groups
  const [pendingRequests, setPendingRequests] = useState({}); // State for pending join requests
  
  // State for collapsible sections
  const [communityOpen, setCommunityOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);
  const [myGroupsOpen, setMyGroupsOpen] = useState(true); // New state for My Groups section
  
  // State for left sidebar visibility - closed by default on mobile
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(!isMobile);
  
  // Create refs for infinite scroll
  const observer = useRef();
  const lastPostRef = useRef();
  
  // Background image URL for the header
  const headerImageURL = `${process.env.PUBLIC_URL}/images/CooknCrop.png`;
  
  // Modified fetchPosts function for infinite scrolling
  const fetchPosts = useCallback(async (pageToFetch = 1, append = false) => {
    try {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      // Determine which page we're on
      const currentPath = window.location.pathname;
      
      // Only send search term if it's not just "#" or empty
      const effectiveSearchTerm = debouncedSearchTerm && debouncedSearchTerm !== '#' ? debouncedSearchTerm : '';
      
      let data;
      if (currentPath === '/community/popular') {
        // For popular page, fetch top posts
        data = await communityService.getPosts('top', pageToFetch, {
          isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
          tags: selectedTags,
          search: effectiveSearchTerm,
        });
      } else if (currentPath === '/community') {
        // For home page, fetch randomized posts
        data = await communityService.getPosts('new', pageToFetch, {
          isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
          tags: selectedTags,
          search: effectiveSearchTerm,
        });
        
        // Shuffle the posts to create a randomized feed (only for first page)
        if (pageToFetch === 1) {
          data.posts = [...data.posts].sort(() => Math.random() - 0.5);
        }
      } else {
        // For explore and other pages, use normal sorting
        data = await communityService.getPosts(sort, pageToFetch, {
          isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined,
          tags: selectedTags,
          search: effectiveSearchTerm,
        });
      }
      
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

  // Handle mobile detection and update sidebar visibility
  useEffect(() => {
    setLeftSidebarVisible(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const tags = await communityService.getTrendingTags(10); // Increase limit to ensure we get enough tags
        console.log('Fetched trending tags:', tags); // Debug log
        
        // If no tags are returned, use default tags
        if (!tags || tags.length === 0) {
          setTrendingTags([
            { tag: 'cooking', count: 15 },
            { tag: 'recipe', count: 12 },
            { tag: 'food', count: 10 },
            { tag: 'healthy', count: 8 },
            { tag: 'vegetarian', count: 7 }
          ]);
        } else {
          setTrendingTags(tags);
        }
      } catch (err) { 
        console.error("Error fetching trending tags: ", err); 
        // Set some default tags for testing
        setTrendingTags([
          { tag: 'cooking', count: 15 },
          { tag: 'recipe', count: 12 },
          { tag: 'food', count: 10 },
          { tag: 'healthy', count: 8 },
          { tag: 'vegetarian', count: 7 }
        ]);
      }
    };
    const fetchGroups = async () => {
      try {
        const groupData = await groupService.getAllGroups();
        setGroups(groupData);
      } catch (err) { console.error("Error fetching groups: ", err); }
    };
    const fetchMyGroups = async () => {
      if (isAuthenticated) {
        try {
          const myGroupsData = await groupService.getMySubscriptions();
          setMyGroups(myGroupsData);
        } catch (err) { console.error("Error fetching my groups: ", err); }
      }
    };
    fetchTrendingTags();
    fetchGroups();
    fetchMyGroups();
  }, [isAuthenticated]);

  // Fetch pending join requests for moderator groups
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (isAuthenticated && myGroups.length > 0) {
        const requests = {};
        let totalRequests = 0;
        
        for (const group of myGroups) {
          // Check if user is a moderator for this group
          const isMod = (group.moderators && group.moderators.some(modId => modId === user.id)) || group.creator === user.id;
          if (isMod && group.isPrivate) {
            try {
              const groupDetails = await groupService.getGroupDetails(group.slug);
              const requestCount = groupDetails.joinRequests.length;
              requests[group._id] = requestCount;
              totalRequests += requestCount;
            } catch (err) {
              console.error(`Error fetching requests for group ${group._id}:`, err);
            }
          }
        }
        
        // Check if there are new requests compared to previous state
        const previousTotal = Object.values(pendingRequests).reduce((a, b) => a + b, 0);
        if (totalRequests > previousTotal && previousTotal > 0) {
          // Find which groups have new requests
          const newRequests = [];
          for (const group of myGroups) {
            const currentCount = requests[group._id] || 0;
            const previousCount = pendingRequests[group._id] || 0;
            if (currentCount > previousCount) {
              newRequests.push({ group, count: currentCount - previousCount });
            }
          }
          
          // Show notification for new requests
          let message = `You have ${totalRequests - previousTotal} new join request(s) to review`;
          if (newRequests.length === 1) {
            message = `You have ${newRequests[0].count} new join request(s) for ${newRequests[0].group.name}`;
          } else if (newRequests.length > 1) {
            message = `You have new join requests for ${newRequests.length} groups`;
          }
          
          setSnackbar({ 
            open: true, 
            message, 
            severity: "info" 
          });
        }
        
        setPendingRequests(requests);
      }
    };

    fetchPendingRequests();
    
    // Set up interval to check for new requests every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, myGroups, user, pendingRequests]);

  const handleCreateClick = () => {
    navigate('/create-post');
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return navigate("/login?redirect=/community");
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
    if (!isAuthenticated) return navigate("/login?redirect=/community");
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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleNotificationClick = () => {
    // Find the first group with pending requests
    const firstGroupWithRequests = myGroups.find(group => pendingRequests[group._id] > 0);
    if (firstGroupWithRequests) {
      navigate(`/g/${firstGroupWithRequests.slug}`);
      setSnackbar({ ...snackbar, open: false });
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

  // New collapsible navigation sidebar content
  const NavigationSidebar = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          {/* Main Navigation */}
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community')}
                selected={window.location.pathname === '/community'}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <HomeIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Home" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    color: window.location.pathname === '/community' ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community/popular')}
                selected={window.location.pathname === '/community/popular'}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Popular" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    color: window.location.pathname === '/community/popular' ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community/explore-all')}
                selected={window.location.pathname === '/community/explore-all'}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <ExploreIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Explore All" 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    color: window.location.pathname === '/community/explore-all' ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* My Groups Section - Collapsible */}
          {isAuthenticated && myGroups.length > 0 && (
            <>
              <ListItemButton 
                onClick={() => setMyGroupsOpen(!myGroupsOpen)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  backgroundColor: myGroupsOpen ? alpha(theme.palette.info.main, 0.05) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                  }
                }}
              >
                <ListItemIcon>
                  <GroupIcon sx={{ color: theme.palette.info.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="My Groups" 
                  primaryTypographyProps={{ fontWeight: 700, color: 'info.main' }} 
                />
                {myGroupsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={myGroupsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {myGroups.slice(0, 5).map(group => (
                    <ListItemButton 
                      key={group._id}
                      sx={{ 
                        pl: 4, 
                        py: 1,
                        borderRadius: 2,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.05),
                        }
                      }}
                      component={RouterLink}
                      to={`/g/${group.slug}`}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Avatar 
                          src={group.coverImage ? (group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`) : '/images/default-group-cover.png'}
                          alt={group.name}
                          sx={{ width: 24, height: 24 }}
                        >
                          {group.name?.charAt(0)?.toUpperCase() || 'G'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>{group.name}</span>
                            {pendingRequests[group._id] > 0 && (
                              <Box
                                sx={{
                                  backgroundColor: 'error.main',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 16,
                                  height: 16,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.6rem',
                                  fontWeight: 'bold',
                                  ml: 1,
                                }}
                              >
                                {pendingRequests[group._id] > 9 ? '9+' : pendingRequests[group._id]}
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          noWrap: true,
                          fontWeight: 500
                        }} 
                      />
                    </ListItemButton>
                  ))}
                  {myGroups.length > 5 && (
                    <ListItemButton 
                      sx={{ 
                        pl: 4, 
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.05),
                        }
                      }}
                      onClick={() => navigate('/community/explore')}
                    >
                      <ListItemText 
                        primary={`View all ${myGroups.length} groups`} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: 600,
                          color: 'primary.main'
                        }} 
                      />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
              
              <Divider sx={{ my: 2 }} />
            </>
          )}
          
          {/* Community Section - Collapsible */}
          <ListItemButton 
            onClick={() => setCommunityOpen(!communityOpen)}
            sx={{ 
              borderRadius: 2, 
              mb: 0.5,
              backgroundColor: communityOpen ? alpha(theme.palette.secondary.main, 0.05) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              }
            }}
          >
            <ListItemIcon>
              <PeopleIcon sx={{ color: theme.palette.secondary.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Community" 
              primaryTypographyProps={{ fontWeight: 700, color: 'secondary.main' }} 
            />
            {communityOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={communityOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/community/create"
              >
                <ListItemIcon>
                  <GroupAddIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Create Group" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  }
                }} 
                onClick={() => navigate('/community/explore')}
              >
                <ListItemIcon>
                  <ExploreIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Explore Groups" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              
              {/* Display 3 random groups from the database */}
              {groups.slice(0, 3).map(group => (
                <ListItemButton 
                  key={group._id}
                  sx={{ 
                    pl: 6, 
                    py: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                    }
                  }}
                  component={RouterLink}
                  to={`/g/${group.slug}`}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Avatar 
                      src={group.coverImage ? (group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`) : '/images/default-group-cover.png'}
                      alt={group.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {group.name?.charAt(0)?.toUpperCase() || 'G'}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={group.name} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      noWrap: true,
                      fontWeight: 500
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Resources Section - Collapsible */}
          <ListItemButton 
            onClick={() => setResourcesOpen(!resourcesOpen)}
            sx={{ 
              borderRadius: 2, 
              mb: 0.5,
              backgroundColor: resourcesOpen ? alpha(theme.palette.info.main, 0.05) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.1),
              }
            }}
          >
            <ListItemIcon>
              <InfoIcon sx={{ color: theme.palette.info.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Resources" 
              primaryTypographyProps={{ fontWeight: 700, color: 'info.main' }} 
            />
            {resourcesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={resourcesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/community/guidelines"
              >
                <ListItemIcon>
                  <RuleIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Rules" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/privacy"
              >
                <ListItemIcon>
                  <PrivacyTipIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy Policy" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/terms"
              >
                <ListItemIcon>
                  <GavelIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Terms of Service" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/community/guidelines"
              >
                <ListItemIcon>
                  <CampaignIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Guidelines" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
            </List>
          </Collapse>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Support Section - Collapsible */}
          <ListItemButton 
            onClick={() => setSupportOpen(!supportOpen)}
            sx={{ 
              borderRadius: 2, 
              mb: 0.5,
              backgroundColor: supportOpen ? alpha(theme.palette.success.main, 0.05) : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.1),
              }
            }}
          >
            <ListItemIcon>
              <HelpIcon sx={{ color: theme.palette.success.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Support" 
              primaryTypographyProps={{ fontWeight: 700, color: 'success.main' }} 
            />
            {supportOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={supportOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                  }
                }} 
                onClick={() => navigate('/community/help')}
              >
                <ListItemIcon>
                  <HelpIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Help Center" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                  }
                }} 
                component={RouterLink}
                to="/support"
              >
                <ListItemIcon>
                  <ContactSupportIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Contact Us" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 4, 
                  py: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                  }
                }} 
                onClick={() => navigate('/community/feedback')}
              >
                <ListItemIcon>
                  <FeedbackIcon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Feedback" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} 
                />
              </ListItemButton>
            </List>
          </Collapse>
        </Paper>
      </Box>
    </Box>
  );




  // Function to get header content based on current page
  const getHeaderContent = () => {
    const currentPath = window.location.pathname;
    
    switch (currentPath) {
      case '/community/popular':
        return {
          title: "Popular Posts",
          subtitle: "Most engaging content from our community",
          icon: <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
        };
      case '/community/explore-all':
        return {
          title: "Explore All",
          subtitle: "Discover new posts, recipes, and discussions",
          icon: <ExploreIcon sx={{ fontSize: 40, mr: 2 }} />
        };
      case '/community/explore':
        return {
          title: "Explore Community",
          subtitle: "Discover new posts, recipes, and discussions",
          icon: <ExploreIcon sx={{ fontSize: 40, mr: 2 }} />
        };
      case '/community':
      default:
        return {
          title: "Cook 'N'",
          subtitle: "Connect with food lovers, share recipes, and get tips from local farmers and chefs.",
          rotatingText: true
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      overflowX: 'hidden',
    }}>
      {/* Toggle Button for Left Sidebar - Small and subtle */}
      <IconButton
        onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
        sx={
          {
            position: 'fixed',
            left: leftSidebarVisible ? { xs: 270, md: 270 } : { xs: 0, md: 0 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1200,
            width: 24,
            height: 24,
            minHeight: 0,
            minWidth: 0,
            p: 0,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '50%',
            boxShadow: 2,
            '&:hover': {
              bgcolor: theme.palette.background.paper,
              boxShadow: 4,
            },
            transition: 'left 0.3s ease, box-shadow 0.2s',
            // Show on mobile as well
            display: 'flex',
          }
        }
      >
        {leftSidebarVisible ? (
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        )}
      </IconButton>

      {/* Left Navigation Sidebar - Blended with content area */}
      {/* Show on mobile when leftSidebarVisible is true */}
      {leftSidebarVisible && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            top: 64,
            left: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 1100,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
            // Custom scrollbar styling - hidden but functional
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'transparent',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
            },
            // Show on mobile when visible
            display: { xs: leftSidebarVisible ? 'block' : 'none', md: 'block' },
          }}
        >
          {NavigationSidebar}
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { xs: 0, md: leftSidebarVisible ? '280px' : 0 },
          pl: { xs: 0, md: leftSidebarVisible ? 0 : 2 },
          pt: { xs: 8, md: 12 },
          pb: 4,
          transition: 'margin 0.3s ease',
          overflowX: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
          {/* Three Column Layout */}
          <Grid container spacing={3}>
            {/* Middle Content - Posts Feed */}
            <Grid 
              size={{ xs: 12, md: 8.5 }} 
              sx={{ 
                overflowX: 'hidden', 
                pr: { xs: 0, md: '320px' }, 
                pl: { xs: 0, md: leftSidebarVisible ? 0 : 3 },
                width: { xs: '100%', md: 'auto' }
              }}
            >
              <Stack spacing={2.5} sx={{ width: '100%' }}>
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
                    onClick={handleCreateClick}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                    {/* Content Filter Dropdown */}
                    <FormControl size="small" sx={{ minWidth: 80, width: { xs: '40%', md: 'auto' } }}>
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
                        MenuProps={{
                          disableScrollLock: true,
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

                {/* Posts Content - This is where posts and empty state are rendered */}
                {viewMode !== 'grid' ? (
                  <Stack spacing={2}>
                    {!loading && !error && posts.length === 0 ? (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: { xs: 4, md: 8 }, 
                          textAlign: 'center', 
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Typography variant="h5" sx={{ color: "text.secondary", fontSize: { xs: 18, md: 20 }, fontWeight: 700, mb: 2 }}>
                          No posts yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                          Be the first to start a conversation!
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={handleCreateClick}
                          startIcon={<AddIcon />}
                          sx={{ 
                            borderRadius: 3, 
                            px: { xs: 2, md: 4 }, 
                            py: { xs: 1, md: 1.5 }, 
                            fontWeight: 700,
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            minWidth: { xs: 'auto', md: 120 }
                          }}
                        >
                          Create Post
                        </Button>
                      </Paper>
                    ) : (
                      posts.map((post, index) => (
                        <React.Fragment key={post._id}>
                          {viewMode === 'card' && (
                            <div ref={index === posts.length - 1 ? lastPostRef : null}>
                              <PostCard
                                post={post}
                                user={user}
                                onUpvote={handleUpvote}
                                upvotingPosts={upvotingPosts}
                                onToggleSave={handleToggleSave}
                                savingPosts={savingPosts}
                                showSnackbar={setSnackbar}
                                displayMode="card"
                              />
                            </div>
                          )}
                          {viewMode === 'compact' && (
                            <div ref={index === posts.length - 1 ? lastPostRef : null}>
                              <PostCard
                                post={post}
                                user={user}
                                onUpvote={handleUpvote}
                                upvotingPosts={upvotingPosts}
                                onToggleSave={handleToggleSave}
                                savingPosts={savingPosts}
                                showSnackbar={setSnackbar}
                                displayMode="compact"
                              />
                            </div>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </Stack>
                ) : (
                  // Grid view - only show posts with images
                  <Grid container spacing={2}>
                    {!loading && !error && posts.length === 0 ? (
                      <Grid size={{ xs: 12 }} sx={{ display: 'flex' }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: { xs: 4, md: 8 }, 
                            textAlign: 'center', 
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Typography variant="h5" sx={{ color: "text.secondary", fontSize: { xs: 18, md: 20 }, fontWeight: 700, mb: 2 }}>
                            No image posts found
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            Be the first to share an image post!
                          </Typography>
                          <Button 
                            variant="contained" 
                            onClick={handleCreateClick}
                            startIcon={<AddIcon />}
                            sx={{ 
                              borderRadius: 3, 
                              px: { xs: 2, md: 4 }, 
                              py: { xs: 1, md: 1.5 }, 
                              fontWeight: 700,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              minWidth: { xs: 'auto', md: 120 }
                            }}
                          >
                            Create Post
                          </Button>
                        </Paper>
                      </Grid>
                    ) : (
                      (() => {
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
                      })()
                    )}
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

            {/* Right Sidebar - Fixed positioning with line distinction */}
            {/* Hide on mobile */}
            {!isMobile && (
              <Box
                sx={{
                  width: 300,
                  flexShrink: 0,
                  position: 'fixed',
                  height: 'calc(100vh - 64px)',
                  top: 64,
                  right: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  zIndex: 1100,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.default,
                  // Custom scrollbar styling - hidden but functional
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'transparent',
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                  },
                }}
              >
                <Box sx={{ p: 2, pt: 3 }}>
                  <Stack spacing={2.5}>
                    {/* Trending Section */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WhatshotIcon sx={{ color: 'primary.main', fontSize: 20, mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15, fontFamily: theme.typography.fontFamily }}>
                          Trending
                        </Typography>
                      </Box>
                    
                      {/* Trending Topics */}
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                          Popular Topics
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {trendingTags && trendingTags.length > 0 ? trendingTags.slice(0, 8).map((item, index) => (
                            <Chip
                              key={item.tag || index}
                              label={`#${item.tag || item}`}
                              onClick={() => handleTagClick(item.tag || item)}
                              clickable
                              color={selectedTags.includes(item.tag || item) ? 'primary' : 'default'}
                              variant={selectedTags.includes(item.tag || item) ? 'filled' : 'outlined'}
                              size="small"
                              sx={{
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: 11,
                                height: 24,
                                '&:hover': {
                                  bgcolor: selectedTags.includes(item.tag || item) ? undefined : alpha(theme.palette.primary.main, 0.1),
                                },
                                fontFamily: theme.typography.fontFamily,
                              }}
                            />
                          )) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              No trending topics
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Top Posts Today */}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                          Top Posts
                        </Typography>
                        <Stack spacing={1.5}>
                          {posts.slice(0, 3).map((post) => (
                            <Box 
                              key={post._id}
                              onClick={() => navigate(`/post/${post._id}`)}
                              sx={{ 
                                cursor: 'pointer',
                                p: 1.5,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <Avatar 
                                src={post.user?.profilePic ? `${process.env.REACT_APP_API_URL}${post.user.profilePic}` : undefined}
                                alt={post.user?.username || 'User'}
                                sx={{ width: 32, height: 32, fontSize: 14 }}
                              >
                                {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    fontSize: 13, 
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    fontFamily: theme.typography.fontFamily,
                                  }}
                                >
                                  {post.title}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Paper>

                    {/* Recommended Section */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2.5,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'secondary.main', fontSize: 20, mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15, fontFamily: theme.typography.fontFamily }}>
                          Recommended
                        </Typography>
                      </Box>
                    
                      {/* Recommended Groups */}
                      {groups.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                            Groups to Join
                          </Typography>
                          <Stack spacing={1.25}>
                            {groups.slice(0, 2).map(group => (
                              <GroupCard key={group._id} group={group} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Mobile Sidebar Drawer - Contains the filter options */}
          {/* Show on mobile when sidebarOpen is true */}
          {isMobile && (
            <Drawer
              anchor="right"
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              PaperProps={{ sx: { width: "90vw", maxWidth: 360 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                <IconButton edge="end" onClick={() => setSidebarOpen(false)} aria-label="close sidebar">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
                  Filters & Options
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Use the filter bar above to refine your search
                </Typography>
              </Box>
            </Drawer>
          )}

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert 
              onClose={handleSnackbarClose} 
              severity={snackbar.severity} 
              sx={{ width: "100%" }}
              action={
                snackbar.severity === "info" ? (
                  <Button color="inherit" size="small" onClick={handleNotificationClick}>
                    View
                  </Button>
                ) : null
              }
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
}