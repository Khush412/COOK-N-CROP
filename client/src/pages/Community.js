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
  CircularProgress, Alert,
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
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Forum as ForumIcon,
  NewReleases as NewReleasesIcon,
  TrendingUp as TrendingUpIcon,
  Whatshot as WhatshotIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import communityService from "../services/communityService";
import userService from "../services/userService";
import PostCard from "../components/PostCard";
import groupService from '../services/groupService';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]); // For the Discover Groups sidebar

  // Background image URL for the header - update your file path as needed
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
          isRecipe: false,
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
  }, [sort, page, selectedTags, debouncedSearchTerm]);

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

  const handleUpvote = async (postId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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

  const handleToggleSave = async (postId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
        : [tagToToggle] // Only allow one tag at a time for simplicity in this view
    );
  };
  // Sidebar content reused inside drawer and desktop sidebar
  const SidebarContent = (
    <Stack
      spacing={4}
      sx={{
        minWidth: 230,
        maxWidth: 340,
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${headerImageURL})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          filter: "brightness(0.85)",
          bgcolor: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.common.white,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
        }}
      >
        <ForumIcon fontSize="large" sx={{ mb: 1.5 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
          Join the Conversation!
        </Typography>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleCreateClick}
          sx={{ borderRadius: 20, py: 1.3, fontWeight: 700, fontFamily: theme.typography.fontFamily, textTransform: "none" }}
        >
          Create Post
        </Button>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, fontFamily: theme.typography.fontFamily }}>
          Share your experiences, ask questions, and connect!
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', fontFamily: theme.typography.fontFamily }}>
          <WhatshotIcon color="error" sx={{ mr: 1 }} />
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
              sx={{ fontFamily: theme.typography.fontFamily }}
            />
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No trending topics right now.</Typography>
          )}
          {selectedTags.length > 0 && (
            <Button size="small" onClick={() => setSelectedTags([])} sx={{ ml: 'auto', textTransform: 'none', fontFamily: theme.typography.fontFamily }}>
              Clear Filter
            </Button>
          )}
        </Box>
      </Paper>
    </Stack>
  );

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        paddingTop: { xs: 8, md: 12 },
        paddingBottom: 4,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        {/* Header with background image */}
        <Paper
          sx={{
            position: "relative",
            height: { xs: 180, sm: 225, md: 280 },
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 6,
            boxShadow: theme.shadows[5],
            cursor: "default",
            userSelect: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
            fontFamily: theme.typography.fontFamily,
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
          <Box sx={{ position: "relative", p: { xs: 2, sm: 3 }, zIndex: 3 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.6rem", md: "3rem" },
                fontWeight: 900,
                letterSpacing: 1.2,
                textShadow: "0 0 10px rgba(0,0,0,0.6)",
                lineHeight: 1.15,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Cook-N-Connect
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                marginTop: 1,
                fontWeight: 400,
                opacity: 0.9,
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: "1.05rem", sm: "1.15rem" },
                textShadow: "0 0 7px rgba(0,0,0,0.5)",
                maxWidth: 680,
                mx: "auto",
              }}
            >
              Connect with food lovers, share recipes, and get tips from local farmers and chefs.
            </Typography>
          </Box>
        </Paper>

        {/* Main grid */}
        <Grid
          container
          spacing={{ xs: 0, md: 4 }}
          sx={{
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start",
          }}
        >
          {/* Desktop Left Sidebar (for Trending Topics and Create Post) */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {SidebarContent}
            </Box>
          </Grid>

          {/* Main Feed */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: -1, md: 0 } }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 2 }}>
              <TextField
                label="Search Posts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: '20px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              <ToggleButtonGroup value={sort} exclusive onChange={handleSortChange} aria-label="Sort posts" sx={{ '& .MuiToggleButton-root': { fontFamily: theme.typography.fontFamily } }}>
                <ToggleButton value="new" aria-label="Sort by new">
                  <NewReleasesIcon sx={{ mr: 0.7, fontSize: 20 }} />
                  New
                </ToggleButton>
                <ToggleButton value="top" aria-label="Sort by top">
                  <TrendingUpIcon sx={{ mr: 0.7, fontSize: 20 }} />
                  Top
                </ToggleButton>
                <ToggleButton value="hot" aria-label="Sort by hot">
                  <WhatshotIcon sx={{ mr: 0.7, fontSize: 20 }} />
                  Hot
                </ToggleButton>
                <ToggleButton value="discussed" aria-label="Sort by discussed">
                  <ForumIcon sx={{ mr: 0.7, fontSize: 20 }} />
                  Discussed
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }} aria-label="open filters and actions">
                <MenuIcon />
              </IconButton>
            </Paper>

            {loading && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
              {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && posts.length === 0 && (
                <Typography sx={{ textAlign: "center", color: "text.secondary", fontSize: 18, py: 4 }}>
                  No posts yet. Be the first to start a conversation!
                </Typography>
              )}

            {/* Posts Feed */}
            <Stack spacing={3}>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  onUpvote={(e) => handleUpvote(post._id, e)}
                  upvotingPosts={upvotingPosts}
                  onToggleSave={(e) => handleToggleSave(post._id, e)}
                  savingPosts={savingPosts}
                  showSnackbar={setSnackbar}

                  displayMode="feed"
                />
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
          </Grid>

          {/* Right Sidebar (for Discover Groups) */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>Discover Groups</Typography>
                <Stack spacing={1.5}>
                  {groups.slice(0, 5).map(group => ( // Show top 5 groups
                    <GroupCard key={group._id} group={group} />
                  ))}
                </Stack>
                <Button component={RouterLink} to="/community/explore" fullWidth sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
                  Explore All Groups
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Mobile Sidebar Drawer */}
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
          {SidebarContent}
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
  );
}