import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography, CircularProgress, Alert, Box, Paper, Grid, IconButton, Tooltip, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import adminService from '../../services/adminService';

const AddressCard = ({ address, onDelete }) => (
  <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flexGrow: 1, mb: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold">{address.label}</Typography>
      <Typography variant="body2">{address.fullName}</Typography>
      <Typography variant="body2">{address.street}</Typography>
      <Typography variant="body2">{address.city}, {address.state} {address.zipCode}</Typography>
      <Typography variant="body2">{address.country}</Typography>
      {address.phone && <Typography variant="body2">Phone: {address.phone}</Typography>}
    </Box>
    <Box sx={{ mt: 1, textAlign: 'right' }}>
      <Tooltip title="Delete Address">
        <IconButton onClick={() => onDelete(address._id)} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);

const AdminUserAddressesPage = () => {
  const { userId } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await adminService.deleteUserAddress(userId, addressId);
        fetchAddresses(); // Refresh list
      } catch (err) {
        alert('Failed to delete address.');
      }
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Addresses for <Typography component="span" variant="h4" color="primary">{username}</Typography>
      </Typography>
      <Button component={RouterLink} to="/admin/users" sx={{ mb: 2 }}>
        &larr; Back to Manage Users
      </Button>
      {addresses.length === 0 ? (
        <Alert severity="info">This user has no saved addresses.</Alert>
      ) : (
        <Grid container spacing={3}>
          {addresses.map(address => (
            <Grid item xs={12} sm={6} md={4} key={address._id}>
              <AddressCard address={address} onDelete={handleDeleteAddress} />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default AdminUserAddressesPage;