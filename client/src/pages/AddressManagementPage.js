import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Container,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Stack,
  Chip,
  Tooltip,
  alpha,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  HomeWork as HomeWorkIcon,
  Star as StarIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  FilterList as FilterListIcon,
  Map as MapIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import addressService from '../services/addressService';
import AddressForm from '../components/AddressForm';
import Loader from '../custom_components/Loader';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, viewMode }) => {
  const theme = useTheme();
  
  // Get icon based on address label
  const getAddressIcon = (label) => {
    if (!label) return <LocationOnIcon />;
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <HomeWorkIcon />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <BusinessIcon />;
    if (lowerLabel.includes('shipping')) return <LocalShippingIcon />;
    return <LocationOnIcon />;
  };
  
  // Get color based on address label
  const getAddressColor = (label) => {
    if (!label) return theme.palette.grey;
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return theme.palette.primary;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return theme.palette.secondary;
    if (lowerLabel.includes('shipping')) return theme.palette.info;
    return theme.palette.grey; // fallback to grey for unknown labels
  };
  
  if (viewMode === 'list') {
    return (
      <Card
        sx={{
          display: 'flex',
          borderRadius: 3,
          border: address.isDefault ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
          transition: '0.3s',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.light,
          },
          position: 'relative',
        }}
      >
        {address.isDefault && (
          <Tooltip title="Default Address">
            <StarIcon sx={{ position: 'absolute', top: 8, left: 8, color: 'primary.main' }} />
          </Tooltip>
        )}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconButton size="small" sx={{ p: 0.5, mr: 1, color: getAddressColor(address.label).main }}>
                  {getAddressIcon(address.label)}
                </IconButton>
                <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {address.label || 'Address'}
                </Typography>
                {address.isDefault && (
                  <Chip label="Default" size="small" color="primary" sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.7rem' } }} />
                )}
              </Stack>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{address.fullName}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  {address.phone && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.phone}</Typography>}
                </Stack>
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(address)}><EditIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(address)} color="error"><DeleteIcon /></IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
        {!address.isDefault && (
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button size="small" onClick={() => onSetDefault(address)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
              Set as Default
            </Button>
          </CardActions>
        )}
      </Card>
    );
  }
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        position: 'relative',
        border: address.isDefault ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        transition: '0.3s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      {address.isDefault && (
        <Tooltip title="Default Address">
          <StarIcon sx={{ position: 'absolute', top: 8, left: 8, color: 'primary.main' }} />
        </Tooltip>
      )}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" sx={{ p: 0.5, color: getAddressColor(address.label).main }}>
              {getAddressIcon(address.label)}
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
              {address.label || 'Address'}
            </Typography>
          </Stack>
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(address)}><EditIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(address)} color="error"><DeleteIcon /></IconButton>
            </Tooltip>
          </Box>
        </Stack>
        <Box sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{address.fullName}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.street}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                {address.city}, {address.state} {address.zipCode}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.country}</Typography>
            </Stack>
            {address.phone && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Phone: {address.phone}</Typography>
              </Stack>
            )}
          </Stack>
        </Box>
        {address.label && (
          <Chip 
            icon={getAddressIcon(address.label)} 
            label={address.label} 
            size="small" 
            variant="outlined"
            sx={{ 
              height: 24, 
              fontFamily: theme.typography.fontFamily,
              fontSize: '0.75rem',
              mt: 1,
              borderColor: getAddressColor(address.label).main,
              color: getAddressColor(address.label).main
            }} 
          />
        )}
      </CardContent>
      {!address.isDefault && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button size="small" onClick={() => onSetDefault(address)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            Set as Default
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

const AddressManagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const addressesPerPage = 6;

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError('Failed to load addresses.');
      showSnackbar('Failed to load addresses.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Filter addresses
  const filteredAddresses = useMemo(() => {
    return addresses.filter(address => {
      const matchesSearch = 
        (address.label && address.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (address.fullName && address.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (address.street && address.street.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (address.city && address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (address.state && address.state.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        filterType === 'all' || 
        (filterType === 'default' && address.isDefault) ||
        (filterType === 'home' && address.label && address.label.toLowerCase().includes('home')) ||
        (filterType === 'work' && address.label && (address.label.toLowerCase().includes('work') || address.label.toLowerCase().includes('office'))) ||
        (filterType === 'other' && address.label && !address.label.toLowerCase().includes('home') && !address.label.toLowerCase().includes('work') && !address.label.toLowerCase().includes('office'));
      
      return matchesSearch && matchesFilter;
    });
  }, [addresses, searchTerm, filterType]);

  // Pagination
  const totalPages = Math.ceil(filteredAddresses.length / addressesPerPage);
  const paginatedAddresses = useMemo(() => {
    const startIndex = (page - 1) * addressesPerPage;
    return filteredAddresses.slice(startIndex, startIndex + addressesPerPage);
  }, [filteredAddresses, page]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormSubmit = async (addressData) => {
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id, addressData);
        showSnackbar('Address updated successfully!', 'success');
      } else {
        await addressService.addAddress(addressData);
        showSnackbar('Address added successfully!', 'success');
      }
      setFormOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save address.', 'error');
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await addressService.deleteAddress(addressToDelete._id);
      showSnackbar('Address deleted successfully!', 'info');
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
      fetchAddresses();
    } catch (err) {
      showSnackbar('Failed to delete address.', 'error');
    }
  };

  const handleSetDefault = async (address) => {
    try {
      await addressService.updateAddress(address._id, { ...address, isDefault: true });
      showSnackbar('Default address updated!', 'success');
      fetchAddresses();
    } catch (err) {
      showSnackbar('Failed to set default address.', 'error');
    }
  };

  const openForm = (address = null) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const openDeleteConfirm = (address) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get unique address labels for filter options
  const addressLabels = useMemo(() => {
    const labels = addresses
      .map(addr => addr.label)
      .filter(label => label)
      .map(label => label.toLowerCase());
    
    return [...new Set(labels)];
  }, [addresses]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><Loader size="large" /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ py: 4, mt: 12 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Address Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Manage your saved shipping addresses for faster checkout.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="Search addresses..."
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
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '20px' },
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ 
                  borderRadius: '20px',
                  fontFamily: theme.typography.fontFamily,
                  width: { xs: '100%', sm: 'auto' }
                }}
                IconComponent={FilterListIcon}
                displayEmpty
              >
                <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All</MenuItem>
                <MenuItem value="default" sx={{ fontFamily: theme.typography.fontFamily }}>Default</MenuItem>
                <MenuItem value="home" sx={{ fontFamily: theme.typography.fontFamily }}>Home</MenuItem>
                <MenuItem value="work" sx={{ fontFamily: theme.typography.fontFamily }}>Work</MenuItem>
                <MenuItem value="other" sx={{ fontFamily: theme.typography.fontFamily }}>Other</MenuItem>
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ 
                height: 40,
                '& .MuiToggleButton-root': { 
                  borderRadius: '50px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: theme.typography.fontFamily
                },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              borderRadius: '50px', 
              px: 3,
              py: 1,
              minWidth: { xs: '100%', sm: 180 },
              boxShadow: 3,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Add New Address
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        {addresses.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <HomeWorkIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, mb: 2, color: theme.palette.primary.main }}>
              No Saved Addresses
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
              Add an address to make checkout faster and more convenient.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openForm()}
              sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 4, py: 1.5 }}
            >
              Add Your First Address
            </Button>
          </Box>
        ) : paginatedAddresses.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              No addresses found matching your search or filter criteria.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              sx={{ 
                mt: 2, 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: '50px' 
              }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                fontFamily: theme.typography.fontFamily,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <MapIcon /> Your Saved Addresses
            </Typography>
            
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {paginatedAddresses.map((address) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={address._id}>
                    <AddressCard
                      address={address}
                      onEdit={openForm}
                      onDelete={openDeleteConfirm}
                      onSetDefault={handleSetDefault}
                      viewMode={viewMode}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={2}>
                {paginatedAddresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onEdit={openForm}
                    onDelete={openDeleteConfirm}
                    onSetDefault={handleSetDefault}
                    viewMode={viewMode}
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
      </Paper>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700 }}>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <AddressForm
            address={editingAddress}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700 }}>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to delete this address? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
          <Button onClick={handleDeleteAddress} color="error" autoFocus sx={{ fontFamily: theme.typography.fontFamily }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddressManagementPage;