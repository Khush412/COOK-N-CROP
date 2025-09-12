import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
} from '@mui/material';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const BlockedUsersPage = () => {
  const { loadUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        Blocked Users
      </Typography>
      <Paper sx={{ p: 2 }}>
        {blockedUsers.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            You haven't blocked any users.
          </Typography>
        ) : (
          <List>
            {blockedUsers.map((blockedUser) => (
              <ListItem key={blockedUser._id} secondaryAction={<Button variant="outlined" onClick={() => handleUnblock(blockedUser._id)}>Unblock</Button>}>
                <ListItemAvatar><Avatar src={blockedUser.profilePic} /></ListItemAvatar>
                <ListItemText primary={blockedUser.username} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default BlockedUsersPage;