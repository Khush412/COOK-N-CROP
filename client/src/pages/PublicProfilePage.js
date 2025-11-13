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
  CardActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  Slide,
  Collapse,
  CircularProgress,
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
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `5px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    width: 120,
    height: 120,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
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
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
}));

const CommentCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.secondary.main, 0.5),
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
      <Zoom in={true} timeout={500}>
        <PostCard>
          <CardContent sx={{ flexGrow: 1, pb: 1, px: 2.5, pt: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
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
                  transition: 'color 0.2s ease',
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                sx={{
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.3),
                    transform: 'rotate(90deg)',
                  },
                  ml: 1,
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            {item.content && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.5,
                }}
              >
                {item.content}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <StatChip 
                icon={<ThumbUpIcon sx={{ fontSize: 16 }} />} 
                label={item.likes?.length || 0} 
                size="small" 
                sx={{ 
                  height: 26,
                  '& .MuiChip-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: 16,
                  }
                }} 
              />
              <StatChip 
                icon={<CommentIcon sx={{ fontSize: 16 }} />} 
                label={item.comments?.length || 0} 
                size="small" 
                sx={{ 
                  height: 26,
                  '& .MuiChip-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: 16,
                  }
                }} 
              />
              <StatChip 
                icon={<VisibilityIcon sx={{ fontSize: 16 }} />} 
                label={item.views || 0} 
                size="small" 
                sx={{ 
                  height: 26,
                  '& .MuiChip-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: 16,
                  }
                }} 
              />
            </Box>
          </CardContent>
          
          <CardActions sx={{ pt: 0, px: 2.5, pb: 2, mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              size="small" 
              component={RouterLink} 
              to={`/post/${item._id}`}
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                fontWeight: 600,
                borderRadius: '20px',
                px: 2,
                py: 0.5,
              }}
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
            TransitionComponent={Fade}
            transitionDuration={200}
          >
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.3),
                },
                fontFamily: theme.typography.fontFamily,
              }}
            >
              <ListItemIcon>
                <BookmarkBorderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Save</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.3),
                },
                fontFamily: theme.typography.fontFamily,
              }}
            >
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
          </Menu>
        </PostCard>
      </Zoom>
    );
  } else {
    return (
      <Slide direction="up" in={true} timeout={500}>
        <CommentCard>
          <CardContent sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily,
                lineHeight: 1.6,
                position: 'relative',
                '&::before': {
                  content: '"“"',
                  fontSize: '2rem',
                  color: theme.palette.text.secondary,
                  position: 'absolute',
                  left: -12,
                  top: -8,
                },
              }}
            >
              {item.content}
            </Typography>
            
            <Box sx={{ pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                Commented on{' '}
                {item.post ? (
                  <Link 
                    component={RouterLink} 
                    to={`/post/${item.post._id}`} 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'bold', 
                      '&:hover': { 
                        color: 'primary.dark',
                        textDecoration: 'underline',
                      },
                      transition: 'color 0.2s ease, text-decoration 0.2s ease',
                    }}
                  >
                    {item.post.title}
                  </Link>
                ) : (
                  <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.disabled', fontFamily: theme.typography.fontFamily }}>
                    a deleted post
                  </Typography>
                )}
                {' '}{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </CardContent>
        </CommentCard>
      </Slide>
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

  // Share profile functionality
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${username}`;
    
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: `${profileData.user.username}'s Profile`,
          text: `Check out ${profileData.user.username}'s profile on Cook'nCrop`,
          url: profileUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      }
    } catch (err) {
      // Fallback: copy to clipboard if Web Share fails
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      } catch (clipboardErr) {
        alert('Failed to share profile. Please try again.');
      }
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
      <Slide direction="down" in={true} timeout={600}>
        <ProfileHeader elevation={0} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Avatar Section */}
            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Zoom in={true} timeout={700}>
                <ProfileAvatar
                  src={user.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined}
                  alt={user.username}
                />
              </Zoom>
            </Grid>

            {/* User Info and Stats Section */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Fade in={true} timeout={800}>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      fontFamily: theme.typography.fontFamily,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    @{user.username}
                  </Typography>
                  
                  {user.bio && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary', 
                        mb: 2,
                        lineHeight: 1.6,
                        fontFamily: theme.typography.fontFamily,
                      }}
                    >
                      {user.bio}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Grid container spacing={1}>
                    <Grid size={3}>
                      <Zoom in={true} timeout={900}>
                        <StatBox>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {posts.length}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5, 
                              fontWeight: 600,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          >
                            Posts
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1000}>
                        <StatBox>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {user.commentsCount || 0}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5, 
                              fontWeight: 600,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          >
                            Comments
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1100}>
                        <StatBox>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {user.followersCount || 0}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5, 
                              fontWeight: 600,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          >
                            Followers
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1200}>
                        <StatBox>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {user.followingCount || 0}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              textTransform: 'uppercase', 
                              letterSpacing: 0.5, 
                              fontWeight: 600,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          >
                            Following
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Grid>

            {/* Action Buttons Section */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Stack spacing={1.5}>
                {isAuthenticated && currentUser && currentUser.username !== username && (
                  <>
                    <Zoom in={true} timeout={1300}>
                      <Button
                        variant={isFollowing ? "outlined" : "contained"}
                        color="primary"
                        fullWidth
                        disabled={followLoading}
                        onClick={handleFollowToggle}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        {followLoading ? (
                          <CircularProgress size={20} sx={{ color: 'inherit' }} />
                        ) : isFollowing ? (
                          'Unfollow'
                        ) : (
                          'Follow'
                        )}
                      </Button>
                    </Zoom>
                    
                    <Zoom in={true} timeout={1400}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        component={RouterLink}
                        to={`/messages?to=${username}`}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        <MailOutlineIcon sx={{ mr: 1 }} />
                        Message
                      </Button>
                    </Zoom>
                    
                    <Zoom in={true} timeout={1500}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => setBlockConfirmOpen(true)}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        <BlockIcon sx={{ mr: 1 }} />
                        Block
                      </Button>
                    </Zoom>
                    
                    {/* Share Profile Button */}
                    <Zoom in={true} timeout={1600}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={handleShareProfile}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        <ShareIcon sx={{ mr: 1 }} />
                        Share Profile
                      </Button>
                    </Zoom>

                  </>
                )}
                
                {(!isAuthenticated || !currentUser || currentUser.username === username) && (
                  <Zoom in={true} timeout={1300}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={RouterLink}
                      to="/profile"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontFamily: theme.typography.fontFamily,
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Zoom>
                )}
              </Stack>
            </Grid>
          </Grid>
        </ProfileHeader>
      </Slide>

      {/* Activity Tabs */}
      <Slide direction="up" in={true} timeout={1500}>
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
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
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                  py: 2,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              <Tab icon={<PostAddIcon />} iconPosition="start" label={`Posts (${posts.length})`} />
              <Tab icon={<CommentIcon />} iconPosition="start" label={`Comments (${comments.length})`} />
            </Tabs>
          </Box>

          {/* Posts Tab */}
          {tabValue === 0 && (
            <Box sx={{ pt: 3, px: { xs: 2, sm: 3 }, pb: 3 }}>
              {posts.length > 0 ? (
                <Grid container spacing={3}>
                  {posts.map((post, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                      <Collapse in={true} timeout={500 + (index * 100)}>
                        <ActivityCard item={post} type="post" />
                      </Collapse>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                    No posts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    This user hasn't made any posts yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Comments Tab */}
          {tabValue === 1 && (
            <Box sx={{ pt: 3, px: { xs: 2, sm: 3 }, pb: 3 }}>
              {comments.length > 0 ? (
                <Grid container spacing={2.5}>
                  {comments.map((comment, index) => (
                    <Grid size={{ xs: 12 }} key={comment._id}>
                      <Collapse in={true} timeout={500 + (index * 100)}>
                        <ActivityCard item={comment} type="comment" />
                      </Collapse>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                    No comments yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    This user hasn't made any comments yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Slide>
      
      {/* Block Confirmation Dialog */}
      <Dialog 
        open={blockConfirmOpen} 
        onClose={() => setBlockConfirmOpen(false)}
        TransitionComponent={Zoom}
        transitionDuration={300}
      >
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Block {profileData?.user?.username}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to block this user? You will no longer see their content or be able to message them.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBlockConfirmOpen(false)} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmBlockUser} 
            color="error" 
            variant="contained" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            Block User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicProfilePage;