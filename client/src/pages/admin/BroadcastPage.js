import React, { useState } from 'react';
import {
  Paper, Typography, Box, TextField, Button, Alert, Container, Stack,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CampaignIcon from '@mui/icons-material/Campaign';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const BroadcastPage = () => {
  const theme = useTheme();
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
    <Container maxWidth="md">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Broadcast Message
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Send a notification to all active users.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              label="Broadcast Message"
              multiline
              rows={4}
              fullWidth
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText="The main content of your notification. HTML tags like <strong> are supported."
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Optional Link"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              helperText="An optional URL to include (e.g., /recipes/some-recipe-id or https://externalsite.com)."
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {error && <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ fontFamily: theme.typography.fontFamily }}>{success}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <Loader size="small" color="inherit" /> : <CampaignIcon />}
              sx={{ mt: 2, fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px', px: 4, alignSelf: 'flex-start' }}
            >
              {loading ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default BroadcastPage;