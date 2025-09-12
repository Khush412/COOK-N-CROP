import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Chip, Button, Select, MenuItem, IconButton,
  TextField, FormControl, InputLabel
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import adminService from '../../services/adminService';

const ManageOrders = () => {
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
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, minHeight: 60 }}>
        <Typography variant="h4" gutterBottom sx={{ m: 0 }}>Manage Orders</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by ID, User, or Email"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>
                        <Tooltip title={order._id}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                            {order._id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{order.user?.username || 'N/A'}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell><Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" /></TableCell>
                      <TableCell align="right">
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          size="small"
                          disabled={updatingStatus === order._id}
                          sx={{ minWidth: 120, mr: 1 }}
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Processing">Processing</MenuItem>
                          <MenuItem value="Shipped">Shipped</MenuItem>
                          <MenuItem value="Delivered">Delivered</MenuItem>
                          <MenuItem value="Canceled">Canceled</MenuItem>
                        </Select>
                        {updatingStatus === order._id && <CircularProgress size={20} sx={{ verticalAlign: 'middle', mr: 1 }} />}
                        <Button component={RouterLink} to={`/order/${order._id}`} size="small">
                          Details
                        </Button>
                    <Tooltip title="Edit Order">
                      <IconButton component={RouterLink} to={`/admin/orders/edit/${order._id}`} size="small"><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No orders found matching your criteria.</Typography>
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
  );
};

export default ManageOrders;