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
  IconButton,
  Tooltip,
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
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format, formatDistanceToNow } from 'date-fns';
import userService from '../services/userService';
import api from '../config/axios';
import { useAuth } from "../contexts/AuthContext";

const SOCIALS = [
  { name: "Google", key: "google", icon: GoogleIcon, color: "#DB4437" },
  { name: "GitHub", key: "github", icon: GitHubIcon, color: "#24292f" },
  { name: "Twitter", key: "twitter", icon: TwitterIcon, color: "#1DA1F2" },
];

const ProfileEditModal = ({ open, onClose, user, onSave }) => {
  const [form, setForm] = useState({ username: '', bio: '' });
  const [newPic, setNewPic] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const theme = useTheme();

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Edit Profile</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Avatar src={imagePreview} sx={{ width: 120, height: 120, mb: 2 }} />
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ fontFamily: theme.typography.fontFamily }}>Change Picture</Button>
          <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Box>
        <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" helperText="3-30 chars; letters, numbers, underscores only" InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
        <TextField label="Bio" name="bio" value={form.bio} onChange={handleChange} fullWidth multiline rows={4} margin="normal" helperText={`${form.bio.length}/500 characters`} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ fontFamily: theme.typography.fontFamily }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, loadUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activityTab, setActivityTab] = useState(0);

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

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await userService.getDashboardData();
      setDashboardData(res.data);
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
    await api.put("/users/me", formData);
    await loadUser(); // Reload user context to reflect changes globally
    setFeedback({ success: "Profile updated successfully.", error: "" });
  };

  const unlinkSocial = async (key) => {
    if (!window.confirm(`Are you sure you want to unlink your ${key.charAt(0).toUpperCase() + key.slice(1)} account? If you don't have a password set, you may be locked out.`)) return;
    try {
      await api.delete(`/users/me/social/unlink/${key}`);
      await loadUser(); // Reload user context to reflect changes
      setFeedback({ error: "", success: `${key.charAt(0).toUpperCase() + key.slice(1)} account unlinked successfully.` });
    } catch (err) {
      setFeedback({ error: `Failed to unlink ${key}.`, success: "" });
    }
  };

  const linkSocial = (key) => {
    // Redirect to the backend OAuth endpoint to start the linking process
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/${key}`;
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
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, py: 4, mt: 8, bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight={900}
          sx={{
            mb: 4,
            letterSpacing: 1.2,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          My Dashboard
        </Typography>

        <Fade in={!!feedback.error}><Alert variant="filled" severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{feedback.error}</Alert></Fade>
        <Fade in={!!feedback.success}><Alert variant="filled" severity="success" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }} onClose={() => setFeedback({ ...feedback, success: '' })}>{feedback.success}</Alert></Fade>

        <Grid container spacing={4}>
          {/* Profile Header Card */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)} 70%)`,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="center">
                <Avatar src={user?.profilePic} sx={{
                    width: { xs: 80, sm: 120 },
                    height: { xs: 80, sm: 120 },
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[3],
                  }}
                />
                <Box flexGrow={1} textAlign={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{user?.username}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: { xs: 'auto', sm: 0 }, fontFamily: theme.typography.fontFamily }}>
                    {user?.bio || 'No bio provided.'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditModalOpen(true)}
                  sx={{ alignSelf: { xs: 'center', sm: 'flex-start' }, fontFamily: theme.typography.fontFamily }}
                >
                  Edit Profile
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Recent Orders Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Recent Orders</Typography>
              {dashboardData?.recentOrders?.length > 0 ? (
                <Stack spacing={2} divider={<Divider />}>
                  {dashboardData.recentOrders.map(order => (
                    <Box key={order._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Order #{order._id.slice(-6)}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(order.createdAt), 'PP')}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
                        <Button component={RouterLink} to={`/order/${order._id}`} size="small" sx={{ fontFamily: theme.typography.fontFamily }}>View</Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No recent orders.</Typography>}
              <Button component={RouterLink} to="/profile/orders" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>View All Orders</Button>
            </Paper>
          </Grid>

          {/* Recent Activity Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Recent Activity</Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activityTab} onChange={(e, newValue) => setActivityTab(newValue)} aria-label="activity tabs">
                  <Tab label="Posts" sx={{ fontFamily: theme.typography.fontFamily }} />
                  <Tab label="Comments" sx={{ fontFamily: theme.typography.fontFamily }} />
                </Tabs>
              </Box>
              {activityTab === 0 && (
                <List>
                  {dashboardData?.recentPosts?.length > 0 ? dashboardData.recentPosts.map(post => (
                    <ListItemButton key={post._id} component={RouterLink} to={`/post/${post._id}`} divider>
                      <ListItemText primary={post.title} secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                    </ListItemButton>
                  )) : <Typography color="text.secondary" sx={{ p: 2, fontFamily: theme.typography.fontFamily }}>No recent posts.</Typography>}
                </List>
              )}
              {activityTab === 1 && (
                <List>
                  {dashboardData?.recentComments?.length > 0 ? dashboardData.recentComments.map(comment => (
                    <ListItemButton key={comment._id} component={RouterLink} to={`/post/${comment.post._id}`} divider>
                      <ListItemText primary={`"${comment.content.substring(0, 50)}..."`} secondary={`On "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                    </ListItemButton>
                  )) : <Typography color="text.secondary" sx={{ p: 2, fontFamily: theme.typography.fontFamily }}>No recent comments.</Typography>}
                </List>
              )}
              <Button component={RouterLink} to="/profile/my-activity" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>View All Activity</Button>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Security Section */}
        <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Account Security</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} mb={3} sx={{ fontFamily: theme.typography.fontFamily }}>Change Password</Typography>
              <Fade in={!!passwordFeedback.error}><Alert variant="filled" severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{passwordFeedback.error}</Alert></Fade>
              <Fade in={!!passwordFeedback.success}><Alert variant="filled" severity="success" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{passwordFeedback.success}</Alert></Fade>
              <Box component="form" onSubmit={savePassword}>
                <Stack spacing={2}>
                  <TextField type="password" label="Current Password" name="currentPassword" variant="filled" fullWidth required value={passwordForm.currentPassword} onChange={handlePasswordChange} disabled={passwordLoading} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField type="password" label="New Password" name="newPassword" variant="filled" fullWidth required value={passwordForm.newPassword} onChange={handlePasswordChange} disabled={passwordLoading} helperText="Min 6 characters." InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField type="password" label="Confirm New Password" name="confirmPassword" variant="filled" fullWidth required value={passwordForm.confirmPassword} onChange={handlePasswordChange} disabled={passwordLoading} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={passwordLoading} startIcon={passwordLoading ? <CircularProgress size={20} /> : null} sx={{ fontFamily: theme.typography.fontFamily }}>
                      {passwordLoading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Icon sx={{ color, mr: 2, fontSize: 28 }} />
                      <Typography variant="subtitle1" fontWeight="bold" flexGrow={1} sx={{ fontFamily: theme.typography.fontFamily }}>{name}</Typography>
                      {linked ? (
                        <Button variant="outlined" color="error" size="small" onClick={() => unlinkSocial(key)} sx={{ fontFamily: theme.typography.fontFamily }}>Unlink</Button>
                      ) : (
                        <Button variant="contained" size="small" onClick={() => linkSocial(key)} sx={{ fontFamily: theme.typography.fontFamily }}>Link Account</Button>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontFamily: theme.typography.fontFamily }}>Danger Zone</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper variant="outlined" sx={{ p: 3, border: 1, borderColor: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} color="error.main" sx={{ fontFamily: theme.typography.fontFamily }}>Delete Account</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, fontFamily: theme.typography.fontFamily }}>This action is permanent and cannot be undone. All your personal data will be anonymized.</Typography>
              <Button variant="contained" color="error" onClick={openDeleteDialog} startIcon={<WarningAmberIcon />} sx={{ fontFamily: theme.typography.fontFamily }}>Delete My Account</Button>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Are you absolutely sure?</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
              This action is irreversible. To confirm, please enter your password below.
            </DialogContentText>
            {deleteError && <Alert severity="error" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>{deleteError}</Alert>}
            <TextField sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
              autoFocus margin="dense" id="delete-password" label="Your Password" type="password"
              fullWidth variant="standard" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount} color="error" variant="contained"
              disabled={deleteLoading || !deletePassword} startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
              sx={{ fontFamily: theme.typography.fontFamily }}
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
    </Box>
  );
}

export default Profile;
