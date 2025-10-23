import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Chip, Divider, Stack, Avatar, useTheme, alpha, Button, TextField } from '@mui/material';
import { format } from 'date-fns';
import supportService from '../services/supportService';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

const SupportTicketDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await supportService.getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      setError('Failed to load ticket details. You may not have permission to view this.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      await supportService.addUserReply(id, replyContent);
      setReplyContent('');
      fetchTicket(); // Refetch to get the new reply and potentially updated status
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setIsReplying(false);
    }
  };
  
  const statusColors = { Open: 'warning', 'In Progress': 'info', Closed: 'success' };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md" sx={{ mt: 12, py: 4 }}><Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert></Container>;
  if (!ticket) return <Container maxWidth="md" sx={{ mt: 12, py: 4 }}><Alert severity="info" sx={{ fontFamily: theme.typography.fontFamily }}>Ticket not found.</Alert></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Button component={RouterLink} to="/profile/support-tickets" startIcon={<ArrowBackIcon />} sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
        Back to My Tickets
      </Button>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              {ticket.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Ticket #{ticket._id.slice(-6)} • Created on {format(new Date(ticket.createdAt), 'PPp')}
            </Typography>
          </Box>
          <Chip label={ticket.status} color={statusColors[ticket.status]} sx={{ fontFamily: theme.typography.fontFamily }} />
        </Stack>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          {/* Original Message */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Avatar src={
                (ticket.user?.profilePic || user?.profilePic) && (ticket.user?.profilePic || user?.profilePic).startsWith('http')
                  ? (ticket.user?.profilePic || user?.profilePic)
                  : (ticket.user?.profilePic || user?.profilePic) ? `${process.env.REACT_APP_API_URL}${ticket.user?.profilePic || user.profilePic}` : undefined
              }>{ticket.user?.username?.charAt(0) || user?.username.charAt(0)}</Avatar>
              <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{ticket.user?.username || user?.username} (You)</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(ticket.createdAt), 'PPp')}</Typography>
            </Stack>
            <Paper variant="outlined" sx={{ p: 2, ml: { xs: 0, sm: 7 }, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: theme.typography.fontFamily }}>{ticket.message}</Typography>
            </Paper>
          </Box>

          {/* Replies */}
          {ticket.replies.map(reply => (
            <Box key={reply._id}>
              {reply.user._id === user.id ? (
                // User's own reply
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Avatar src={reply.user.profilePic && reply.user.profilePic.startsWith('http') ? reply.user.profilePic : reply.user.profilePic ? `${process.env.REACT_APP_API_URL}${reply.user.profilePic}` : undefined}>{reply.user.username.charAt(0)}</Avatar>
                    <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{reply.user.username} (You)</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(reply.createdAt), 'PPp')}</Typography>
                  </Stack>
                  <Paper variant="outlined" sx={{ p: 2, ml: { xs: 0, sm: 7 }, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: theme.typography.fontFamily }}>{reply.content}</Typography>
                  </Paper>
                </Box>
              ) : (
                // Admin's reply
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Avatar src={reply.user.profilePic && reply.user.profilePic.startsWith('http') ? reply.user.profilePic : reply.user.profilePic ? `${process.env.REACT_APP_API_URL}${reply.user.profilePic}` : undefined}>{reply.user.username.charAt(0)}</Avatar>
                    <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{reply.user.username} (Support Team)</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(reply.createdAt), 'PPp')}</Typography>
                  </Stack>
                  <Paper variant="outlined" sx={{ p: 2, ml: { xs: 0, sm: 7 }, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: theme.typography.fontFamily }}>{reply.content}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        {ticket.status !== 'Closed' && (
          <Box component="form" onSubmit={handleReplySubmit} sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Add a Reply</Typography> 
            <TextField fullWidth multiline rows={4} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Type your reply here..." disabled={isReplying} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
            <Button type="submit" variant="contained" sx={{ mt: 2, fontFamily: theme.typography.fontFamily, borderRadius: '50px' }} disabled={isReplying || !replyContent.trim()} startIcon={isReplying ? <CircularProgress size={20} /> : <SendIcon />}>
              {isReplying ? 'Sending...' : 'Send Reply'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SupportTicketDetailsPage;