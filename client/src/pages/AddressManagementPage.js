import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import addressService from '../services/addressService';
import AddressForm from '../components/AddressForm';

const AddressManagementPage = () => {
  const theme = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const showSnackbar = useCallback((message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
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
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAddAddress = async (newAddressData) => {
    try {
      await addressService.addAddress(newAddressData);
      showSnackbar('Address added successfully!', 'success');
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      showSnackbar('Failed to add address.', 'error');
    }
  };

  const handleUpdateAddress = async (updatedAddressData) => {
    try {
      await addressService.updateAddress(editingAddress._id, updatedAddressData);
      showSnackbar('Address updated successfully!', 'success');
      setShowAddressForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      showSnackbar('Failed to update address.', 'error');
    }
  };

  const handleDeleteAddress = async () => {
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

  const openEditForm = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const openDeleteConfirm = (address) => {
    setAddressToDelete(address);
    setDeleteConfirmOpen(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, minHeight: '70vh' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily }}>
          Manage Your Addresses
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {!showAddressForm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddressForm(true)}
                sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}
              >
                Add New Address
              </Button>
            )}

            {showAddressForm && (
              <AddressForm
                address={editingAddress}
                onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
                onCancel={closeAddressForm}
              />
            )}

            {!showAddressForm && addresses.length === 0 && (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4, fontFamily: theme.typography.fontFamily }}>
                You have no saved addresses. Click "Add New Address" to get started.
              </Typography>
            )}

            {!showAddressForm && addresses.length > 0 && (
              <List>
                {addresses.map((address) => (
                  <React.Fragment key={address._id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="edit" onClick={() => openEditForm(address)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => openDeleteConfirm(address)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>
                            {address.label || 'Address'} {address.isDefault && '(Default)'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{address.street}</Typography>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{address.city}, {address.state} {address.zipCode}</Typography>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{address.country}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddressManagementPage;
