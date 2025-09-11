import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import userService from "../services/userService"; // New
import api from "../config/axios"; // Use your axios config path
import { useAuth } from "../contexts/AuthContext";

const SOCIALS = [
  { name: "Google", key: "google", icon: GoogleIcon, color: "#DB4437" },
  { name: "GitHub", key: "github", icon: GitHubIcon, color: "#24292f" },
  { name: "Twitter", key: "twitter", icon: TwitterIcon, color: "#1DA1F2" },
];

export default function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    profilePic: "",
    newPic: null,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
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
  const fileInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function fetchProfile() {
      setLoading(true);
      setFeedback({ error: "", success: "" });
      try {
        const res = await api.get("/users/me");
        if (!ignore) {
          setUser(res.data.data);
          setForm({
            username: res.data.data.username || "",
            email: res.data.data.email || "",
            bio: res.data.data.bio || "",
            profilePic: res.data.data.profilePic || "",
            newPic: null,
          });
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({ error: error.response?.data?.message || "Failed to load profile.", success: "" });
        }
      }
      setLoading(false);
    }
    fetchProfile();
    return () => {
      ignore = true;
    };
  }, []);

  // HANDLERS

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username" && !/^[a-zA-Z0-9_]*$/.test(value)) return;
    if (name === "bio" && value.length > 500) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (form.newPic) URL.revokeObjectURL(form.profilePic);
      setForm((prev) => ({
        ...prev,
        newPic: file,
        profilePic: URL.createObjectURL(file),
      }));
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const cancelEdit = () => {
    if (form.newPic) URL.revokeObjectURL(form.profilePic);
    setEditing(false);
    setFeedback({ error: "", success: "" });
    setForm({
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profilePic: user?.profilePic || "",
      newPic: null,
    });
  };

  const saveProfile = async () => {
    if (form.username.trim().length < 3) {
      setFeedback({ error: "Username must be at least 3 characters.", success: "" });
      return;
    }
    setLoading(true);
    setFeedback({ error: "", success: "" });
    try {
      const data = new FormData();
      data.append("username", form.username.trim());
      data.append("bio", form.bio.trim());
      if (form.newPic) data.append("profilePic", form.newPic);
      const res = await api.put("/users/me", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.data);
      setEditing(false);
      setForm((prev) => ({ ...prev, newPic: null }));
      setFeedback({ error: "", success: "Profile updated successfully." });
    } catch (error) {
      setFeedback({ error: error.response?.data?.message || "Failed to update profile.", success: "" });
    }
    setLoading(false);
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
      // Optional: Log out user after password change for security
      // setTimeout(() => navigate('/login'), 2000);
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

  const unlinkSocial = async (key) => {
    if (!window.confirm(`Are you sure you want to unlink ${key}?`)) return;
    try {
      await api.delete(`/users/me/social/unlink/${key}`);
      setUser((prev) => ({ ...prev, [key]: null }));
      setFeedback({ error: "", success: `${capitalize(key)} unlinked successfully.` });
    } catch {
      setFeedback({ error: `Failed to unlink ${key}.`, success: "" });
    }
  };

  const linkSocial = (key) => {
    alert(`Linking ${capitalize(key)} is not implemented yet.`);
  };

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  if (loading && !user)
    return (
      <Box sx={{ mt: 20, textAlign: "center" }}>
        <CircularProgress size={48} />
      </Box>
    );

  return (
    <Box
      sx={{
        px: { xs: 2, md: 5 },
        maxWidth: 760,
        mx: "auto",
        mt: 8, // REDUCED top margin
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
        gutterBottom
        sx={{
          mb : 0,
          letterSpacing: 1.2,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        PROFILE INFORMATION
      </Typography>

      <Fade in={!!feedback.error}>
        <Alert variant="filled" severity="error" sx={{ mb: 3 }}>
          {feedback.error}
        </Alert>
      </Fade>
      <Fade in={!!feedback.success}>
        <Alert variant="filled" severity="success" sx={{ mb: 2 }}>
          {feedback.success}
        </Alert>
      </Fade>

      {/* Profile Box */}
      <Box
        sx={{
          mt : 0,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? 2 : 5,
        }}
      >
        <Box sx={{ position: "relative", mt: isMobile ? 1 : 0 }}>
          <Avatar
            src={form.profilePic}
            alt={form.username}
            sx={{
              mb :0,
              width: 128,
              height: 128,
              fontSize: 55,
              boxShadow: theme.shadows[6],
              border: `4px solid ${theme.palette.background.paper}`,
              cursor: editing ? "pointer" : "default",
              background: theme.palette.grey[100],
              color: theme.palette.text.primary,
              transition: "box-shadow 0.3s ease",
              "&:hover": editing ? { boxShadow: theme.shadows[12] } : undefined,
            }}
            onClick={editing ? openFileDialog : undefined}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {editing && (
            <Tooltip title="Change Profile Picture">
              <IconButton
                onClick={openFileDialog}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  bgcolor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.divider}`,
                  boxShadow: 3,
                  "&:hover": { bgcolor: theme.palette.grey[100] },
                }}
                aria-label="Change Profile Picture"
              >
                <CameraAltIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Form */}
        <Stack sx={{ flexGrow: 1, width: "100%" }} spacing={2}>
          <TextField
            label="Username"
            name="username"
            variant="filled"
            fullWidth
            disabled={!editing}
            value={form.username}
            onChange={handleChange}
            inputProps={{
              maxLength: 30,
              style: { fontFamily: theme.typography.fontFamily, fontWeight: 600 },
            }}
            helperText="3-30 chars; letters, numbers, underscores only"
            error={editing && form.username.trim().length < 3}
          />
          <TextField
            label="Email"
            name="email"
            variant="filled"
            fullWidth
            disabled
            value={form.email}
            inputProps={{
              readOnly: true,
              style: { fontFamily: theme.typography.fontFamily, color: theme.palette.grey[700] },
            }}
          />
          <TextField
            label="Bio"
            name="bio"
            variant="filled"
            multiline
            rows={4}
            fullWidth
            disabled={!editing}
            value={form.bio}
            onChange={handleChange}
            inputProps={{
              maxLength: 500,
              style: { fontFamily: theme.typography.fontFamily, fontSize: 16 },
            }}
            helperText={`${form.bio.length}/500 characters`}
          />
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" mb={4} sx={{ mt: isMobile ? 2 : 2 }}>
        {!editing ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            sx={{
              fontWeight: 700,
              fontFamily: theme.typography.fontFamily,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CancelIcon />}
              onClick={cancelEdit}
              disabled={loading}
              sx={{
                fontWeight: 600,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={saveProfile}
              disabled={loading}
              sx={{
                fontWeight: 700,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Save Changes
            </Button>
          </>
        )}
      </Stack>

      <Divider sx={{ mb: 2, mt: 2 }} />

      <Typography
        variant={isMobile ? "h6" : "h5"}
        fontWeight={700}
        mb={2}
        sx={{ textAlign: isMobile ? "center" : "left", mt: 0 }}
      >
        Linked Social Accounts
      </Typography>

      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems="flex-start"
        justifyContent="center"
        width="100%"
        sx={{ mb: 9 }}
      >
        {SOCIALS.map(({ name, key, icon: Icon, color }) => {
          const linked = !!user?.[key]?.id;
          return (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                width: isMobile ? "100%" : 265,
                gap: 2,
                pl: 2,
                pr: 2,
                py: 1.5,
                my: isMobile ? 1 : 0,
                boxShadow: theme.shadows[1],
                border: `2px solid ${linked ? color : theme.palette.divider}`,
                borderRadius: 3,
                justifyContent: "center",
                background: linked ? color + "10" : theme.palette.background.paper,
                transition: "box-shadow 0.18s",
              }}
            >
              <Icon sx={{ color, fontSize: 33 }} />
              <Typography
                variant="subtitle1"
                fontWeight={700}
                flexGrow={1}
                fontFamily={theme.typography.fontFamily}
                sx={{
                  minWidth: 68,
                  letterSpacing: 0.5,
                  color: theme.palette.text.primary,
                  textAlign: "left"
                }}
              >
                {name.toUpperCase()}
              </Typography>
              {linked ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => unlinkSocial(key)}
                  sx={{
                    fontWeight: 700,
                    minWidth: 74,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Unlink
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    minWidth: 74,
                    fontFamily: theme.typography.fontFamily,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                  }}
                  onClick={() => linkSocial(key)}
                >
                  Link
                </Button>
              )}
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Security Section */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Security
        </Typography>

        <Fade in={!!passwordFeedback.error}>
          <Alert variant="filled" severity="error" sx={{ mb: 2 }}>
            {passwordFeedback.error}
          </Alert>
        </Fade>
        <Fade in={!!passwordFeedback.success}>
          <Alert variant="filled" severity="success" sx={{ mb: 2 }}>
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
              helperText="Min 6 characters, with at least one uppercase, one lowercase, and one number."
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
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
                startIcon={passwordLoading ? <CircularProgress size={20} /> : null}
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Delete Account Section */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, border: 1, borderColor: 'error.main' }}>
        <Typography variant="h5" fontWeight={700} color="error.main">
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Deleting your account is a permanent action and cannot be undone. All your personal data will be anonymized, but your posts and comments will remain.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={openDeleteDialog}
          startIcon={<WarningAmberIcon />}
        >
          Delete My Account
        </Button>
      </Paper>

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
    </Box>
  );
}
