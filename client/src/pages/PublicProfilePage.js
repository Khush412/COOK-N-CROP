import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Button,
  Stack,
  Grid,
  Link,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { format, formatDistanceToNow } from 'date-fns';
import CommentIcon from '@mui/icons-material/Comment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BlockIcon from '@mui/icons-material/Block';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const ActivityCard = ({ item, type }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': {
          boxShadow: theme.shadows[3],
          borderColor: 'primary.main',
        },
      }}
    >
      {type === 'post' ? (
        <>
          <Typography variant="subtitle1" fontWeight="bold" component={RouterLink} to={`/post/${item._id}`} sx={{ textDecoration: 'none', color: 'text.primary', fontFamily: theme.typography.fontFamily, '&:hover': { color: 'primary.main' }, mb: 0.5, display: 'block' }}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        </>
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: theme.typography.fontFamily,
            }}
          >
            "{item.content}"
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Commented on{' '}
            <Link component={RouterLink} to={`/post/${item.post._id}`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', '&:hover': { color: 'primary.dark' } }}>
              {item.post.title}
            </Link>
            {' '}{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        </>
      )}
    </Paper>
  );
};

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getPublicProfile(username);
        setProfileData(res.data);
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/user/${username}`);
      return;
    }
    setFollowLoading(true);
    try {
      await userService.toggleFollow(profileData.user._id);
      setIsFollowing(prev => !prev);
      // Optimistically update follower count
      setProfileData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followersCount: isFollowing ? prev.user.followersCount - 1 : prev.user.followersCount + 1,
        },
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/user/${username}`);
      return;
    }
    if (window.confirm(`Are you sure you want to block ${profileData.user.username}? You will no longer see their content or be able to message them.`)) {
      try {
        await userService.blockUser(profileData.user._id);
        navigate('/community'); // Redirect away from the profile after blocking
      } catch (err) {
        alert('Failed to block user.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { user, posts, comments } = profileData;

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          mb: 4,
          background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid size={{ xs: 12, md: 'auto' }}>
            <Avatar
              src={user.profilePic}
              alt={user.username}
              sx={{
                width: { xs: 100, md: 150 },
                height: { xs: 100, md: 150 },
                fontSize: 72,
                mx: 'auto',
                boxShadow: theme.shadows[6],
              }}
            >
              {!user.profilePic && user.username.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
              {user.bio || 'No bio provided.'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" divider={<Divider orientation="vertical" flexItem />} sx={{ mt: 2.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{user.followersCount}</Typography>
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: '0.8rem' }}>Followers</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{user.followingCount}</Typography>
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: '0.8rem' }}>Following</Typography>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontFamily: theme.typography.fontFamily, textAlign: { xs: 'center', md: 'left' } }}>
              Joined {format(new Date(user.createdAt), 'MMM yyyy')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 'auto' }} sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated && currentUser?.username !== user.username && (
              <Stack direction={{ xs: 'row', md: 'column' }} spacing={1.5} sx={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  sx={{ borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}
                >
                  {isFollowing ? 'Unfollowing' : 'Follow'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MailOutlineIcon />}
                  onClick={() => navigate('/messages', { state: { newConversationWith: user } })}
                  sx={{ borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}
                >
                  Message
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={handleBlockToggle}
                  sx={{ borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}
                >
                  Block
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile activity tabs" centered>
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`Posts (${posts.length})`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`Comments (${comments.length})`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {posts.length > 0 ? (
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                    <ActivityCard item={post} type="post" />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>
                This user hasn't made any posts yet.
              </Typography>
            )}
          </Box>
        )}

        {/* Comments Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {comments.length > 0 ? (
              <Grid container spacing={2}>
                {comments.map((comment) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={comment._id}>
                    <ActivityCard item={comment} type="comment" />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>
                This user hasn't made any comments yet.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PublicProfilePage;
