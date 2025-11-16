import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, Alert, Paper, Grid, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, alpha,
  Card, CardContent, CardActions, Chip, Avatar, Divider, Pagination, ToggleButtonGroup, ToggleButton,
  InputAdornment, InputBase, useTheme, FormControl, useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../config/axios';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bookmarks as BookmarksIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  CollectionsBookmark as CollectionsBookmarkIcon
} from '@mui/icons-material';
import Loader from '../custom_components/Loader';

const CollectionCard = ({ collection, onEdit, onDelete, viewMode }) => {
  const theme = useTheme();
  
  if (viewMode === 'list') {
    return (
      <Card
        component={RouterLink}
        to={`/collection/${collection._id}`}
        sx={{
          display: 'flex',
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: 3,
          transition: '0.3s',
          '&:hover': { 
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)'
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5 }}>
                {collection.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                {collection.postCount || collection.posts.length} {collection.postCount === 1 ? 'item' : 'items'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily
              }}>
                {collection.description || 'No description.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={(e) => { e.preventDefault(); onEdit(collection); }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={(e) => { e.preventDefault(); onDelete(collection); }} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card
      component={RouterLink}
      to={`/collection/${collection._id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        textDecoration: 'none',
        color: 'inherit',
        transition: '0.3s',
        '&:hover': { 
          boxShadow: theme.shadows[8],
          transform: 'translateY(-4px)'
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              flex: 1,
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {collection.name}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={(e) => { e.preventDefault(); onEdit(collection); }}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={(e) => { e.preventDefault(); onDelete(collection); }} color="error">
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
          {collection.postCount || collection.posts.length} {collection.postCount === 1 ? 'item' : 'items'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          fontFamily: theme.typography.fontFamily
        }}>
          {collection.description || 'No description.'}
        </Typography>
      </CardContent>
    </Card>
  );
};

const CollectionFormDialog = ({ open, onClose, onSave, collection }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      setFormData({ name: collection.name, description: collection.description || '' });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [collection, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    // Always set isPublic to false since we're removing this feature
    await onSave({ ...formData, isPublic: false });
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, pb: 1 }}>
        {collection ? 'Edit Collection' : 'Create New Collection'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField 
            autoFocus 
            name="name" 
            label="Collection Name" 
            value={formData.name} 
            onChange={handleChange} 
            fullWidth 
            required 
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
            sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            helperText="Enter a name for your collection"
          />
          <TextField 
            name="description" 
            label="Description (Optional)" 
            multiline 
            rows={3} 
            value={formData.description} 
            onChange={handleChange} 
            fullWidth 
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
            sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            helperText="Add a brief description of what this collection is for"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Collections are private by default and only visible to you.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.name.trim()} 
          sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
        >
          {loading ? <Loader size="small" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MyCollectionsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const collectionsPerPage = 8;

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

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = collections.filter(collection => 
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'items':
        filtered.sort((a, b) => (b.postCount || b.posts.length) - (a.postCount || a.posts.length));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [collections, searchTerm, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCollections.length / collectionsPerPage);
  const paginatedCollections = useMemo(() => {
    const startIndex = (page - 1) * collectionsPerPage;
    return filteredAndSortedCollections.slice(startIndex, startIndex + collectionsPerPage);
  }, [filteredAndSortedCollections, page]);

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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 }, display: 'flex', justifyContent: 'center' }}>
      <Loader size="large" />
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="md" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
      <Paper sx={{ p: { xs: 4, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={4}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
              My Collections
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Organize your favorite posts and recipes.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => openForm()} 
            sx={{ 
              borderRadius: '50px', 
              fontFamily: theme.typography.fontFamily, 
              px: { xs: 2, sm: 5.5 }, 
              py: { xs: 1, sm: 3.5 }, 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
            fullWidth={isMobile}
          >
            Create Collection
          </Button>
        </Stack>
      </Paper>

      {collections.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <CollectionsBookmarkIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            You haven't created any collections yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
            Collections help you organize and save your favorite posts, recipes, and content in one place.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => openForm()} 
            sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily, px: 4 }}
          >
            Create Your First Collection
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <InputBase
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                sx={{ 
                  flex: 1, 
                  px: 2, 
                  py: 1, 
                  borderRadius: '20px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  fontFamily: theme.typography.fontFamily,
                  '&:focus-within': {
                    borderColor: theme.palette.primary.main,
                  }
                }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <ToggleButtonGroup
                  value={sortOption}
                  exclusive
                  onChange={(e, newValue) => newValue && setSortOption(newValue)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="newest" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    Newest
                  </ToggleButton>
                  <ToggleButton value="name" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    Name
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
              
              <FormControl sx={{ minWidth: 120, display: { xs: 'none', sm: 'block' } }}>
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
              </FormControl>
            </Stack>
          </Paper>

          {paginatedCollections.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No collections found matching your search.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {paginatedCollections.map((collection) => ( 
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={collection._id}>
                      <CollectionCard collection={collection} onEdit={openForm} onDelete={openDeleteConfirm} viewMode={viewMode} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={2}>
                  {paginatedCollections.map((collection) => (
                    <CollectionCard key={collection._id} collection={collection} onEdit={openForm} onDelete={openDeleteConfirm} viewMode={viewMode} />
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
        </>
      )}

      <CollectionFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} collection={editingCollection} />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Are you sure you want to delete the collection "{collectionToDelete?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ fontFamily: theme.typography.fontFamily }}>
            This action cannot be undone. All items in this collection will be removed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ fontFamily: theme.typography.fontFamily }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCollectionsPage;