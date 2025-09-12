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
  List,
  ListItemButton,
  ListItemText,
  Button,
  Stack,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import CommentIcon from '@mui/icons-material/Comment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BlockIcon from '@mui/icons-material/Block';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
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
    if (window.confirm(`Are you sure you want to block ${user.username}? You will no longer see their content or be able to message them.`)) {
      try {
        await userService.blockUser(user._id);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            src={user.profilePic}
            alt={user.username}
            sx={{ width: 100, height: 100, fontSize: 48 }}
          >
            {!user.profilePic && user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {user.bio || 'No bio provided.'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{user.followersCount}</strong> Followers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{user.followingCount}</strong> Following
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Joined {format(new Date(user.createdAt), 'MMM yyyy')}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ ml: 'auto', alignSelf: 'flex-start' }}>
            {isAuthenticated && currentUser?.username !== user.username && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {isFollowing ? 'Unfollowing' : 'Follow'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MailOutlineIcon />}
                  onClick={() => navigate('/messages', { state: { newConversationWith: user } })}
                >
                  Message
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={handleBlockToggle}
                >
                  Block
                </Button>
              </Stack>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile activity tabs">
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`Posts (${posts.length})`} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`Comments (${comments.length})`} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {posts.length > 0 ? (
              <List>
                {posts.map((post) => (
                  <ListItemButton
                    key={post._id}
                    component={RouterLink}
                    to={`/post/${post._id}`}
                    divider
                  >
                    <ListItemText
                      primary={post.title}
                      secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                This user hasn't made any posts yet.
              </Typography>
            )}
          </Box>
        )}

        {/* Comments Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {comments.length > 0 ? (
              <List>
                {comments.map((comment) => (
                  <ListItemButton
                    key={comment._id}
                    component={RouterLink}
                    to={`/post/${comment.post._id}`}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {comment.content}
                        </Typography>
                      }
                      secondary={`Commented on "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
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
