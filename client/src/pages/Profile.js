import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
  Fade,
  useMediaQuery,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Zoom,
  Slide,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShareIcon from '@mui/icons-material/Share';
import { format, formatDistanceToNow } from 'date-fns';
import userService from '../services/userService';
import api from '../config/axios';
import { useAuth } from "../contexts/AuthContext";
import { getHarvestCoinsBalance } from '../services/loyaltyService';
import Loader from '../custom_components/Loader';

const SOCIALS = [
  { name: "Google", key: "google", icon: GoogleIcon, color: "#DB4437" },
  { name: "GitHub", key: "github", icon: GitHubIcon, color: "#24292f" },
  { name: "LinkedIn", key: "linkedin", icon: LinkedInIcon, color: "#0A66C2" },
];

const ProfileEditModal = ({ open, onClose, user, onSave }) => {
  const [form, setForm] = useState({ username: '', bio: '' });
  const [newPic, setNewPic] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', bio: user.bio || '' });
      setImagePreview(user.profilePic || '');
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username' && !/^[a-zA-Z0-9_]*$/.test(value)) return;
    if (name === 'bio' && value.length > 500) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewPic(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('username', form.username.trim());
      data.append('bio', form.bio.trim());
      if (newPic) data.append('profilePic', newPic);
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Zoom}
      transitionDuration={300}
    >
      <Zoom in={open} timeout={300}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Edit Profile</DialogTitle>
      </Zoom>
      <DialogContent>
        <Fade in={!!error} timeout={500}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </Fade>
        <Slide direction="down" in={open} timeout={400}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
            <Avatar 
              src={getImageUrl(imagePreview)} 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }} 
            />
            <Button 
              variant="outlined" 
              onClick={() => fileInputRef.current?.click()} 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Change Picture
            </Button>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Box>
        </Slide>
        <Slide direction="up" in={open} timeout={500}>
          <TextField 
            label="Username" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
            helperText="3-30 chars; letters, numbers, underscores only" 
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
            sx={{ 
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateX(5px)',
              },
            }} 
          />
        </Slide>
        <Slide direction="up" in={open} timeout={600}>
          <TextField 
            label="Bio" 
            name="bio" 
            value={form.bio} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={4} 
            margin="normal" 
            helperText={`${form.bio.length}/500 characters`} 
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
            sx={{ 
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateX(5px)',
              },
            }} 
          />
        </Slide>
      </DialogContent>
      <DialogActions>
        <Slide direction="right" in={open} timeout={700}>
          <Button 
            onClick={onClose} 
            disabled={loading} 
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
        </Slide>
        <Slide direction="left" in={open} timeout={700}>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading} 
            startIcon={loading ? <Loader  /> : <SaveIcon />} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            Save
          </Button>
        </Slide>
      </DialogActions>
    </Dialog>
  );
};

const Profile = () => {
  const theme = useTheme();
  const { user, loadUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activityTab, setActivityTab] = useState(0);
  const [harvestCoins, setHarvestCoins] = useState({ balance: 0, totalSpent: 0, totalOrders: 0 });
  const [harvestCoinsLoading, setHarvestCoinsLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ error: "", success: "" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [socialToUnlink, setSocialToUnlink] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await userService.getDashboardData();
      setDashboardData(res.data);
      
      // Fetch Harvest Coins balance
      try {
        setHarvestCoinsLoading(true);
        const coinsData = await getHarvestCoinsBalance();
        if (coinsData.success) {
          setHarvestCoins({
            balance: coinsData.balance,
            totalSpent: coinsData.totalSpent,
            totalOrders: coinsData.totalOrders
          });
        }
      } catch (error) {
        console.error('Failed to fetch Harvest Coins:', error);
      } finally {
        setHarvestCoinsLoading(false);
      }
    } catch (error) {
      setFeedback({ error: "Failed to load dashboard data.", success: "" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleProfileSave = async (formData) => {
    try {
      const res = await userService.updateProfile(formData);
      // Update the user context instead of trying to set user state directly
      await loadUser(); // Reload user context to reflect changes globally
      setFeedback({ success: 'Profile updated successfully!' });
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to update profile.' });
    }
  };

  // Share profile functionality
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${user?.username}`;
    
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: `${user?.username}'s Profile`,
          text: `Check out ${user?.username}'s profile on Cook'nCrop`,
          url: profileUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(profileUrl);
        setFeedback({ success: 'Profile link copied to clipboard!' });
      }
    } catch (err) {
      // Fallback: copy to clipboard if Web Share fails
      try {
        await navigator.clipboard.writeText(profileUrl);
        setFeedback({ success: 'Profile link copied to clipboard!' });
      } catch (clipboardErr) {
        setFeedback({ error: 'Failed to share profile. Please try again.' });
      }
    }
  };

  const handleUnlinkSocial = (key) => {
    setSocialToUnlink(key);
    setUnlinkConfirmOpen(true);
  };

  const confirmUnlinkSocial = async () => {
    if (!socialToUnlink) return;
    try {
      await api.delete(`/users/me/social/unlink/${socialToUnlink}`);
      await loadUser(); // Reload user context to reflect changes
      setFeedback({ error: "", success: `${socialToUnlink.charAt(0).toUpperCase() + socialToUnlink.slice(1)} account unlinked successfully.` });
    } catch (err) {
      setFeedback({ error: `Failed to unlink ${socialToUnlink}.`, success: "" });
    } finally {
      setUnlinkConfirmOpen(false);
      setSocialToUnlink(null);
    }
  };

  const linkSocial = (key) => {
    // Redirect to the backend OAuth endpoint to start the linking process
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/${key}`;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ error: "New passwords do not match.", success: "" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ error: "New password must be at least 6 characters.", success: "" });
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback({ error: "", success: "" });
    try {
      const res = await userService.changePassword(passwordForm);
      setPasswordFeedback({ error: "", success: res.message });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordFeedback({
        error: error.message || "Failed to change password.",
        success: "",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await userService.deleteAccount(deletePassword);
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      // The backend clears the cookie, so we just need to update the frontend state
      logout();
      navigate('/', { state: { message: 'Your account has been successfully deleted.' } });
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account. Please check your password.');
      setDeleteLoading(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteError('');
    setDeletePassword('');
    setDeleteDialogOpen(true);
  };

  const statusColors = { Pending: 'warning', Processing: 'info', Shipped: 'primary', Delivered: 'success', Canceled: 'error' };

  if (loading) {
    return (
      <Box sx={{ mt: 20, textAlign: "center" }}>
        <Loader size="large" />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{ 
        flexGrow: 1, 
        py: { xs: 2, sm: 4 }, 
        mt: { xs: 1, sm: 2 }, 
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="lg">
        <Slide direction="down" in={true} timeout={500}>
          <Box>
            <Fade in={!!feedback.error} timeout={500}>
              <Alert variant="filled" severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                {feedback.error}
              </Alert>
            </Fade>
            <Fade in={!!feedback.success} timeout={500}>
              <Alert 
                variant="filled" 
                severity="success" 
                sx={{ mb: 2, fontFamily: theme.typography.fontFamily }} 
                onClose={() => setFeedback({ ...feedback, success: '' })}
              >
                {feedback.success}
              </Alert>
            </Fade>
          </Box>
        </Slide>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Profile Header Card */} 
          <Grid size={{ xs: 12 }}>
            <Zoom in={true} timeout={600}>
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)} 70%)`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  spacing={{ xs: 3, sm: 4 }} 
                  alignItems="center"
                  sx={{ width: '100%' }}
                >
                  <Avatar 
                    src={user?.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user?.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined} 
                    sx={{
                      width: { xs: 100, sm: 120, md: 140 },
                      height: { xs: 100, sm: 120, md: 140 },
                      border: `5px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[8],
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.08)',
                        boxShadow: theme.shadows[16],
                      },
                    }}
                  />
                  <Box 
                    flexGrow={1} 
                    textAlign={{ xs: 'center', md: 'left' }}
                    sx={{ width: '100%' }}
                  >
                    <Typography 
                      variant="h3" 
                      fontWeight="800" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
                      }}
                    >
                      {user?.username}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 1, 
                        maxWidth: { xs: '100%', sm: '80%', md: '70%' }, 
                        mx: { xs: 'auto', md: 0 }, 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.6
                      }}
                    >
                      {user?.bio || 'No bio provided.'}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: { xs: 'center', md: 'flex-start' }, 
                        mt: 2,
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Chip 
                        label={`Member since ${user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : ''}`} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          fontFamily: theme.typography.fontFamily
                        }} 
                      />
                      <Chip 
                        label={`${dashboardData?.recentPosts?.length || 0} Posts`} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                          fontWeight: 600,
                          fontFamily: theme.typography.fontFamily
                        }} 
                      />
                    </Box>
                  </Box>
                  <Slide direction="left" in={true} timeout={700}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<ShareIcon />}
                        onClick={handleShareProfile}
                        sx={{ 
                          alignSelf: { xs: 'center', md: 'flex-start' }, 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 600,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          boxShadow: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        Share Profile
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<EditIcon />}
                        onClick={() => setEditModalOpen(true)}
                        sx={{ 
                          alignSelf: { xs: 'center', md: 'flex-start' }, 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 600,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          boxShadow: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        Edit Profile
                      </Button>
                    </Stack>
                  </Slide>
                </Stack>
              </Paper>
            </Zoom>
          </Grid>

          {/* Harvest Coins Card */} 
          <Grid size={{ xs: 12 }}>
            <Slide direction="up" in={true} timeout={800}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  borderRadius: { xs: 2, sm: 3 }, 
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <EmojiEventsIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h5" fontWeight="800" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Harvest Coins Loyalty Program
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.15), 
                    borderRadius: 2, 
                    mb: { xs: 1.5, sm: 2 },
                    border: `1px dashed ${alpha(theme.palette.secondary.main, 0.4)}`
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: '600',
                      color: theme.palette.secondary.main,
                      textAlign: 'center'
                    }}
                  >
                    {user?.role === 'admin' 
                      ? 'As an admin, you can earn and use Harvest Coins on all orders!' 
                      : 'You\'re automatically enrolled in the Harvest Coins program after 10 orders!'}
                  </Typography>
                </Box>
                
                {harvestCoinsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Loader  />
                  </Box>
                ) : (
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Zoom in={true} timeout={900}>
                        <Paper 
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center', 
                            borderRadius: 2, 
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-5px)',
                              boxShadow: theme.shadows[4]
                            },
                            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`
                          }}
                        >
                          <Typography 
                            variant="h3" 
                            fontWeight="800" 
                            color="secondary.main" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontSize: { xs: '1.75rem', sm: '2rem' }
                            }}
                          >
                            {harvestCoins.balance}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontWeight: 600
                            }}
                          >
                            Harvest Coins Balance
                          </Typography>
                        </Paper>
                      </Zoom>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Zoom in={true} timeout={1000}>
                        <Paper 
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center', 
                            borderRadius: 2, 
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-5px)',
                              boxShadow: theme.shadows[4]
                            },
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                            <CurrencyRupeeIcon sx={{ fontSize: { xs: 20, sm: 24 }, mr: 0.5 }} />
                            <Typography 
                              variant="h3" 
                              fontWeight="800" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                fontSize: { xs: '1.75rem', sm: '2rem' }
                              }}
                            >
                              {harvestCoins.totalSpent.toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontWeight: 600
                            }}
                          >
                            Total Spent
                          </Typography>
                        </Paper>
                      </Zoom>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Zoom in={true} timeout={1100}>
                        <Paper 
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center', 
                            borderRadius: 2, 
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-5px)',
                              boxShadow: theme.shadows[4]
                            },
                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`
                          }}
                        >
                          <Typography 
                            variant="h3" 
                            fontWeight="800" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontSize: { xs: '1.75rem', sm: '2rem' },
                              color: theme.palette.info.main
                            }}
                          >
                            {harvestCoins.totalOrders}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontWeight: 600
                            }}
                          >
                            Total Orders
                          </Typography>
                        </Paper>
                      </Zoom>
                    </Grid>
                  </Grid>
                )}
                
                <Box sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                  <Slide direction="up" in={true} timeout={1200}>
                    <Button 
                      component={RouterLink} 
                      to="/rewards" 
                      variant="contained" 
                      size="medium"
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 600,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.8, sm: 1 },
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      View Rewards & Benefits
                    </Button>
                  </Slide>
                </Box>
              </Paper>
            </Slide>
          </Grid>

          {/* Recent Orders Card */} 
          <Grid size={{ xs: 12, md: 6 }}>
            <Slide direction="left" in={true} timeout={1300}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3, transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[6] } }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Recent Orders</Typography>
                {dashboardData?.recentOrders?.length > 0 ? (
                  <Stack spacing={2} divider={<Divider />}>
                    {dashboardData.recentOrders.map((order, index) => (
                      <Collapse key={order._id} in={true} timeout={500 + (index * 100)}>
                        <Box key={order._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, transition: 'background-color 0.2s ease', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.3), borderRadius: 1 } }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Order #{order._id.slice(-6)}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(order.createdAt), 'PP')}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
                            <Button 
                              component={RouterLink} 
                              to={`/order/${order._id}`} 
                              size="small"
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              View
                            </Button>
                          </Stack>
                        </Box>
                      </Collapse>
                    ))}
                  </Stack>
                ) : <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No recent orders.</Typography>}
                <Slide direction="up" in={true} timeout={1500}>
                  <Button 
                    component={RouterLink} 
                    to="/profile/orders" 
                    sx={{ 
                      mt: 2, 
                      fontFamily: theme.typography.fontFamily,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    View All Orders
                  </Button>
                </Slide>
              </Paper>
            </Slide>
          </Grid>

          {/* Recent Activity Card */} 
          <Grid size={{ xs: 12, md: 6 }}>
            <Slide direction="right" in={true} timeout={1400}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3, transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[6] } }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Recent Activity</Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={activityTab} 
                    onChange={(e, newValue) => setActivityTab(newValue)} 
                    aria-label="activity tabs"
                    sx={{
                      '& .MuiTab-root': {
                        transition: 'color 0.2s ease',
                      },
                      '& .MuiTab-root:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Tab label="Posts" sx={{ fontFamily: theme.typography.fontFamily }} />
                    <Tab label="Comments" sx={{ fontFamily: theme.typography.fontFamily }} />
                  </Tabs>
                </Box>
                {activityTab === 0 && (
                  <List>
                    {dashboardData?.recentPosts?.length > 0 ? dashboardData.recentPosts.map((post, index) => (
                      <Collapse key={post._id} in={true} timeout={500 + (index * 100)}>
                        <ListItemButton 
                          component={RouterLink} 
                          to={`/post/${post._id}`} 
                          divider
                          sx={{ 
                            transition: 'background-color 0.2s ease', 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.action.hover, 0.3),
                              transform: 'translateX(5px)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={post.title}
                            secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`}
                            primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                            secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                          />
                        </ListItemButton>
                      </Collapse>
                    )) : <Typography color="text.secondary" sx={{ p: 2, fontFamily: theme.typography.fontFamily }}>No recent posts.</Typography>}
                  </List>
                )}
                {activityTab === 1 && (
                  <List>
                    {dashboardData?.recentComments?.length > 0 ? dashboardData.recentComments.map((comment, index) => (
                      <Collapse key={comment._id} in={true} timeout={500 + (index * 100)}>
                        <ListItemButton 
                          key={comment._id} 
                          component={comment.post ? RouterLink : 'div'} 
                          to={comment.post ? `/post/${comment.post._id}` : undefined} 
                          divider 
                          sx={{ 
                            cursor: comment.post ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease', 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.action.hover, 0.3),
                              transform: 'translateX(5px)',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={`"${comment.content.substring(0, 50)}..."`} 
                            secondary={
                              comment.post 
                                ? `On "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`
                                : `On a deleted post • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`
                            }
                            primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} 
                            secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily, color: comment.post ? 'text.secondary' : 'text.disabled' }} 
                          />
                        </ListItemButton>
                      </Collapse>
                    )) : <Typography color="text.secondary" sx={{ p: 2, fontFamily: theme.typography.fontFamily }}>No recent comments.</Typography>}
                  </List>
                )}
                <Slide direction="up" in={true} timeout={1500}>
                  <Button 
                    component={RouterLink} 
                    to="/profile/my-activity" 
                    sx={{ 
                      mt: 2, 
                      fontFamily: theme.typography.fontFamily,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    View All Activity
                  </Button>
                </Slide>
              </Paper>
            </Slide>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Security Section */}
        <Slide direction="up" in={true} timeout={1600}>
          <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />} 
              sx={{ 
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                  borderRadius: 1,
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Account Security</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>Change Password</Typography>
                <Fade in={!!passwordFeedback.error} timeout={500}>
                  <Alert variant="filled" severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                    {passwordFeedback.error}
                  </Alert>
                </Fade>
                <Fade in={!!passwordFeedback.success} timeout={500}>
                  <Alert 
                    variant="filled" 
                    severity="success" 
                    sx={{ mb: 2, fontFamily: theme.typography.fontFamily }} 
                    onClose={() => setPasswordFeedback({ ...passwordFeedback, success: '' })}
                  >
                    {passwordFeedback.success}
                  </Alert>
                </Fade>
                <Box component="form" onSubmit={savePassword}>
                  <Stack spacing={2}>
                    <TextField 
                      type="password" 
                      label="Current Password" 
                      name="currentPassword" 
                      variant="filled" 
                      fullWidth 
                      required 
                      value={passwordForm.currentPassword} 
                      onChange={handlePasswordChange} 
                      disabled={passwordLoading} 
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
                      sx={{ 
                        '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(5px)',
                        },
                      }} 
                    />
                    <TextField 
                      type="password" 
                      label="New Password" 
                      name="newPassword" 
                      variant="filled" 
                      fullWidth 
                      required 
                      value={passwordForm.newPassword} 
                      onChange={handlePasswordChange} 
                      disabled={passwordLoading} 
                      helperText="Min 6 characters." 
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
                      sx={{ 
                        '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(5px)',
                        },
                      }} 
                    />
                    <TextField 
                      type="password" 
                      label="Confirm New Password" 
                      name="confirmPassword" 
                      variant="filled" 
                      fullWidth 
                      required 
                      value={passwordForm.confirmPassword} 
                      onChange={handlePasswordChange} 
                      disabled={passwordLoading} 
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
                      sx={{ 
                        '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(5px)',
                        },
                      }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Slide direction="up" in={true} timeout={1700}>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          disabled={passwordLoading} 
                          startIcon={passwordLoading ? <Loader  /> : null} 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          {passwordLoading ? 'Updating...' : 'Change Password'}
                        </Button>
                      </Slide>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Slide>

        <Slide direction="up" in={true} timeout={1700}>
          <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />} 
              sx={{ 
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                  borderRadius: 1,
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Linked Accounts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
                  Link your social accounts for easy login. Unlinking an account may prevent you from logging in if you don't have a password set.
                </Typography>
                <Stack spacing={2}>
                  {SOCIALS.map(({ name, key, icon: Icon, color }) => {
                    const linked = !!user?.[key]?.id;
                    return (
                      <Zoom key={key} in={true} timeout={500}>
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[2] } }}>
                          <Icon sx={{ color, mr: 2, fontSize: 28 }} />
                          <Typography variant="subtitle1" fontWeight="bold" flexGrow={1} sx={{ fontFamily: theme.typography.fontFamily }}>{name}</Typography>
                          {linked ? (
                            <Button 
                              variant="outlined" 
                              color="error" 
                               
                              onClick={() => handleUnlinkSocial(key)} 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              Unlink
                            </Button>
                          ) : (
                            <Button 
                              variant="contained" 
                               
                              onClick={() => linkSocial(key)} 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              Link Account
                            </Button>
                          )}
                        </Box>
                      </Zoom>
                    );
                  })}
                </Stack>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Slide>

        <Slide direction="up" in={true} timeout={1800}>
          <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />} 
              sx={{ 
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                  borderRadius: 1,
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontFamily: theme.typography.fontFamily }}>Danger Zone</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant="outlined" sx={{ p: 3, border: 1, borderColor: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} color="error.main" sx={{ fontFamily: theme.typography.fontFamily }}>Delete Account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, fontFamily: theme.typography.fontFamily }}>This action is permanent and cannot be undone. All your personal data will be anonymized.</Typography>
                <Slide direction="up" in={true} timeout={1900}>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={openDeleteDialog} 
                    startIcon={<WarningAmberIcon />} 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    Delete My Account
                  </Button>
                </Slide>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Slide>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Are you absolutely sure?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
              This action is irreversible. To confirm, please enter your password below.
            </DialogContentText>
            <Fade in={!!deleteError} timeout={500}>
              <Alert severity="error" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
                {deleteError}
              </Alert>
            </Fade>
            <TextField 
              sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
              autoFocus 
              margin="dense" 
              id="delete-password" 
              label="Your Password" 
              type="password"
              fullWidth 
              variant="standard" 
              value={deletePassword} 
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading} 
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={deleteLoading} 
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
              onClick={handleDeleteAccount} 
              color="error" 
              variant="contained"
              disabled={deleteLoading || !deletePassword} 
              startIcon={deleteLoading ? <Loader  /> : null}
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

        <ProfileEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={user}
          onSave={handleProfileSave}
        />
      </Container>

      {/* Unlink Social Confirmation Dialog */}
      <Dialog open={unlinkConfirmOpen} onClose={() => setUnlinkConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
          Unlink {socialToUnlink?.charAt(0).toUpperCase() + socialToUnlink?.slice(1)} Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure? If you don't have a password set for your Cook'N'Crop account, you might be locked out.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUnlinkConfirmOpen(false)} 
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
            onClick={confirmUnlinkSocial} 
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
            Unlink
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;
