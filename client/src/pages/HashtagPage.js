import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper,
  Pagination,
  Stack,
  Alert,
  Avatar,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  Tag as TagIcon, 
  TrendingUp, 
  LocalOffer as LocalOfferIcon,
  SearchOff as SearchOffIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  IconButton,
} from '@mui/icons-material';
import PostCard from '../components/PostCard';
import searchService from '../services/searchService';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import communityService from '../services/communityService';

const HashtagPage = () => {
  const theme = useTheme();
  const { hashtag } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await searchService.searchByHashtag(hashtag, page);
        setPosts(data.posts || []);
        setTotalPages(data.pages || 1);
        setTotalPosts(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch hashtag posts:', error);
        setError('Failed to load posts with this hashtag.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTrendingHashtags = async () => {
      try {
        const data = await searchService.getTrendingHashtags(10);
        setTrendingHashtags(data || []);
      } catch (error) {
        console.error('Failed to fetch trending hashtags:', error);
      }
    };

    fetchPosts();
    fetchTrendingHashtags();
  }, [hashtag, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHashtagClick = (tag) => {
    navigate(`/search/hashtag/${tag}`);
    setPage(1);
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return navigate('/login?redirect=/search/hashtag/' + hashtag);
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
    } finally {
      setUpvotingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) return navigate('/login?redirect=/search/hashtag/' + hashtag);
    setSavingPosts((prev) => [...prev, postId]);
    try {
      const res = await userService.toggleSavePost(postId);
      if (res.success) updateUserSavedPosts(res.savedPosts);
    } catch {
      // Error handled
    } finally {
      setSavingPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pt: { xs: 10, sm: 12 },
          pb: { xs: 4, sm: 6 },
        }}
      >
        <Container maxWidth="lg">
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
              <LocalOfferIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
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
              #{hashtag}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 500 }}
            >
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} tagged with this hashtag
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Grid container spacing={3}>
          {/* Posts Section - Full width on mobile, 2/3 on desktop */}
          <Grid item xs={12} lg={8}>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 8,
                }}
              >
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>
                {error}
              </Alert>
            ) : posts.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 4, sm: 6 },
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                }}
              >
                <SearchOffIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ fontWeight: 600, mb: 1, fontFamily: theme.typography.fontFamily }}
                >
                  No posts found with #{hashtag}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: theme.typography.fontFamily }}
                >
                  Be the first to create a post with this hashtag!
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    user={user}
                    onUpvote={handleUpvote}
                    upvotingPosts={upvotingPosts}
                    onToggleSave={handleToggleSave}
                    savingPosts={savingPosts}
                    showSnackbar={() => {}}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="secondary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Grid>

          {/* Sidebar - Hidden on mobile/tablet, visible on large screens */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                position: 'sticky',
                top: { xs: 80, sm: 90 },
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                boxShadow: theme.shadows[2],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 22, color: 'primary.main' }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    Trending Tags
                  </Typography>
                </Box>

                {trendingHashtags.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 3, fontFamily: theme.typography.fontFamily }}
                  >
                    No trending hashtags
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {trendingHashtags.map((tag, index) => (
                      <Box
                        key={index}
                        onClick={() => handleHashtagClick(tag.hashtag)}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: tag.hashtag === hashtag
                            ? alpha(theme.palette.secondary.main, 0.08)
                            : 'transparent',
                          border: `1px solid ${tag.hashtag === hashtag ? alpha(theme.palette.secondary.main, 0.3) : 'transparent'}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: tag.hashtag === hashtag
                                ? alpha(theme.palette.secondary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.08),
                              color: tag.hashtag === hashtag ? 'secondary.main' : 'primary.main',
                            }}
                          >
                            <TagIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: tag.hashtag === hashtag ? 700 : 600,
                                fontFamily: theme.typography.fontFamily,
                                color: tag.hashtag === hashtag ? 'secondary.main' : 'text.primary',
                              }}
                            >
                              #{tag.hashtag}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: theme.typography.fontFamily }}
                            >
                              {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                            </Typography>
                          </Box>
                        </Stack>
                        <TrendingUp
                          sx={{
                            fontSize: 16,
                            color: 'success.main',
                            opacity: 0.7,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HashtagPage;
