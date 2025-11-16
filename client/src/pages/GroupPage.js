import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Alert, Paper, Button, Stack, Grid, Avatar, Chip,
  ToggleButtonGroup, ToggleButton, Pagination, Divider, Tooltip, TextField, InputAdornment,
  FormControl, Select, MenuItem, IconButton, Drawer, useMediaQuery
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, Check as CheckIcon, NewReleases as NewReleasesIcon, TrendingUp as TrendingUpIcon, 
  Forum as ForumIcon, Whatshot as WhatshotIcon, Settings as SettingsIcon, Lock as LockIcon, 
  PersonAdd as PersonAddIcon, Search as SearchIcon,
  GridView as GridViewIcon, ViewList as ViewListIcon, Apps as AppsIcon,
  Close as CloseIcon, Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import groupService from '../services/groupService';
import communityService from '../services/communityService';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import GroupJoinRequests from '../components/GroupJoinRequests'; // Import the new component
import Loader from '../custom_components/Loader';

const GroupPage = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState({ group: true, posts: true });
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // State for mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [contentFilter, setContentFilter] = useState('all'); // New state for content filter
  const [viewMode, setViewMode] = useState('card'); // New state for view mode

  const [upvotingPosts, setUpvotingPosts] = useState([]);
  const [savingPosts, setSavingPosts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, group: true }));
      const groupData = await groupService.getGroupDetails(slug);
      setGroup(groupData);
      setMemberCount(groupData.memberCount);
      if (isAuthenticated) {
        setIsMember(groupData.members && groupData.members.some(memberId => memberId === user.id));
        setHasRequestedToJoin(groupData.joinRequests && groupData.joinRequests.some(reqUser => reqUser._id === user.id));
      }
    } catch (err) {
      setError('Group not found or you do not have access.');
    } finally {
      setLoading(prev => ({ ...prev, group: false }));
    }
  }, [slug, isAuthenticated, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchGroupPosts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      const postData = await groupService.getGroupPosts(slug, { 
        sort, 
        page, 
        search: debouncedSearchTerm,
        isRecipe: contentFilter === 'recipes' ? true : contentFilter === 'discussions' ? false : undefined
      });
      setPosts(postData.posts);
      setTotalPages(postData.pages);
    } catch (err) {
      setError('Could not load posts for this group.');
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  }, [slug, sort, page, debouncedSearchTerm, contentFilter]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  useEffect(() => {
    if (group) {
      fetchGroupPosts();
    }
  }, [group, fetchGroupPosts, contentFilter]); // Add contentFilter as dependency

  if (loading.group) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Loader size="large" /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ py: 4, mt: 12 }}><Alert severity="error">{error}</Alert></Container>;
  }

  const isMod = group && (group.moderators && group.moderators.some(mod => mod._id === user?.id) || group.creator._id === user?.id || user?.role === 'admin');

  const handleJoinLeave = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/g/${slug}`);
    setIsJoining(true);
    try {
      const res = await groupService.joinLeaveGroup(group._id); // This now handles join requests
      if (group.isPrivate && !isMember) {
        setHasRequestedToJoin(true);
        setSnackbar({ open: true, message: 'Your request to join has been sent!', severity: 'info' });
      } else {
        setIsMember(res.isMember);
        setMemberCount(res.memberCount);
        setSnackbar({ open: true, message: res.isMember ? 'Joined group!' : 'Left group.', severity: 'success' });
      }
    } catch (err) {
      // Handle error
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) return navigate(`/login?redirect=/g/${slug}`);
    if (upvotingPosts.includes(postId)) return;

    setUpvotingPosts(prev => [...prev, postId]);
    const originalPosts = [...posts];
    const postIndex = posts.findIndex(p => p._id === postId);
    if (postIndex === -1) return;

    const updatedPost = { ...posts[postIndex] };
    const hasUpvoted = updatedPost.upvotes.includes(user.id);
    updatedPost.upvotes = hasUpvoted ? updatedPost.upvotes.filter(id => id !== user.id) : [...updatedPost.upvotes, user.id];
    updatedPost.voteScore = (updatedPost.voteScore || 0) + (hasUpvoted ? -1 : 1);

    const newPosts = [...posts];
    newPosts[postIndex] = updatedPost;
    setPosts(newPosts);

    try {
      await communityService.toggleUpvote(postId); // Reusing existing service
    } catch (err) {
      setPosts(originalPosts);
    } finally {
      setUpvotingPosts(prev => prev.filter(id => id !== postId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) return navigate(`/login?redirect=/g/${slug}`);
    setSavingPosts(prev => [...prev, postId]);
    try {
      const res = await userService.toggleSavePost(postId);
      if (res.success) {
        updateUserSavedPosts(res.savedPosts);
        setSnackbar({ open: true, message: 'Post saved!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save post.', severity: 'error' });
    } finally {
      setSavingPosts(prev => prev.filter(id => id !== postId));
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', pb: '50px', pt: { xs: 8, sm: 0 } }}>
      {/* Group Header - Mobile responsive */}
      <Paper
        sx={{
          height: { xs: 180, sm: 200, md: 250 },
          position: 'relative',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `url(${group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`})`,
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-end',
          p: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="center" sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <Avatar 
            src={group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`} 
            sx={{ 
              width: { xs: 60, sm: 80, md: 100, lg: 120 }, 
              height: { xs: 60, sm: 80, md: 100, lg: 120 }, 
              border: '3px solid white' 
            }} 
          />
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                fontFamily: theme.typography.fontFamily, 
                fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem', lg: '2.5rem' }
              }}
            >
              {group.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>g/{group.slug}</Typography>
              {group.isPrivate && (
                <Tooltip title="Private Group">
                  <LockIcon sx={{ color: 'white', fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                </Tooltip>
              )}
              {isMod && (
                <Button
                  size="small"
                  startIcon={<SettingsIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                  onClick={() => navigate(`/g/${slug}/edit`)}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    '&:hover': { borderColor: 'white' }, 
                    fontFamily: theme.typography.fontFamily,
                    mt: { xs: 0.5, sm: 0 },
                    px: { xs: 0.5, sm: 1 },
                    py: { xs: 0, sm: 0.5 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    minWidth: 'auto'
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                fontFamily: theme.typography.fontFamily,
                display: '-webkit-box',
                WebkitLineClamp: { xs: 2, sm: 2, md: 3 },
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {group.description}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Main Feed */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
              {/* First row: Search bar with mobile sidebar toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: { xs: 1, sm: 1.5 } }}>
                <TextField
                  label="Search in this group"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ 
                    flexGrow: 1, 
                    minWidth: { xs: 100, sm: 150 }, 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '20px',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    },
                  }}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} /></InputAdornment>),
                  }}
                  InputLabelProps={{
                    sx: { 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
                {/* Mobile sidebar toggle button - placed next to search bar */}
                <IconButton
                  onClick={() => setMobileSidebarOpen(true)}
                  sx={{ 
                    display: { xs: 'flex', md: 'none' }, 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    borderRadius: '50%',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  <MenuIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                </IconButton>
              </Box>
              
              {/* Second row: Create Post button and view mode toggle aligned on the same line */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 }, alignItems: 'center', width: '100%' }}>
                  {/* Content Filter Dropdown */}
                  <FormControl size="small" sx={{ width: { xs: '48%', sm: '48%' } }}>
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
                        height: { xs: 36, sm: 42 },
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        '& .MuiSelect-select': {
                          py: { xs: 0.8, sm: 1.3 },
                          pl: { xs: 1.3, sm: 1.8 },
                          pr: { xs: 2.3, sm: 3.3 },
                        }
                      }}
                    >
                      <MenuItem value="all" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>All</MenuItem>
                      <MenuItem value="recipes" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Recipes</MenuItem>
                      <MenuItem value="discussions" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Discussions</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Sort Options Dropdown */}
                  <FormControl size="small" sx={{ width: { xs: '48%', sm: '48%' } }}>
                    <Select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      MenuProps={{
                        disableScrollLock: true,
                      }}
                      sx={{ 
                        borderRadius: 2,
                        height: { xs: 36, sm: 42 },
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        '& .MuiSelect-select': {
                          py: { xs: 0.8, sm: 1.3 },
                          pl: { xs: 1.3, sm: 1.8 },
                          pr: { xs: 2.3, sm: 3.3 },
                        }
                      }}
                    >
                      <MenuItem value="new" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>New</MenuItem>
                      <MenuItem value="top" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Top</MenuItem>
                      <MenuItem value="hot" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Hot</MenuItem>
                      <MenuItem value="discussed" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Most Discussed</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* View Mode Toggle */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
                    size="small"
                    sx={{ height: { xs: 36, sm: 42 } }}
                  >
                    <ToggleButton value="card" sx={{ px: { xs: 1.2, sm: 1.9 }, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <GridViewIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }} />
                    </ToggleButton>
                    <ToggleButton value="compact" sx={{ px: { xs: 1.2, sm: 1.9 }, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <ViewListIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }} />
                    </ToggleButton>
                    <ToggleButton value="grid" sx={{ px: { xs: 1.2, sm: 1.9 }, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                      <AppsIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }} />}
                    onClick={() => navigate('/create-post', { state: { groupId: group._id, groupName: group.name } })}
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      borderRadius: '50px', 
                      px: { xs: 1.9, sm: 2.4 },
                      py: { xs: 0.8, sm: 1.3 },
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      minWidth: 'auto',
                      ml: 1,
                      height: { xs: 36, sm: 42 }
                    }}
                  >
                    Create Post
                  </Button>

                </Box>
              </Box>
            </Paper>

            {loading.posts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Loader size="medium" />
              </Box>
            ) : (
              viewMode !== 'grid' ? (
                <Stack spacing={{ xs: 2, sm: 3 }}>
                  {posts.length > 0 ? posts.map(post => (
                    <PostCard
                      key={post._id}
                      post={post}
                      user={user}
                      onUpvote={handleUpvote}
                      upvotingPosts={upvotingPosts}
                      onToggleSave={handleToggleSave}
                      savingPosts={savingPosts}
                      showSnackbar={setSnackbar}
                      displayMode={viewMode} // Use the selected view mode
                    />
                  )) : (
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>No posts in this group yet. Be the first!</Typography>
                  )}
                </Stack>
              ) : (
                // Grid view - only show posts with images
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  {posts.filter(post => post.media && post.media.length > 0).length > 0 ? (
                    posts.filter(post => post.media && post.media.length > 0).map((post) => (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }} key={post._id}>
                        <Box 
                          onClick={() => navigate(`/post/${post._id}`)}
                          sx={{
                            borderRadius: { xs: 2, sm: 3 },
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
                              height: { xs: 100, sm: 150, md: 180 },
                              objectFit: 'cover',
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                          <Box sx={{ p: { xs: 1, sm: 2 } }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontFamily: theme.typography.fontFamily,
                                mb: 0.5,
                              }}
                            >
                              {post.title}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                              <Avatar 
                                src={post.user?.profilePic ? `${process.env.REACT_APP_API_URL}${post.user.profilePic}` : undefined}
                                alt={post.user?.username || 'User'}
                                sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                              >
                                {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 500, 
                                  color: 'text.secondary',
                                  fontFamily: theme.typography.fontFamily,
                                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                }}
                              >
                                {post.user?.username || 'Unknown'}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: { xs: 2, sm: 4, md: 6 }, 
                          textAlign: 'center', 
                          borderRadius: { xs: 2, sm: 3 },
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="h5" sx={{ color: "text.secondary", fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, fontWeight: 700, mb: 1 }}>
                          No image posts yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Be the first to share a post with images!
                        </Typography>
                        <Button 
                          variant="contained" 
                          onClick={() => navigate('/create-post', { state: { groupId: group._id, groupName: group.name } })}
                          startIcon={<AddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                          sx={{ 
                            borderRadius: { xs: 2, sm: 3 }, 
                            px: { xs: 1.5, sm: 3 }, 
                            py: { xs: 0.75, sm: 1 }, 
                            fontWeight: 700,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Create Post
                        </Button>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )
            )}

            {totalPages > 1 && (
              <Box sx={{ mt: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(e, val) => setPage(val)} 
                  color="primary" 
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    } 
                  }} 
                />
              </Box>
            )}
          </Grid>

          {/* Right Sidebar - Toggleable on mobile */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { md: 'block' } }}>
            <Box 
              sx={{ 
                position: 'sticky',
                top: 100,
                alignSelf: 'flex-start',
                pb: 2,
                mb: 4,
                display: { xs: 'none', md: 'block' }
              }}
            >
              {/* Join Requests Management for Moderators */}
              {isMod && group.isPrivate && (
                <Box sx={{ mb: 3 }}>
                  <GroupJoinRequests groupId={group._id} />
                </Box>
              )}
            
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>About Community</Typography>
              {group.isPrivate && !isMember && !hasRequestedToJoin ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleJoinLeave}
                  disabled={isJoining}
                  startIcon={isJoining ? <Loader size="small" /> : <PersonAddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                  sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Request to Join
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant={isMember ? 'outlined' : 'contained'}
                  onClick={handleJoinLeave}
                  disabled={isJoining || hasRequestedToJoin}
                  startIcon={isJoining ? <Loader size="small" /> : (isMember && <CheckIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />)}
                  sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {hasRequestedToJoin ? 'Requested' : (isMember ? 'Joined' : 'Join')}
                </Button>
              )}
              <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{memberCount.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {group.isPrivate ? 'Members (Private Group)' : 'Members'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {group.creator && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Created by{' '}
                <Typography component={RouterLink} to={`/user/${group.creator.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' }, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  {group.creator.username}
                </Typography> {/* Added profilePic check */}
              </Typography>}
              {group.moderators.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Moderators</Typography>
                  <Stack spacing={1}>
                    {group.moderators.map(mod => (
                      <Stack key={mod._id} direction="row" spacing={1.5} alignItems="center" component={RouterLink} to={`/user/${mod.username}`} sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}> {/* Added profilePic check */}
                        <Avatar
                          sx={{ width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                          src={mod.profilePic && mod.profilePic.startsWith('http') ? mod.profilePic : mod.profilePic ? `${process.env.REACT_APP_API_URL}${mod.profilePic}` : undefined}
                        >
                          {mod.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{mod.username}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
              {group.rules && group.rules.length > 0 && (
                <> {/* Added profilePic check */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Group Rules</Typography>
                  <Stack spacing={1.5}>
                    {group.rules.map((rule, index) => (
                      <Box key={index}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{index + 1}. {rule.title}</Typography>
                        {rule.description && <Typography variant="caption" color="text.secondary" sx={{ pl: 2, display: 'block', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{rule.description}</Typography>}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </Paper>
          </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        PaperProps={{
          sx: { width: { xs: '85%', sm: 300 } }
        }}
      >
        {/* Close button positioned outside the main content */}
        <IconButton 
          onClick={() => setMobileSidebarOpen(false)} 
          sx={{ 
            position: 'absolute', 
            top: { xs: 16, sm: 32 }, 
            right: { xs: 8, sm: 16 }, 
            zIndex: 1000,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 }
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
        </IconButton>
        
        <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', pt: { xs: 6, sm: 8 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Group Info
            </Typography>
          </Box>

          {/* Join Requests Management for Moderators */}
          {isMod && group.isPrivate && (
            <Box sx={{ mb: 3 }}>
              <GroupJoinRequests groupId={group._id} />
            </Box>
          )}
        
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: 1.5, sm: 2 }, mb: 2, flexGrow: 1, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>About Community</Typography>
            {group.isPrivate && !isMember && !hasRequestedToJoin ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleJoinLeave}
                disabled={isJoining}
                startIcon={isJoining ? <Loader size="small" /> : <PersonAddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Request to Join
              </Button>
            ) : (
              <Button
                fullWidth
                variant={isMember ? 'outlined' : 'contained'}
                onClick={handleJoinLeave}
                disabled={isJoining || hasRequestedToJoin}
                startIcon={isJoining ? <Loader size="small" /> : (isMember && <CheckIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />)}
                sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {hasRequestedToJoin ? 'Requested' : (isMember ? 'Joined' : 'Join')}
              </Button>
            )}
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{memberCount.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {group.isPrivate ? 'Members (Private Group)' : 'Members'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            {group.creator && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Created by{' '}
              <Typography component={RouterLink} to={`/user/${group.creator.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' }, fontFamily: 'inherit', fontSize: 'inherit' }}>
                {group.creator.username}
              </Typography> {/* Added profilePic check */}
            </Typography>}
            {group.moderators.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Moderators</Typography>
                <Stack spacing={1}>
                  {group.moderators.map(mod => (
                    <Stack key={mod._id} direction="row" spacing={1.5} alignItems="center" component={RouterLink} to={`/user/${mod.username}`} sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}> {/* Added profilePic check */}
                      <Avatar
                        sx={{ width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                        src={mod.profilePic && mod.profilePic.startsWith('http') ? mod.profilePic : mod.profilePic ? `${process.env.REACT_APP_API_URL}${mod.profilePic}` : undefined}
                      >
                        {mod.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{mod.username}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
            {group.rules && group.rules.length > 0 && (
              <> {/* Added profilePic check */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Group Rules</Typography>
                <Stack spacing={1.5}>
                  {group.rules.map((rule, index) => (
                    <Box key={index}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{index + 1}. {rule.title}</Typography>
                      {rule.description && <Typography variant="caption" color="text.secondary" sx={{ pl: 2, display: 'block', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{rule.description}</Typography>}
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Box>
      </Drawer>
    </Box>
  );
};

export default GroupPage;