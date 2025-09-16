import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Stack,
  Pagination,
  alpha,
  Drawer,
  IconButton,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import {
  Forum as ForumIcon,
  NewReleases as NewReleasesIcon,
  TrendingUp as TrendingUpIcon,
  Whatshot as WhatshotIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import communityService from "../services/communityService";
import userService from "../services/userService";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";

// Styled Search container with round corners and professional look
const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginBottom: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: "100%",
  maxWidth: 300,
  [theme.breakpoints.up("sm")]: {
    marginBottom: 0,
  }
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(1.5),
  height: "100%",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
  color: alpha(theme.palette.common.white, 0.6),
}));

const StyledInputBase = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
}));

export default function Community() {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [trendingTags, setTrendingTags] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Background image URL for the header - update your file path as needed
  const headerImageURL = "/images/hero.png";

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
    const fetchTags = async () => {
      try {
        const tags = await communityService.getTrendingTags();
        setTrendingTags(tags);
      } catch {}
    };
    fetchTags();
  }, []);

  const handleCreateClick = () => {
    if (!isAuthenticated) navigate("/login?redirect=/community");
    else {
      setOpenCreatePost(true);
      setSidebarOpen(false);
    }
  };

  const handleCloseCreate = () => {
    if (!isSubmitting) setOpenCreatePost(false);
  };

  const handlePostSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newPost = await communityService.createPost(data);
      setPosts((prev) => [newPost, ...prev]);
      setOpenCreatePost(false);
      setSnackbar({ open: true, message: "Post created successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to create post.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleTagClick = (tag) => {
    setPage(1);
    if (searchTerm.toLowerCase() === tag.toLowerCase()) setSearchTerm("");
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
          backgroundImage: `url(${headerImageURL})`,
          backgroundSize: "cover",
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
    </Stack>
  );

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
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
              backgroundImage: `url(${"/images/hero.png"})`,
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
              bgcolor: "rgba(28,16,56,0.56)",
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
          {/* Posts area */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 3 }}>
              {/* Search and sort */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <SearchContainer>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    fullWidth
                    placeholder="Search posts"
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputProps={{ "aria-label": "search posts" }}
                    sx={{ "input": { pl: 5, py: 0.8, fontWeight: 700, fontFamily: theme.typography.fontFamily } }}
                  />
                </SearchContainer>
                <ToggleButtonGroup
                  value={sort}
                  exclusive
                  onChange={handleSortChange}
                  aria-label="Sort posts"
                  sx={{
                    "& .MuiToggleButton-root": {
                      fontWeight: 600,
                      padding: "5px 14px",
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 14,
                    },
                  }}
                >
                  <ToggleButton value="new" aria-label="Sort by new">
                    <NewReleasesIcon sx={{ mr: 0.7, fontSize: 20 }} />
                    New
                  </ToggleButton>
                  <ToggleButton value="top" aria-label="Sort by top">
                    <TrendingUpIcon sx={{ mr: 0.7, fontSize: 20 }} />
                    Top
                  </ToggleButton>
                  <ToggleButton value="discussed" aria-label="Sort by discussed">
                    <ForumIcon sx={{ mr: 0.7, fontSize: 20 }} />
                    Discussed
                  </ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />
                <Button
                  variant="contained"
                  onClick={handleCreateClick}
                  startIcon={<ForumIcon />}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Create Post
                </Button>
                {/* This button will be visible on mobile to open the sidebar */}
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}
                  aria-label="open filters and actions"
                >
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Content states */}
              {loading && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {error && <Alert severity="error">{error}</Alert>}
              {!loading && !error && posts.length === 0 && (
                <Typography sx={{ textAlign: "center", color: "text.secondary", fontSize: 18, py: 4 }}>
                  No posts yet. Be the first to start a conversation!
                </Typography>
              )}

              {/* Posts Grid */}
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={post._id} sx={{ display: "flex" }}>
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

        {/* Create Post Dialog */}
        <Dialog open={openCreatePost} onClose={handleCloseCreate} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 700 }}>Create a New Post</DialogTitle>
          <DialogContent>
            <CreatePostForm 
              onSubmit={handlePostSubmit} 
              onCancel={handleCloseCreate} 
              loading={isSubmitting} 
              forceRecipe={false} 
            />
          </DialogContent>
        </Dialog>

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
