import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, TextField, Button, CircularProgress,
  Snackbar, Alert, alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import groupService from '../services/groupService';
import CreateGroupForm from '../components/CreateGroupForm';

const CreateGroupPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const newGroup = await groupService.createGroup(formData);
      setSnackbar({ open: true, message: 'Group created successfully!', severity: 'success' });
      setTimeout(() => navigate(`/g/${newGroup.slug}`), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create group.', severity: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Create a New Group
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Start a community around your favorite food topic.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <CreateGroupForm
          onSubmit={handleCreateSubmit}
          onCancel={() => navigate('/community')}
          loading={isSubmitting}
        />
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateGroupPage;