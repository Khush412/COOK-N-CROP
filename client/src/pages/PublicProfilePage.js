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
  useMediaQuery,
  Snackbar,
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
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-1px)',
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

const ActivityCard = ({ item, type, isAuthenticated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle save functionality
  const handleSave = () => {
    handleMenuClose();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to save posts', severity: 'info' });
      return;
    }
    
    // TODO: Implement actual save functionality
    setSnackbar({ open: true, message: 'Post saved successfully!', severity: 'success' });
  };

  // Handle share functionality
  const handleShare = async () => {
    handleMenuClose();
    const postUrl = `${window.location.origin}/post/${item._id}`;
    
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: item.title,
          text: `Check out this post on Cook'nCrop`,
          url: postUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(postUrl);
        setSnackbar({ open: true, message: 'Post link copied to clipboard!', severity: 'success' });
      }
    } catch (err) {
      // Fallback: copy to clipboard if Web Share fails
      try {
        await navigator.clipboard.writeText(postUrl);
        setSnackbar({ open: true, message: 'Post link copied to clipboard!', severity: 'success' });
      } catch (clipboardErr) {
        setSnackbar({ open: true, message: 'Failed to share post. Please try again.', severity: 'error' });
      }
    }
  };

  if (type === 'post') {
    return (
      <Zoom in={true} timeout={500}>
        <PostCard>
          <CardContent sx={{ flexGrow: 1, pb: 1, px: isMobile ? 1.5 : 2.5, pt: isMobile ? 1.5 : 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: isMobile ? 1 : 1.5 }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
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
                  fontSize: { xs: '1rem', sm: '1.25rem' },
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
                  padding: isMobile ? 0.5 : 1,
                }}
              >
                <MoreVertIcon sx={{ fontSize: isMobile ? '1rem' : '1.5rem' }} />
              </IconButton>
            </Box>
            
            {item.content && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: isMobile ? 1.5 : 2,
                  display: '-webkit-box',
                  WebkitLineClamp: isMobile ? 2 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                }}
              >
                {item.content}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, mt: isMobile ? 1 : 1.5, pt: isMobile ? 1 : 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <StatChip 
                icon={<ThumbUpIcon sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                label={item.likes?.length || 0} 
                size="small" 
                sx={{ 
                  height: isMobile ? 22 : 26,
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    fontWeight: 600,
                    px: isMobile ? 0.5 : 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: isMobile ? 14 : 16,
                  }
                }} 
              />
              <StatChip 
                icon={<CommentIcon sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                label={item.comments?.length || 0} 
                size="small" 
                sx={{ 
                  height: isMobile ? 22 : 26,
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    fontWeight: 600,
                    px: isMobile ? 0.5 : 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: isMobile ? 14 : 16,
                  }
                }} 
              />
              <StatChip 
                icon={<VisibilityIcon sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                label={item.views || 0} 
                size="small" 
                sx={{ 
                  height: isMobile ? 22 : 26,
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    fontWeight: 600,
                    px: isMobile ? 0.5 : 0.8,
                  },
                  '& .MuiChip-icon': {
                    fontSize: isMobile ? 14 : 16,
                  }
                }} 
              />
            </Box>
          </CardContent>
          
          <CardActions sx={{ pt: 0, px: isMobile ? 1.5 : 2.5, pb: isMobile ? 1.5 : 2, mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              size={isMobile ? "small" : "medium"} 
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
                px: isMobile ? 1.5 : 2,
                py: isMobile ? 0.3 : 0.5,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
              onClick={handleSave}
              sx={{
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.3),
                },
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              <ListItemIcon>
                <BookmarkBorderIcon fontSize={isMobile ? "small" : "medium"} />
              </ListItemIcon>
              <ListItemText>Save</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={handleShare}
              sx={{
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.3),
                },
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              <ListItemIcon>
                <ShareIcon fontSize={isMobile ? "small" : "medium"} />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
          </Menu>
          
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </PostCard>
      </Zoom>
    );
  } else {
    // For comment cards, we don't need the menu functionality
    return (
      <Slide direction="up" in={true} timeout={500}>
        <CommentCard>
          <CardContent sx={{ px: isMobile ? 1.5 : 2.5, pt: isMobile ? 1.5 : 2.5, pb: isMobile ? 1.5 : 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                mb: isMobile ? 1.5 : 2,
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 3 : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily,
                lineHeight: 1.6,
                position: 'relative',
                '&::before': {
                  content: '"“"',
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  color: theme.palette.text.secondary,
                  position: 'absolute',
                  left: -12,
                  top: -8,
                },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
              }}
            >
              {item.content}
            </Typography>
            
            <Box sx={{ pt: isMobile ? 1 : 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
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
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    }}
                  >
                    {item.post.title}
                  </Link>
                ) : (
                  <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.disabled', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, mt: { xs: 6, sm: 8 } }}>
      {/* Profile Header */}
      <Slide direction="down" in={true} timeout={600}>
        <ProfileHeader elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
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
                    variant={isMobile ? "h5" : "h4"} 
                    sx={{ 
                      fontWeight: 700, 
                      fontFamily: theme.typography.fontFamily,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      textAlign: isMobile ? 'center' : 'left',
                    }}
                  >
                    @{user.username}
                  </Typography>
                  
                  {user.bio && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        mb: 2,
                        lineHeight: 1.6,
                        fontFamily: theme.typography.fontFamily,
                        textAlign: isMobile ? 'center' : 'left',
                      }}
                    >
                      {user.bio}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Grid container spacing={0.5}>
                    <Grid size={3}>
                      <Zoom in={true} timeout={900}>
                        <StatBox sx={{ p: 0.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                              fontSize: { xs: '0.75rem', sm: '1.25rem' },
                              lineHeight: 1.2,
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
                              fontSize: { xs: '0.45rem', sm: '0.75rem' },
                              lineHeight: 1.1,
                            }}
                          >
                            Posts
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1000}>
                        <StatBox sx={{ p: 0.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                              fontSize: { xs: '0.75rem', sm: '1.25rem' },
                              lineHeight: 1.2,
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
                              fontSize: { xs: '0.45rem', sm: '0.75rem' },
                              lineHeight: 1.1,
                            }}
                          >
                            Comments
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1100}>
                        <StatBox sx={{ p: 0.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                              fontSize: { xs: '0.75rem', sm: '1.25rem' },
                              lineHeight: 1.2,
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
                              fontSize: { xs: '0.45rem', sm: '0.75rem' },
                              lineHeight: 1.1,
                            }}
                          >
                            Followers
                          </Typography>
                        </StatBox>
                      </Zoom>
                    </Grid>
                    <Grid size={3}>
                      <Zoom in={true} timeout={1200}>
                        <StatBox sx={{ p: 0.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily,
                              color: theme.palette.primary.main,
                              fontSize: { xs: '0.75rem', sm: '1.25rem' },
                              lineHeight: 1.2,
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
                              fontSize: { xs: '0.45rem', sm: '0.75rem' },
                              lineHeight: 1.1,
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
              <Stack spacing={isMobile ? 1 : 1.5}>
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
                          py: isMobile ? 1 : 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {followLoading ? (
                          <Loader size="small" color="inherit" />
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
                          py: isMobile ? 1 : 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        <MailOutlineIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
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
                          py: isMobile ? 1 : 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        <BlockIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        Block
                      </Button>
                    </Zoom>
                  </>
                )}

                {isAuthenticated && currentUser && currentUser.username === username && (
                  <Zoom in={true} timeout={1300}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={RouterLink}
                      to="/profile"
                      sx={{
                        py: isMobile ? 1 : 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Zoom>
                )}
                
                {/* Share Profile Button - Always visible */}
                <Zoom in={true} timeout={1600}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={handleShareProfile}
                    sx={{
                      py: isMobile ? 1 : 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    <ShareIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    Share Profile
                  </Button>
                </Zoom>
              </Stack>
            </Grid>
          </Grid>
        </ProfileHeader>
      </Slide>

      {/* Activity Tabs */}
      <Slide direction="up" in={true} timeout={1500}>
        <Paper elevation={0} sx={{ borderRadius: { xs: 2, sm: 4 }, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile activity tabs" 
              centered
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{ 
                '& .MuiTab-root': { 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: isMobile ? 80 : 120,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                  py: isMobile ? 1.5 : 2,
                  px: isMobile ? 1 : 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              <Tab icon={<PostAddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />} iconPosition="start" label={`Posts (${posts.length})`} />
              <Tab icon={<CommentIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />} iconPosition="start" label={`Comments (${comments.length})`} />
            </Tabs>
          </Box>

          {/* Posts Tab */}
          {tabValue === 0 && (
            <Box sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
              {posts.length > 0 ? (
                <Grid container spacing={isMobile ? 2 : 3}>
                  {posts.map((post, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                      <Collapse in={true} timeout={500 + (index * 100)}>
                        <ActivityCard item={post} type="post" isAuthenticated={isAuthenticated} />
                      </Collapse>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 } }}>
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
            <Box sx={{ pt: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
              {comments.length > 0 ? (
                <Grid container spacing={isMobile ? 1.5 : 2.5}>
                  {comments.map((comment, index) => (
                    <Grid size={{ xs: 12 }} key={comment._id}>
                      <Collapse in={true} timeout={500 + (index * 100)}>
                        <ActivityCard item={comment} type="comment" isAuthenticated={isAuthenticated} />
                      </Collapse>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 5 } }}>
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