import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Stack, alpha, Snackbar,
  Button, Chip, Divider, TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Pagination,
  Card, CardContent, CardActions, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import api from '../config/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import {
  Search as SearchIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Share as ShareIcon,
  BookmarkRemove as BookmarkRemoveIcon
} from '@mui/icons-material';

const CollectionDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState([]);
  const postsPerPage = 12;

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

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (!collection) return [];
    return collection.posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [collection, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, page]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleEditCollection = async (updatedData) => {
    try {
      const { data } = await api.put(`/collections/${id}`, updatedData);
      setCollection(prev => ({ ...prev, ...data }));
      setEditMode(false);
      setSnackbar({ open: true, message: 'Collection updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update collection.', severity: 'error' });
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await api.delete(`/collections/${id}`);
      setSnackbar({ open: true, message: 'Collection deleted successfully!', severity: 'success' });
      // Redirect to collections page
      window.location.href = '/profile/collections';
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete collection.', severity: 'error' });
    }
  };

  const handleRemovePosts = async () => {
    try {
      // Get current collection post IDs
      const currentPostIds = collection.posts.map(post => post._id);
      // Remove selected posts
      const updatedPostIds = currentPostIds.filter(id => !postsToDelete.includes(id));
      
      // Update collection with remaining posts
      await api.put(`/collections/${id}`, { 
        name: collection.name,
        description: collection.description,
        isPublic: collection.isPublic,
        posts: updatedPostIds
      });
      
      // Refresh collection
      fetchCollection();
      setPostsToDelete([]);
      setSnackbar({ open: true, message: 'Posts removed from collection!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to remove posts.', severity: 'error' });
    }
  };

  const togglePostSelection = (postId) => {
    setPostsToDelete(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );
  
  if (!collection) return null;

  const isOwner = user && user._id === collection.user._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      {/* Collection Header */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
                {collection.name}
              </Typography>
              <Chip 
                icon={collection.isPublic ? <PublicIcon /> : <LockIcon />} 
                label={collection.isPublic ? 'Public' : 'Private'} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  height: 28,
                  '& .MuiChip-icon': { fontSize: '18px' }
                }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                component={RouterLink}
                to={`/user/${collection.user.username}`}
                src={collection.user.profilePic && collection.user.profilePic.startsWith('http') ? collection.user.profilePic : collection.user.profilePic ? `${process.env.REACT_APP_API_URL}${collection.user.profilePic}` : undefined}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                A collection by{' '}
                <Typography component={RouterLink} to={`/user/${collection.user.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary' }}>
                  {collection.user.username}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                • Created {format(new Date(collection.createdAt), 'MMM d, yyyy')}
              </Typography>
            </Stack>
            
            {collection.description && (
              <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, maxWidth: 800 }}>
                {collection.description}
              </Typography>
            )}
          </Box>
          
          {isOwner && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit Collection">
                <IconButton onClick={() => setEditMode(true)} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Collection">
                <IconButton onClick={() => setDeleteConfirmOpen(true)} color="error" sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Collection">
                <IconButton sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Item' : 'Items'}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search in collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: { xs: '100%', sm: 250 },
                '& .MuiOutlinedInput-root': { borderRadius: '20px' },
                '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
              }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => newValue && setViewMode(newValue)}
              size="small"
              sx={{ height: 40 }}
            >
              <ToggleButton value="grid" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Paper>

      {isOwner && postsToDelete.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, background: alpha(theme.palette.warning.light, 0.1) }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
              {postsToDelete.length} {postsToDelete.length === 1 ? 'item' : 'items'} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                onClick={() => setPostsToDelete([])}
                sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<BookmarkRemoveIcon />}
                onClick={handleRemovePosts}
                sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
              >
                Remove Selected
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {filteredPosts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            This collection is empty.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
            {isOwner 
              ? "Add posts to this collection by saving them from the community or store."
              : "There are no items in this collection yet."}
          </Typography>
          {isOwner && (
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/community"
              sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily, px: 4 }}
            >
              Explore Community
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {paginatedPosts.map((post) => ( 
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                  <PostCard
                    post={post}
                    user={user}
                    showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
                    selectable={isOwner}
                    selected={postsToDelete.includes(post._id)}
                    onSelect={() => isOwner && togglePostSelection(post._id)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={3}>
              {paginatedPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
                  selectable={isOwner}
                  selected={postsToDelete.includes(post._id)}
                  onSelect={() => isOwner && togglePostSelection(post._id)}
                  variant="list"
                />
              ))}
            </Stack>
          )}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                siblingCount={1}
                boundaryCount={1}
                sx={{ 
                  '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                  '& .Mui-selected': { fontWeight: 'bold' }
                }}
              />
            </Box>
          )}
        </>
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
      
      {/* Edit Collection Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Edit Collection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Collection Name"
              defaultValue={collection.name}
              fullWidth
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            />
            <TextField
              label="Description"
              defaultValue={collection.description || ''}
              multiline
              rows={3}
              fullWidth
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Visibility:</Typography>
              <Chip 
                icon={collection.isPublic ? <PublicIcon /> : <LockIcon />} 
                label={collection.isPublic ? 'Public' : 'Private'} 
                variant="outlined"
                sx={{ fontFamily: theme.typography.fontFamily }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={(e) => {
              const formData = new FormData(e.target.closest('form'));
              handleEditCollection({
                name: formData.get('Collection Name'),
                description: formData.get('Description'),
                isPublic: collection.isPublic
              });
            }}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Collection Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Are you sure you want to delete "{collection.name}"?
          </Typography>
          <Alert severity="warning" sx={{ fontFamily: theme.typography.fontFamily }}>
            This action cannot be undone. All items in this collection will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCollection} 
            color="error" 
            variant="contained"
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Delete Collection
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionDetailsPage;