import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Stack, alpha, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import api from '../config/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const CollectionDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/collections/${id}`);
      setCollection(data);
    } catch (err) {
      setError('Failed to load collection. It may be private or has been deleted.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md" sx={{ mt: 12, py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!collection) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          {collection.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            component={RouterLink}
            to={`/user/${collection.user.username}`}
            src={collection.user.profilePic && collection.user.profilePic.startsWith('http') ? collection.user.profilePic : collection.user.profilePic ? `${process.env.REACT_APP_API_URL}${collection.user.profilePic}` : undefined}
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            A collection by{' '}
            <Typography component={RouterLink} to={`/user/${collection.user.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary' }}>
              {collection.user.username}
            </Typography>
          </Typography>
        </Stack>
        {collection.description && (
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            {collection.description}
          </Typography>
        )}
      </Paper>

      {collection.posts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">This collection is empty.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {collection.posts.map((post) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
              <PostCard
                post={post}
                user={user}
                showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
              />
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CollectionDetailsPage;
