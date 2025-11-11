import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, TextField, Button, CircularProgress,
  Snackbar, Alert, alpha, Stack, Card, CardContent, CardMedia
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupAdd as GroupAddIcon, Info as InfoIcon } from '@mui/icons-material';
import groupService from '../services/groupService';
import CreateGroupForm from '../components/CreateGroupForm';
import Loader from '../custom_components/Loader';

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
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <GroupAddIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              Create a New Group
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Start a community around your favorite food topic.
            </Typography>
          </Box>
        </Stack>
        
        {/* Tips Card */}
        <Card sx={{ mt: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <InfoIcon sx={{ color: theme.palette.info.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, color: theme.palette.info.main }}>
                Tips for Creating a Successful Group
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
              • Choose a clear, descriptive name that reflects your group's purpose<br />
              • Write a detailed description to help users understand what your group is about<br />
              • Set up clear rules to maintain a positive community environment<br />
              • Consider making your group private if it's for a specific audience<br />
              • Add flairs to help organize posts within your group
            </Typography>
          </CardContent>
        </Card>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <CreateGroupForm
          onSubmit={handleCreateSubmit}
          onCancel={() => navigate('/community/explore')}
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