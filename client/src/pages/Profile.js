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
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Avatar src={imagePreview} sx={{ width: 120, height: 120, mb: 2 }} />
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Change Picture</Button>
          <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Box>
        <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" helperText="3-30 chars; letters, numbers, underscores only" />
        <TextField label="Bio" name="bio" value={form.bio} onChange={handleChange} fullWidth multiline rows={4} margin="normal" helperText={`${form.bio.length}/500 characters`} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}>Save</Button>
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
    await api.put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
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
      sx={{
        px: { xs: 2, md: 5 },
        maxWidth: 760,
        mx: "auto",
        mt: 12,
        fontFamily: theme.typography.fontFamily,
        minHeight: "80vh",
        color: theme.palette.text.primary,
        position: "relative",
        "&::before, &::after": {
          content: '""',
          position: "fixed",
          top: (theme.mixins.toolbar?.minHeight || 64) + 10,
          bottom: 0,
          width: 3,
          bgcolor: theme.palette.primary.main,
          opacity: 0.14,
          borderRadius: 2,
          zIndex: -1,
        },
        "&::before": { left: { xs: 10, md: "4vw" } },
        "&::after": { right: { xs: 10, md: "4vw" } },
      }}
    >
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

      <Fade in={!!feedback.error}>
        <Alert variant="filled" severity="error" sx={{ mb: 2 }}>
          {feedback.error}
        </Alert>
      </Fade>
      <Fade in={!!feedback.success}>
        <Alert variant="filled" severity="success" sx={{ mb: 2 }} onClose={() => setFeedback({ ...feedback, success: '' })}>
          {feedback.success}
        </Alert>
      </Fade>

      <Grid container spacing={4}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar src={user?.profilePic} sx={{ width: 100, height: 100 }} />
            <Box flexGrow={1}>
              <Typography variant="h4" fontWeight="bold">{user?.username}</Typography>
              <Typography variant="body1" color="text.secondary">{user?.bio || 'No bio provided.'}</Typography>
            </Box>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
          </Paper>
        </Grid>

        {/* Recent Orders Card */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Recent Orders</Typography>
            {dashboardData?.recentOrders?.length > 0 ? (
              <List>
                {dashboardData.recentOrders.map(order => (
                  <ListItem key={order._id} secondaryAction={<Button component={RouterLink} to={`/order/${order._id}`} size="small">View</Button>} divider>
                    <ListItemText
                      primary={`Order #${order._id.slice(-6)} - $${order.totalPrice.toFixed(2)}`}
                      secondary={format(new Date(order.createdAt), 'PP')}
                    />
                    <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
                  </ListItem>
                ))}
              </List>
            ) : <Typography color="text.secondary">No recent orders.</Typography>}
            <Button component={RouterLink} to="/profile/orders" sx={{ mt: 2 }}>View All Orders</Button>
          </Paper>
        </Grid>

        {/* Recent Activity Card */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Recent Activity</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activityTab} onChange={(e, newValue) => setActivityTab(newValue)} aria-label="activity tabs">
                <Tab label="Posts" />
                <Tab label="Comments" />
              </Tabs>
            </Box>
            {activityTab === 0 && (
              <List>
                {dashboardData?.recentPosts?.length > 0 ? dashboardData.recentPosts.map(post => (
                  <ListItemButton key={post._id} component={RouterLink} to={`/post/${post._id}`} divider>
                    <ListItemText primary={post.title} secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`} />
                  </ListItemButton>
                )) : <Typography color="text.secondary" sx={{ p: 2 }}>No recent posts.</Typography>}
              </List>
            )}
            {activityTab === 1 && (
              <List>
                {dashboardData?.recentComments?.length > 0 ? dashboardData.recentComments.map(comment => (
                  <ListItemButton key={comment._id} component={RouterLink} to={`/post/${comment.post._id}`} divider>
                    <ListItemText primary={`"${comment.content.substring(0, 50)}..."`} secondary={`On "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`} />
                  </ListItemButton>
                )) : <Typography color="text.secondary" sx={{ p: 2 }}>No recent comments.</Typography>}
              </List>
            )}
            <Button component={RouterLink} to="/profile/my-activity" sx={{ mt: 2 }}>View All Activity</Button>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Security Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">Account Security</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={3}>Change Password</Typography>
            <Fade in={!!passwordFeedback.error}><Alert variant="filled" severity="error" sx={{ mb: 2 }}>{passwordFeedback.error}</Alert></Fade>
            <Fade in={!!passwordFeedback.success}><Alert variant="filled" severity="success" sx={{ mb: 2 }}>{passwordFeedback.success}</Alert></Fade>
            <Box component="form" onSubmit={savePassword}>
              <Stack spacing={2}>
                <TextField type="password" label="Current Password" name="currentPassword" variant="filled" fullWidth required value={passwordForm.currentPassword} onChange={handlePasswordChange} disabled={passwordLoading} />
                <TextField type="password" label="New Password" name="newPassword" variant="filled" fullWidth required value={passwordForm.newPassword} onChange={handlePasswordChange} disabled={passwordLoading} helperText="Min 6 characters." />
                <TextField type="password" label="Confirm New Password" name="confirmPassword" variant="filled" fullWidth required value={passwordForm.confirmPassword} onChange={handlePasswordChange} disabled={passwordLoading} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={passwordLoading} startIcon={passwordLoading ? <CircularProgress size={20} /> : null}>
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">Linked Accounts</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Link your social accounts for easy login. Unlinking an account may prevent you from logging in if you don't have a password set.
            </Typography>
            <Stack spacing={2}>
              {SOCIALS.map(({ name, key, icon: Icon, color }) => {
                const linked = !!user?.[key]?.id;
                return (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Icon sx={{ color, mr: 2, fontSize: 28 }} />
                    <Typography variant="subtitle1" fontWeight="bold" flexGrow={1}>
                      {name}
                    </Typography>
                    {linked ? (
                      <Button variant="outlined" color="error" size="small" onClick={() => unlinkSocial(key)}>
                        Unlink
                      </Button>
                    ) : (
                      <Button variant="contained" size="small" onClick={() => linkSocial(key)}>
                        Link Account
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold" color="error.main">Danger Zone</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper variant="outlined" sx={{ p: 3, border: 1, borderColor: 'error.main' }}>
            <Typography variant="h5" fontWeight={700} color="error.main">Delete Account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>This action is permanent and cannot be undone. All your personal data will be anonymized.</Typography>
            <Button variant="contained" color="error" onClick={openDeleteDialog} startIcon={<WarningAmberIcon />}>Delete My Account</Button>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Are you absolutely sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is irreversible. To confirm, please enter your password below.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
          <TextField
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading || !deletePassword}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
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
    </Box>
  );
}

export default Profile;
