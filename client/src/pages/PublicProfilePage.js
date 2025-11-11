import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  useTheme,
  alpha,
  styled
} from '@mui/material/styles';
import {
  format,
  formatDistanceToNow
} from 'date-fns';
import {
  Comment as CommentIcon,
  PostAdd as PostAddIcon,
  MailOutline as MailOutlineIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  Cake as CakeIcon,
  LocationOn as LocationOnIcon,
  Link as LinkIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../custom_components/Loader';

// Styled components for better visual design
const ProfileHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[8],
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    width: 100,
    height: 100,
  },
}));

const StatChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const PostCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const CommentCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.secondary.main, 0.3),
  },
}));

const ActivityCard = ({ item, type }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (type === 'post') {
    return (
      <PostCard>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to={`/post/${item._id}`} 
              sx={{ 
                fontWeight: 700, 
                textDecoration: 'none', 
                color: 'text.primary', 
                fontFamily: theme.typography.fontFamily,
                '&:hover': { color: 'primary.main' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.title}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          {item.content && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {item.content}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <StatChip icon={<ThumbUpIcon />} label={item.likes?.length || 0} size="small" />
            <StatChip icon={<CommentIcon />} label={item.comments?.length || 0} size="small" />
            <StatChip icon={<VisibilityIcon />} label={item.views || 0} size="small" />
          </Box>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            size="small" 
            component={RouterLink} 
            to={`/post/${item._id}`}
            sx={{ fontFamily: theme.typography.fontFamily }}
          >
            View Post
          </Button>
        </CardActions>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <BookmarkBorderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Save</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        </Menu>
      </PostCard>
    );
  } else {
    return (
      <CommentCard>
        <CardContent>
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: theme.typography.fontFamily,
            }}
          >
            "{item.content}"
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Commented on{' '}
            {item.post ? (
              <Link component={RouterLink} to={`/post/${item.post._id}`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', '&:hover': { color: 'primary.dark' } }}>
                {item.post.title}
              </Link>
            ) : (
              <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.disabled', fontFamily: theme.typography.fontFamily }}>
                a deleted post
              </Typography>
            )}
            {' '}{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        </CardContent>
      </CommentCard>
    );
  }
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
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

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
    setBlockConfirmOpen(true);
  };

  const confirmBlockUser = async () => {
    setBlockConfirmOpen(false);
    try {
      await userService.blockUser(profileData.user._id);
      navigate('/community'); // Redirect away from the profile after blocking
    } catch (err) {
      alert('Failed to block user.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Loader size="large" />
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
      {/* Profile Header */}
      <ProfileHeader elevation={0} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Avatar */}
          <Grid size={{ xs: 12, md: 'auto' }}>
            <ProfileAvatar
              src={user.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined}
              alt={user.username}
            >
              {!user.profilePic && user.username.charAt(0).toUpperCase()}
            </ProfileAvatar>
          </Grid>
          
          {/* User Info and Action Buttons */}
          <Grid size={{ xs: 12, md: true }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, mb: 1 }}>
                  {user.username}
                </Typography>
                
                {user.bio && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, maxWidth: 600 }}>
                    {user.bio}
                  </Typography>
                )}
                
                {/* Stats */}
                <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                      {posts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Posts
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                      {comments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Comments
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                      {user.followersCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Followers
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                      {user.followingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Following
                    </Typography>
                  </Box>
                </Stack>
                
                {/* Additional Info */}
                <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CakeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              {/* Action Buttons - Always in a straight line */}
              {isAuthenticated && currentUser?.username !== user.username && (
                <Stack direction="row" spacing={1} sx={{ 
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  flexShrink: 0,
                  ml: { xs: 0, md: 'auto' }
                }}>
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    sx={{ 
                      borderRadius: '50px', 
                      px: 3, 
                      py: 1,
                      fontFamily: theme.typography.fontFamily, 
                      minWidth: 100,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MailOutlineIcon />}
                    onClick={() => navigate('/messages', { state: { newConversationWith: user } })}
                    sx={{ 
                      borderRadius: '50px', 
                      px: 3, 
                      py: 1,
                      fontFamily: theme.typography.fontFamily, 
                      minWidth: 120,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Message
                  </Button>
                  <Tooltip title="Block user">
                    <IconButton
                      color="error"
                      onClick={handleBlockToggle}
                      sx={{ 
                        border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
                        width: 48,
                        height: 48
                      }}
                    >
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
      </ProfileHeader>

      {/* Activity Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile activity tabs" 
            centered
            sx={{ 
              '& .MuiTab-root': { 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
              }
            }}
          >
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`Posts (${posts.length})`} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`Comments (${comments.length})`} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
            {posts.length > 0 ? (
              <Grid container spacing={3}>
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
          <Box sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
            {comments.length > 0 ? (
              <Grid container spacing={2}>
                {comments.map((comment) => (
                  <Grid size={{ xs: 12 }} key={comment._id}>
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
      
      {/* Block Confirmation Dialog */}
      <Dialog open={blockConfirmOpen} onClose={() => setBlockConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Block {profileData?.user?.username}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to block this user? You will no longer see their content or be able to message them.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
          <Button onClick={confirmBlockUser} color="error" variant="contained" sx={{ fontFamily: theme.typography.fontFamily }}>
            Block User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicProfilePage;