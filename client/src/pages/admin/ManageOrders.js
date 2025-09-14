import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Chip, Button, Select, MenuItem, IconButton, Container, Stack,
  TextField, FormControl, InputLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import adminService from '../../services/adminService';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const ManageOrders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(null); // Tracks which order is being updated

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset page to 1 when search term changes
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders({ page, search: debouncedSearchTerm, status: statusFilter });
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to fetch orders.');
      setOrders([]); // Clear orders on error
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const updatedOrder = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Orders
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          View, update, and manage all customer orders.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search by ID, User, or Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontFamily: theme.typography.fontFamily,
                      },
                    },
                  },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Button
            component={RouterLink}
            to="/admin/orders/create"
            variant="contained"
            startIcon={<AddShoppingCartIcon />}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Create Order
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Tooltip title={order._id}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 100, fontFamily: theme.typography.fontFamily }}>
                              {order._id}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{order.user?.username || 'N/A'}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>${order.totalPrice.toFixed(2)}</TableCell>
                        <TableCell><Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" /></TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                            <Select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} size="small" disabled={updatingStatus === order._id} sx={{ minWidth: 120, '.MuiSelect-select': { py: 0.8 } }}>
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Processing">Processing</MenuItem>
                              <MenuItem value="Shipped">Shipped</MenuItem>
                              <MenuItem value="Delivered">Delivered</MenuItem>
                              <MenuItem value="Canceled">Canceled</MenuItem>
                            </Select>
                            {updatingStatus === order._id && <CircularProgress size={20} />}
                            <Button component={RouterLink} to={`/order/${order._id}`} size="small" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
                              Details
                            </Button>
                            <Tooltip title="Edit Order">
                              <IconButton component={RouterLink} to={`/admin/orders/edit/${order._id}`} size="small"><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <ReceiptLongIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No orders found matching your criteria.</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ManageOrders;