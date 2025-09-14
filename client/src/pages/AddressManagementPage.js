import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Container,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import StarIcon from '@mui/icons-material/Star';
import addressService from '../services/addressService';
import AddressForm from '../components/AddressForm';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        position: 'relative',
        border: address.isDefault ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow .2s, border-color .2s',
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
          {address.label || 'Address'}
        </Typography>
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(address)}><EditIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(address)} color="error"><DeleteIcon /></IconButton>
          </Tooltip>
        </Box>
      </Stack>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{address.fullName}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.street}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.city}, {address.state} {address.zipCode}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{address.country}</Typography>
        {address.phone && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mt: 1 }}>Phone: {address.phone}</Typography>}
      </Box>
      {!address.isDefault && (
        <Button size="small" onClick={() => onSetDefault(address)} sx={{ mt: 'auto', alignSelf: 'flex-start', fontFamily: theme.typography.fontFamily }}>
          Set as Default
        </Button>
      )}
    </Paper>
  );
};

const AddressManagementPage = () => {
  const theme = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ py: 4, mt: 12 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Your Addresses
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Manage your saved shipping addresses.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Add New Address
          </Button>
        </Box>

        {addresses.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <HomeWorkIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              No Saved Addresses
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
              Add an address to make checkout faster.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {addresses.map((address) => (
              <Grid size={{ xs: 12, sm: 6 }} key={address._id}>
                <AddressCard
                  address={address}
                  onEdit={openForm}
                  onDelete={openDeleteConfirm}
                  onSetDefault={handleSetDefault}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
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
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this address?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAddress} color="error" autoFocus>
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
