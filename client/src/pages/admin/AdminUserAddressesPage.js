import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography, Alert, Box, Paper, Grid, IconButton, Tooltip, Button, Container, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const AddressCard = ({ address, onDelete }) => {
  const theme = useTheme();
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, transition: 'box-shadow .2s', '&:hover': { boxShadow: theme.shadows[3] } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{address.label || 'Address'}</Typography>
        {address.isDefault && <Chip label="Default" color="primary" size="small" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />}
      </Stack>
      <Box sx={{ flexGrow: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}>{address.fullName}</Typography>
        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}>{address.street}</Typography>
        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}>{address.city}, {address.state} {address.zipCode}</Typography>
        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}>{address.country}</Typography>
        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}>Phone: {address.phone}</Typography>
      </Box>
      <Box sx={{ mt: 'auto', textAlign: 'right' }}>
        <Tooltip title="Delete Address">
          <IconButton onClick={() => onDelete(address._id)} color="error" size="small">
            <DeleteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

const AdminUserAddressesPage = () => {
  const { userId } = useParams();
  const theme = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUserAddresses(userId);
      setAddresses(res.data.addresses);
      setUsername(res.data.username);
    } catch (err) {
      setError(`Failed to fetch addresses for user ${userId}.`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openDeleteConfirm = (addressId) => {
    setAddressToDelete(addressId);
    setConfirmDialogOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await adminService.deleteUserAddress(userId, addressToDelete);
      fetchAddresses(); // Refresh list
    } catch (err) {
      alert('Failed to delete address.');
    } finally {
      setConfirmDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Loader size="large" /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Button component={RouterLink} to="/admin/users" startIcon={<ArrowBackIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} sx={{ mb: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Back to Manage Users
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
          Addresses for <Typography component="span" variant="h4" color="primary" sx={{ fontWeight: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>{username}</Typography>
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        {addresses.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <LocationOffIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 1 }}>
              No Saved Addresses
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              This user has not saved any shipping addresses yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {addresses.map(address => (
              <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={address._id}>
                <AddressCard address={address} onDelete={openDeleteConfirm} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          Confirm Address Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to permanently delete this address?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteAddress} color="error" variant="contained" autoFocus sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserAddressesPage;