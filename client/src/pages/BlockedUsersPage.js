import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Avatar,
  Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import BlockIcon from '@mui/icons-material/Block';

const BlockedUsersPage = () => {
  const { loadUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const fetchBlockedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getBlockedUsers();
      setBlockedUsers(res.data);
    } catch (err) {
      setError('Failed to load blocked users list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (userId) => {
    try {
      await userService.blockUser(userId); // The same endpoint toggles the block status
      await loadUser(); // Refresh the main user context
      fetchBlockedUsers(); // Re-fetch the list for this page
    } catch (err) {
      alert('Failed to unblock user.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: 12 }}>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Blocked Users
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Manage users you've blocked from interacting with you.
        </Typography>
      </Paper>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        {blockedUsers.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <BlockIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              You haven't blocked any users.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
              When you block someone, they won't be able to follow or message you.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {blockedUsers.map((blockedUser) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={blockedUser._id}>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                  <Avatar src={blockedUser.profilePic} sx={{ width: 56, height: 56 }} />
                  <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{blockedUser.username}</Typography>
                  <Button variant="outlined" onClick={() => handleUnblock(blockedUser._id)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Unblock</Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default BlockedUsersPage;