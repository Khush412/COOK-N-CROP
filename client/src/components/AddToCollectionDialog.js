import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert,
  List, ListItem, ListItemText, Checkbox, TextField, Stack, Typography, Divider, Box
} from '@mui/material';
import api from '../config/axios';

const AddToCollectionDialog = ({ open, onClose, post, showSnackbar }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const fetchCollections = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const { data } = await api.get('/collections/me');
      setCollections(data);
      // Pre-select collections that already contain this post
      const preSelected = data
        .filter(c => c.posts.includes(post._id))
        .map(c => c._id);
      setSelectedCollections(preSelected);
    } catch (err) {
      setError('Failed to load your collections.');
    } finally {
      setLoading(false);
    }
  }, [open, post?._id]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleToggle = (collectionId) => {
    const currentIndex = selectedCollections.indexOf(collectionId);
    const newChecked = [...selectedCollections];

    if (currentIndex === -1) {
      newChecked.push(collectionId);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedCollections(newChecked);
  };

  const handleCreateAndAdd = async () => {
    if (!newCollectionName.trim()) return;
    setSaving(true);
    try {
      const { data: newCollection } = await api.post('/collections', { name: newCollectionName });
      setCollections(prev => [newCollection, ...prev]);
      setSelectedCollections(prev => [...prev, newCollection._id]);
      setNewCollectionName('');
      setShowNewCollection(false);
    } catch (err) {
      showSnackbar('Failed to create new collection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/collections/posts/${post._id}`, { collectionIds: selectedCollections });
      showSnackbar('Collections updated successfully!', 'success');
      onClose();
    } catch (err) {
      showSnackbar('Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add "{post?.title}" to...</DialogTitle>
      <DialogContent dividers>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <List dense>
            {collections.map(collection => (
              <ListItem key={collection._id} secondaryAction={
                <Checkbox
                  edge="end"
                  onChange={() => handleToggle(collection._id)}
                  checked={selectedCollections.includes(collection._id)}
                />
              } disablePadding>
                <ListItemText primary={collection.name} secondary={`${collection.postCount} items`} />
              </ListItem>
            ))}
          </List>
        )}
        <Divider sx={{ my: 2 }} />
        {showNewCollection ? (
          <Stack direction="row" spacing={1}>
            <TextField
              autoFocus
              size="small"
              label="New Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              fullWidth
            />
            <Button onClick={handleCreateAndAdd} disabled={saving || !newCollectionName.trim()}>
              {saving ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          </Stack>
        ) : (
          <Button onClick={() => setShowNewCollection(true)} fullWidth>
            Create New Collection
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCollectionDialog;
