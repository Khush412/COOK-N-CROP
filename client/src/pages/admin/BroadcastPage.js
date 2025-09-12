import React, { useState } from 'react';
import {
  Paper, Typography, Box, TextField, Button, CircularProgress, Alert,
} from '@mui/material';
import adminService from '../../services/adminService';

const BroadcastPage = () => {
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!message) {
      setError('Message cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      const response = await adminService.sendBroadcast(message, link);
      setSuccess(response.message);
      setMessage('');
      setLink('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Send Broadcast Message</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This message will be sent as a notification to all active users.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Broadcast Message"
          multiline
          rows={4}
          fullWidth
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
          helperText="The main content of your notification."
        />
        <TextField
          label="Optional Link"
          fullWidth
          value={link}
          onChange={(e) => setLink(e.target.value)}
          margin="normal"
          helperText="An optional URL to include (e.g., /recipes/some-recipe-id or https://externalsite.com)."
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 3 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </Box>
    </Paper>
  );
};

export default BroadcastPage;