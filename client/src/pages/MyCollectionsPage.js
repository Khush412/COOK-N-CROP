import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, CircularProgress, Alert, Paper, Grid, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Switch, FormControlLabel, alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import api from '../config/axios';

const CollectionCard = ({ collection, onEdit, onDelete }) => {
  const theme = useTheme();
  return (
    <Paper
      component={RouterLink}
      to={`/collection/${collection._id}`}
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': { boxShadow: theme.shadows[4], borderColor: 'primary.light' },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
          {collection.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
          {collection.postCount || collection.posts.length} {collection.postCount === 1 ? 'item' : 'items'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          fontFamily: theme.typography.fontFamily
        }}>
          {collection.description || 'No description.'}
        </Typography>
      </Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={(e) => { e.preventDefault(); onEdit(collection); }}><EditIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={(e) => { e.preventDefault(); onDelete(collection); }} color="error"><DeleteIcon /></IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

const CollectionFormDialog = ({ open, onClose, onSave, collection }) => {
  const [formData, setFormData] = useState({ name: '', description: '', isPublic: true });
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      setFormData({ name: collection.name, description: collection.description || '', isPublic: collection.isPublic });
    } else {
      setFormData({ name: '', description: '', isPublic: true });
    }
  }, [collection, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>{collection ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField autoFocus name="name" label="Collection Name" value={formData.name} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
          <TextField name="description" label="Description (Optional)" multiline rows={3} value={formData.description} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
          <FormControlLabel
            control={<Switch checked={formData.isPublic} onChange={handleChange} name="isPublic" />}
            label={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>Public (visible to others)</Typography>}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !formData.name} sx={{ fontFamily: theme.typography.fontFamily }}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MyCollectionsPage = () => {
  const theme = useTheme();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/collections/me');
      setCollections(data);
    } catch (err) {
      setError('Failed to load collections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSave = async (formData) => {
    try {
      if (editingCollection) {
        await api.put(`/collections/${editingCollection._id}`, formData);
      } else {
        await api.post('/collections', formData);
      }
      setFormOpen(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (err) {
      alert('Failed to save collection.');
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await api.delete(`/collections/${collectionToDelete._id}`);
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
      fetchCollections();
    } catch (err) {
      alert('Failed to delete collection.');
    }
  };

  const openForm = (collection = null) => {
    setEditingCollection(collection);
    setFormOpen(true);
  };

  const openDeleteConfirm = (collection) => {
    setCollectionToDelete(collection);
    setDeleteConfirmOpen(true);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>My Collections</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Organize your favorite posts and recipes.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>Create Collection</Button>
        </Stack>
      </Paper>

      {collections.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <BookmarksIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>You haven't created any collections yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {collections.map((collection) => ( 
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={collection._id}>
              <CollectionCard collection={collection} onEdit={openForm} onDelete={openDeleteConfirm} />
            </Grid>
          ))}
        </Grid>
      )}

      <CollectionFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} collection={editingCollection} />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Are you sure you want to delete the collection "{collectionToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" sx={{ fontFamily: theme.typography.fontFamily }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCollectionsPage;
