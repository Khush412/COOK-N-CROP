import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import groupService from '../services/groupService';
import Loader from '../custom_components/Loader';

const GroupJoinRequests = ({ groupId }) => {
  const theme = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await groupService.getJoinRequests(groupId);
        setRequests(data);
      } catch (err) {
        setError('Failed to load join requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [groupId]);

  const handleRequest = async (userId, action) => {
    try {
      setProcessing(prev => [...prev, userId]);
      await groupService.handleJoinRequest(groupId, userId, action);
      setRequests(prev => prev.filter(req => req._id !== userId));
    } catch (err) {
      setError(`Failed to ${action} request`);
    } finally {
      setProcessing(prev => prev.filter(id => id !== userId));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Loader size="medium" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Pending Join Requests ({requests.length})
      </Typography>
      
      {requests.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No pending join requests
        </Typography>
      ) : (
        <List>
          {requests.map(user => (
            <ListItem 
              key={user._id} 
              sx={{ 
                borderRadius: 2, 
                mb: 1, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                '&:last-child': { mb: 0 }
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  src={user.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : `${process.env.REACT_APP_API_URL}${user.profilePic}`) : '/images/default-profile.png'} 
                  alt={user.username}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={user.username} 
                primaryTypographyProps={{ fontWeight: 600 }}
              />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleRequest(user._id, 'approve')}
                  disabled={processing.includes(user._id)}
                  sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
                >
                  {processing.includes(user._id) ? <Loader size="small" /> : 'Approve'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleRequest(user._id, 'deny')}
                  disabled={processing.includes(user._id)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  {processing.includes(user._id) ? <Loader size="small" /> : 'Deny'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default GroupJoinRequests;