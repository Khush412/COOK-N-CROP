import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Alert, Paper, Button, Stack, Grid, Avatar, Chip,
  ToggleButtonGroup, ToggleButton, Pagination, Divider, Tooltip, TextField, InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Add as AddIcon, Check as CheckIcon, NewReleases as NewReleasesIcon, TrendingUp as TrendingUpIcon, Forum as ForumIcon, Whatshot as WhatshotIcon, Settings as SettingsIcon, Lock as LockIcon, PersonAdd as PersonAddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import groupService from '../services/groupService';
import communityService from '../services/communityService';
import userService from '../services/userService';
import PostCard from '../components/PostCard';
import GroupJoinRequests from '../components/GroupJoinRequests'; // Import the new component

const GroupPage = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState({ group: true, posts: true });
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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
      const postData = await groupService.getGroupPosts(slug, { sort, page, search: debouncedSearchTerm });
      setPosts(postData.posts);
      setTotalPages(postData.pages);
    } catch (err) {
      setError('Could not load posts for this group.');
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  }, [slug, sort, page, debouncedSearchTerm]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  useEffect(() => {
    if (group) {
      fetchGroupPosts();
    }
  }, [group, fetchGroupPosts]);

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

  if (loading.group) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ py: 4, mt: 12 }}><Alert severity="error">{error}</Alert></Container>;
  }

  const isMod = group && (group.moderators && group.moderators.some(mod => mod._id === user?.id) || group.creator._id === user?.id || user?.role === 'admin');
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Group Header */}
      <Paper
        sx={{
          height: 300,
          position: 'relative',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `url(${group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`})`,
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-end',
          p: 4,
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        <Stack direction="row" spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
          <Avatar src={group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`} sx={{ width: 120, height: 120, border: '4px solid white' }} />
          <Box>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>{group.name}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, opacity: 0.9 }}>g/{group.slug}</Typography>
              {group.isPrivate && (
                <Tooltip title="Private Group">
                  <LockIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Tooltip>
              )}
              {isMod && (
                <Button
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate(`/g/${slug}/edit`)}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' }, fontFamily: theme.typography.fontFamily }}
                >Edit Group</Button>
              )}
            </Stack>
            <Typography variant="body1" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>{group.description}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Feed */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-post', { state: { groupId: group._id, groupName: group.name } })}
                sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
              >
                Create Post
              </Button>
              <TextField
                label="Search in this group"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 }, '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                }}
              />
              <ToggleButtonGroup value={sort} exclusive onChange={(e, newSort) => { if (newSort) { setSort(newSort); setPage(1); } }} size="small" sx={{ flexShrink: 0 }}>
                <ToggleButton value="new"><NewReleasesIcon sx={{ mr: 0.5, fontSize: 20 }} /> New</ToggleButton>
                <ToggleButton value="top"><TrendingUpIcon sx={{ mr: 0.5, fontSize: 20 }} /> Top</ToggleButton>
                <ToggleButton value="hot"><WhatshotIcon sx={{ mr: 0.5, fontSize: 20 }} /> Hot</ToggleButton>
                <ToggleButton value="discussed"><ForumIcon sx={{ mr: 0.5, fontSize: 20 }} /> Discussed</ToggleButton>
              </ToggleButtonGroup>
            </Paper>

            {loading.posts ? <CircularProgress /> : (
              <Stack spacing={3}>
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
                    displayMode="feed"
                  />
                )) : (
                  <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4, fontFamily: theme.typography.fontFamily }}>No posts in this group yet. Be the first!</Typography>
                )}
              </Stack>
            )}

            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" sx={{ '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily } }} />
              </Box>
            )}
          </Grid>

          {/* Right Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ 
              position: 'relative',
              top: 100,
            }}>
              <Box sx={{
                position: 'sticky',
                top: 100,
              }}>
                {/* Join Requests Management for Moderators */}
                {isMod && group.isPrivate && (
                  <Box sx={{ mb: 3 }}>
                    <GroupJoinRequests groupId={group._id} />
                  </Box>
                )}
              
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>About Community</Typography>
                {group.isPrivate && !isMember && !hasRequestedToJoin ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleJoinLeave}
                    disabled={isJoining}
                    startIcon={isJoining ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                  >
                    Request to Join
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant={isMember ? 'outlined' : 'contained'}
                    onClick={handleJoinLeave}
                    disabled={isJoining || hasRequestedToJoin}
                    startIcon={isJoining ? <CircularProgress size={20} /> : (isMember && <CheckIcon />)}
                    sx={{ mb: 2, borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                  >
                    {hasRequestedToJoin ? 'Requested' : (isMember ? 'Joined' : 'Join')}
                  </Button>
                )}
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{memberCount.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                  {group.isPrivate ? 'Members (Private Group)' : 'Members'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                {group.creator && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Created by{' '}
                  <Typography component={RouterLink} to={`/user/${group.creator.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' }, fontFamily: 'inherit' }}>
                    {group.creator.username}
                  </Typography> {/* Added profilePic check */}
                </Typography>}
                {group.moderators.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>Moderators</Typography>
                    <Stack spacing={1}>
                      {group.moderators.map(mod => (
                        <Stack key={mod._id} direction="row" spacing={1.5} alignItems="center" component={RouterLink} to={`/user/${mod.username}`} sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}> {/* Added profilePic check */}
                          <Avatar
                            sx={{ width: 28, height: 28, fontSize: '0.8rem' }}
                            src={mod.profilePic && mod.profilePic.startsWith('http') ? mod.profilePic : mod.profilePic ? `${process.env.REACT_APP_API_URL}${mod.profilePic}` : undefined}
                          >
                            {mod.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{mod.username}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
                {group.rules && group.rules.length > 0 && (
                  <> {/* Added profilePic check */}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: theme.typography.fontFamily }}>Group Rules</Typography>
                    <Stack spacing={1.5}>
                      {group.rules.map((rule, index) => (
                        <Box key={index}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{index + 1}. {rule.title}</Typography>
                          {rule.description && <Typography variant="caption" color="text.secondary" sx={{ pl: 2, display: 'block', fontFamily: theme.typography.fontFamily }}>{rule.description}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>
            </Box>
          </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GroupPage;