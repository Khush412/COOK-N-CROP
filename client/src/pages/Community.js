import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  TextField,
  Stack,
  Pagination,
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
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
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
} from "@mui/icons-material";

import communityService from "../services/communityService";
import userService from "../services/userService";
import PostCard from "../components/PostCard";
import groupService from '../services/groupService';
import RotatingText from "../custom_components/RotatingText";

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
        '&:hover': { boxShadow: theme.shadows[3], borderColor: 'primary.light' }
      }}
    >
      <Avatar
        src={group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`}
        alt={group.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{group.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{group.memberCount} members</Typography>
      </Box>
    </Paper>
  );
};

export default function Community() {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [contentFilter, setContentFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  
  // State for collapsible sections
  const [communityOpen, setCommunityOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);
  
  // State for left sidebar visibility
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  
  // Background image URL for the header
  const headerImageURL = `${process.env.PUBLIC_URL}/images/CooknCrop.png`;

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

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const tags = await communityService.getTrendingTags();
        setTrendingTags(tags);
      } catch (err) { console.error("Error fetching trending tags: ", err); }
    };
    const fetchGroups = async () => {
      try {
        const groupData = await groupService.getAllGroups();
        setGroups(groupData);
      } catch (err) { console.error("Error fetching groups: ", err); }
    };
    fetchTrendingTags();
    fetchGroups();
  }, []);

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
        bgcolor: 'background.paper',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {/* Main Navigation */}
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community')}
                selected={window.location.pathname === '/community'}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community/popular')}
                selected={window.location.pathname === '/community/popular'}
              >
                <ListItemIcon>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText primary="Popular" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => navigate('/community/explore')}
                selected={window.location.pathname === '/community/explore'}
              >
                <ListItemIcon>
                  <ExploreIcon />
                </ListItemIcon>
                <ListItemText primary="Explore All" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Community Section - Collapsible */}
          <ListItemButton onClick={() => setCommunityOpen(!communityOpen)}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Community" />
            {communityOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={communityOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => navigate('/groups/create')}
              >
                <ListItemIcon>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText primary="Create Group" />
              </ListItemButton>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => navigate('/community/explore')}
              >
                <ListItemIcon>
                  <ExploreIcon />
                </ListItemIcon>
                <ListItemText primary="Explore Groups" />
              </ListItemButton>
              
              {/* Display 3 random groups from the database */}
              {groups.slice(0, 3).map(group => (
                <ListItemButton 
                  key={group._id}
                  sx={{ pl: 6, py: 1 }}
                  component={RouterLink}
                  to={`/g/${group.slug}`}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Avatar 
                      src={group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`}
                      sx={{ width: 24, height: 24 }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={group.name} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      noWrap: true
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Resources Section - Collapsible */}
          <ListItemButton onClick={() => setResourcesOpen(!resourcesOpen)}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Resources" />
            {resourcesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={resourcesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/rules')}>
                <ListItemIcon>
                  <RuleIcon />
                </ListItemIcon>
                <ListItemText primary="Community Rules" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/privacy')}>
                <ListItemIcon>
                  <PrivacyTipIcon />
                </ListItemIcon>
                <ListItemText primary="Privacy Policy" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/terms')}>
                <ListItemIcon>
                  <GavelIcon />
                </ListItemIcon>
                <ListItemText primary="Terms of Service" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/user-agreement')}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="User Agreement" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/guidelines')}>
                <ListItemIcon>
                  <CampaignIcon />
                </ListItemIcon>
                <ListItemText primary="Community Guidelines" />
              </ListItemButton>
            </List>
          </Collapse>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Support Section - Collapsible */}
          <ListItemButton onClick={() => setSupportOpen(!supportOpen)}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Support" />
            {supportOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={supportOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/help')}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary="Help Center" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/contact')}>
                <ListItemIcon>
                  <ContactSupportIcon />
                </ListItemIcon>
                <ListItemText primary="Contact Us" />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/community/feedback')}>
                <ListItemIcon>
                  <FeedbackIcon />
                </ListItemIcon>
                <ListItemText primary="Feedback" />
              </ListItemButton>
            </List>
          </Collapse>
        </Paper>
      </Box>
    </Box>
  );

  // Right sidebar with all filter options
  const RightSidebar = (
    <Stack spacing={3}>
      {/* Create Post Button */}
      <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleCreateClick}
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 20, 
            py: 1.5, 
            fontWeight: 700,
            textTransform: 'none'
          }}
        >
          Create Post
        </Button>
      </Paper>

      {/* Filter Options */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Filters
        </Typography>
        
        {/* Content Type Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Content Type
          </Typography>
          <Stack spacing={1}>
            <Chip
              label="All Posts"
              onClick={() => { setContentFilter('all'); setPage(1); }}
              color={contentFilter === 'all' ? 'primary' : 'default'}
              variant={contentFilter === 'all' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, justifyContent: 'flex-start' }}
            />
            <Chip
              label="🍳 Recipes"
              onClick={() => { setContentFilter('recipes'); setPage(1); }}
              color={contentFilter === 'recipes' ? 'secondary' : 'default'}
              variant={contentFilter === 'recipes' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, justifyContent: 'flex-start' }}
            />
            <Chip
              label="💬 Discussions"
              onClick={() => { setContentFilter('discussions'); setPage(1); }}
              color={contentFilter === 'discussions' ? 'info' : 'default'}
              variant={contentFilter === 'discussions' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, justifyContent: 'flex-start' }}
            />
          </Stack>
        </Box>
        
        {/* Sort Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Sort By
          </Typography>
          <ToggleButtonGroup 
            value={sort} 
            exclusive 
            onChange={handleSortChange} 
            fullWidth
            orientation="vertical"
            sx={{ 
              '& .MuiToggleButton-root': { 
                borderRadius: 2,
                mb: 0.5,
                textTransform: 'none',
                justifyContent: 'flex-start',
                pl: 2
              } 
            }}
          >
            <ToggleButton value="new" aria-label="Sort by new">
              <NewReleasesIcon sx={{ mr: 1, fontSize: 20 }} />
              New
            </ToggleButton>
            <ToggleButton value="top" aria-label="Sort by top">
              <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
              Top
            </ToggleButton>
            <ToggleButton value="hot" aria-label="Sort by hot">
              <WhatshotIcon sx={{ mr: 1, fontSize: 20 }} />
              Hot
            </ToggleButton>
            <ToggleButton value="discussed" aria-label="Sort by discussed">
              <ForumIcon sx={{ mr: 1, fontSize: 20 }} />
              Discussed
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {/* Trending Topics */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Trending Topics
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
              <Typography variant="body2" color="text.secondary">No trending topics right now.</Typography>
            )}
            {selectedTags.length > 0 && (
              <Button size="small" onClick={() => setSelectedTags([])} sx={{ ml: 'auto', textTransform: 'none' }}>
                Clear Filter
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Stack>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
    }}>
      {/* Toggle Button for Left Sidebar */}
      <IconButton
        onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
        sx={{
          position: 'fixed',
          left: leftSidebarVisible ? 280 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1200,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderRadius: '0 20px 20px 0',
          p: 1,
          width: 30,
          height: 60,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          transition: 'left 0.3s ease',
          boxShadow: theme.shadows[3],
        }}
      >
        {leftSidebarVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* Left Navigation Sidebar - Fixed positioning */}
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
            overflowX: 'hidden',  // Prevent horizontal scrollbar
            zIndex: 1100,
            boxShadow: theme.shadows[3],
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
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
          ml: leftSidebarVisible ? '280px' : 0,
          pt: { xs: 8, md: 12 },
          pb: 4,
          transition: 'margin 0.3s ease',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Cook'n'Connect header - reduced height */}
          <Paper
            sx={{
              position: "relative",
              height: { xs: 100, sm: 120, md: 140 },
              borderRadius: 6,
              overflow: "hidden",
              mb: 4,
              boxShadow: theme.shadows[3],
              cursor: "default",
              userSelect: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#fff",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${headerImageURL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.55)",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
              }}
            />
            <Box sx={{ position: "relative", p: { xs: 1, sm: 2 }, zIndex: 3 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                  fontWeight: 800,
                  letterSpacing: 1,
                  textShadow: "0 0 10px rgba(0,0,0,0.6)",
                  lineHeight: 1.15,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                }}
              >
                Cook 'N'&nbsp;
                <Box component="span" sx={{ display: 'inline-block', width: 120, textAlign: 'left' }}>
                  <RotatingText texts={["Explore", "Connect", "Share"]} />
                </Box>
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  mt: 0.5,
                  fontWeight: 400,
                  opacity: 0.9,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  textShadow: "0 0 7px rgba(0,0,0,0.5)",
                  maxWidth: 680,
                  mx: "auto",
                }}
              >
                Connect with food lovers, share recipes, and get tips from local farmers and chefs.
              </Typography>
            </Box>
          </Paper>

          {/* Reddit-like layout with fixed sidebars */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Main Content Area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Search Bar */}
              <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <TextField
                  label="Search Posts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: '20px' }
                  }}
                />
              </Paper>

              {/* Posts Feed */}
              <Stack spacing={3}>
                {loading && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && posts.length === 0 && (
                  <Typography sx={{ textAlign: "center", color: "text.secondary", fontSize: 18, py: 4 }}>
                    No posts yet. Be the first to start a conversation!
                  </Typography>
                )}
                
                {posts.map((post) => (
                  <Box sx={{ width: '100%' }} key={post._id}>
                    <PostCard
                      post={post}
                      user={user}
                      onUpvote={handleUpvote}
                      upvotingPosts={upvotingPosts}
                      onToggleSave={handleToggleSave}
                      savingPosts={savingPosts}
                      showSnackbar={setSnackbar}
                      displayMode="feed"
                    />
                  </Box>
                ))}
              </Stack>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <Pagination
                    color="primary"
                    size="large"
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                  />
                </Box>
              )}
            </Box>

            {/* Right Sidebar - Hidden on mobile */}
            <Box sx={{ 
              width: 300,
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 100,
              height: 'fit-content',
              // Reddit-style scrollbar - only visible on hover
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&:hover::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 100px)',
            }}>
              {RightSidebar}
            </Box>
          </Box>

          {/* Mobile Sidebar Drawer - Contains the right sidebar content */}
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
              {RightSidebar}
            </Box>
          </Drawer>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
}
