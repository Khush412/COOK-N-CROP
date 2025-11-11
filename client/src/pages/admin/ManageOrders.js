import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Chip, Button, Select, MenuItem, IconButton, Container, Stack,
  TextField, FormControl, InputLabel, useTheme, alpha, Stepper, Step, StepLabel, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link as RouterLink } from 'react-router-dom';
import adminService from '../../services/adminService';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Loader from '../../custom_components/Loader';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
  };

  // Status order for timeline display
  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];

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

  const handleActionsClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Orders
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          View, update, and manage all customer orders.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search by ID, User, or Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
                IconComponent={FilterListIcon}
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
                <MenuItem value="All">All Statuses</MenuItem>
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
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
          >
            Create Order
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}><Loader size="large" /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{error}</Alert>
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
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow 
                        key={order._id} 
                        hover 
                        sx={{ 
                          '& td': { py: 1.5 },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Tooltip title={order._id}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 120, fontFamily: theme.typography.fontFamily, fontWeight: 500 }}>
                              {order._id.substring(0, 8)}...
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: 'primary.main',
                                fontSize: '0.75rem'
                              }}
                            >
                              {order.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 500 }}>
                                {order.user?.username || 'N/A'}
                              </Typography>
                              {order.user?.email && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                  {order.user.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                            ₹{order.totalPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.paymentMethod} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderRadius: 1, fontFamily: theme.typography.fontFamily }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={statusColors[order.status] || 'default'} 
                            size="small" 
                            sx={{ borderRadius: 1, fontFamily: theme.typography.fontFamily }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <Select 
                                value={order.status} 
                                onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                                size="small" 
                                disabled={updatingStatus === order._id}
                                sx={{ 
                                  borderRadius: 2, 
                                  fontFamily: theme.typography.fontFamily,
                                  '& .MuiSelect-select': { 
                                    py: 1, 
                                    px: 1.5 
                                  } 
                                }}
                              >
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Processing">Processing</MenuItem>
                                <MenuItem value="Shipped">Shipped</MenuItem>
                                <MenuItem value="Delivered">Delivered</MenuItem>
                                <MenuItem value="Canceled">Canceled</MenuItem>
                              </Select>
                            </FormControl>
                            {updatingStatus === order._id && <Loader size="small" />}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(event) => handleActionsClick(event, order)}
                            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                          <ReceiptLongIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                            No orders found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            Try adjusting your search criteria
                          </Typography>
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
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      borderRadius: 2,
                      fontFamily: theme.typography.fontFamily
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
        sx={{ '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } }}
      >
        <MenuItem 
          component={RouterLink} 
          to={`/order/${selectedOrder?._id}`}
          onClick={handleActionsClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to={`/admin/orders/edit/${selectedOrder?._id}`}
          onClick={handleActionsClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Order</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ManageOrders;