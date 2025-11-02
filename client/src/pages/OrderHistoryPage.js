import React, { useState, useEffect, useMemo } from 'react';
import {
  alpha,
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Stack,
  AvatarGroup,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import {
  Search as SearchIcon,
  ReceiptLong as ReceiptLongIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const OrderHistoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [page, setPage] = useState(1);
  const ordersPerPage = 6;

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
  };

  const statusIcons = {
    Pending: <PendingIcon />,
    Processing: <AccessTimeIcon />,
    Shipped: <LocalShippingIcon />,
    Delivered: <CheckCircleIcon />,
    Canceled: <CancelIcon />,
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load order history.');
        showSnackbar('Failed to load order history.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    let startDate = null;

    switch (dateFilter) {
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last9Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 9, now.getDate());
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'all':
      default:
        break;
    }

    if (startDate) {
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }

    // Sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [orders, searchTerm, dateFilter, statusFilter, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * ordersPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredAndSortedOrders, page]);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusIcon = (status) => {
    return statusIcons[status] || <ReceiptLongIcon />;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Your Order History
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Track your past purchases and reorder your favorites.
        </Typography>
      </Paper>

      {orders.length === 0 ? (
        <Paper sx={{ textAlign: 'center', my: 4, p: { xs: 3, sm: 6 }, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <ReceiptLongIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
            You haven't placed any orders yet.
          </Typography>
          <Button component={RouterLink} to="/CropCorner" variant="contained" size="large" sx={{ mt: 3, fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 4 }}>
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Search Orders"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Date</InputLabel>
                  <Select
                    value={dateFilter}
                    label="Date"
                    onChange={(e) => setDateFilter(e.target.value)}
                    sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
                    MenuProps={{
                      PaperProps: {
                        sx: { '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } },
                      },
                    }}
                  >
                    <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All Time</MenuItem>
                    <MenuItem value="last3Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 3 Months</MenuItem>
                    <MenuItem value="last6Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 6 Months</MenuItem>
                    <MenuItem value="last9Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 9 Months</MenuItem>
                    <MenuItem value="currentYear" sx={{ fontFamily: theme.typography.fontFamily }}>This Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
                    MenuProps={{
                      PaperProps: {
                        sx: { '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } },
                      },
                    }}
                  >
                    <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All Status</MenuItem>
                    <MenuItem value="Pending" sx={{ fontFamily: theme.typography.fontFamily }}>Pending</MenuItem>
                    <MenuItem value="Processing" sx={{ fontFamily: theme.typography.fontFamily }}>Processing</MenuItem>
                    <MenuItem value="Shipped" sx={{ fontFamily: theme.typography.fontFamily }}>Shipped</MenuItem>
                    <MenuItem value="Delivered" sx={{ fontFamily: theme.typography.fontFamily }}>Delivered</MenuItem>
                    <MenuItem value="Canceled" sx={{ fontFamily: theme.typography.fontFamily }}>Canceled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
                  <Select
                    value={sortOption}
                    label="Sort By"
                    onChange={(e) => setSortOption(e.target.value)}
                    sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
                    MenuProps={{
                      PaperProps: {
                        sx: { '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } },
                      },
                    }}
                  >
                    <MenuItem value="newest" sx={{ fontFamily: theme.typography.fontFamily }}>Newest First</MenuItem>
                    <MenuItem value="oldest" sx={{ fontFamily: theme.typography.fontFamily }}>Oldest First</MenuItem>
                    <MenuItem value="highest" sx={{ fontFamily: theme.typography.fontFamily }}>Highest Price</MenuItem>
                    <MenuItem value="lowest" sx={{ fontFamily: theme.typography.fontFamily }}>Lowest Price</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newValue) => newValue && setViewMode(newValue)}
                  aria-label="view mode"
                  fullWidth
                >
                  <ToggleButton value="list" aria-label="list view" sx={{ fontFamily: theme.typography.fontFamily }}>
                    List
                  </ToggleButton>
                  <ToggleButton value="grid" aria-label="grid view" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Grid
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>

          {/* Orders Display */}
          {paginatedOrders.length === 0 ? (
            <Paper sx={{ textAlign: 'center', my: 4, p: { xs: 3, sm: 6 }, borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
                No orders found matching your criteria.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'list' ? (
                <Stack spacing={3}>
                  {paginatedOrders.map((order) => (
                    <Card
                      key={order._id}
                      component={RouterLink}
                      to={`/order/${order._id}`}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        transition: '0.3s',
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          boxShadow: 8,
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>ORDER PLACED</Typography>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{new Date(order.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>TOTAL</Typography>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>₹{order.totalPrice.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 150 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>ORDER # {order._id.substring(0, 8)}</Typography>
                          <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status}
                            color={statusColors[order.status] || 'default'}
                            size="small"
                            sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                          />
                        </Box>
                      </Stack>
                      <Divider />
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mt={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 60, height: 60, border: `2px solid ${theme.palette.background.paper}` } }}>
                            {order.orderItems.slice(0, 4).map(item => (
                              <Avatar 
                                key={item._id} 
                                src={item.images && item.images.length > 0 ? `${process.env.REACT_APP_API_URL}${item.images[0]}` : (item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} 
                                alt={item.name} 
                              />
                            ))}
                          </AvatarGroup>
                          {order.orderItems.length > 4 && (
                            <Typography variant="body2" sx={{ ml: 1, fontFamily: theme.typography.fontFamily }}>+ {order.orderItems.length - 4} more</Typography>
                          )}
                        </Box>
                        <Button variant="contained" size="small" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
                          View Details
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Grid container spacing={3}>
                  {paginatedOrders.map((order) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={order._id}>
                      <Card
                        component={RouterLink}
                        to={`/order/${order._id}`}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          transition: '0.3s',
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': {
                            boxShadow: 8,
                            cursor: 'pointer',
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                ORDER #{order._id.substring(0, 8)}
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              color={statusColors[order.status] || 'default'}
                              size="small"
                              sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 40, height: 40, border: `2px solid ${theme.palette.background.paper}` } }}>
                              {order.orderItems.slice(0, 3).map(item => (
                                <Avatar 
                                  key={item._id} 
                                  src={item.images && item.images.length > 0 ? `${process.env.REACT_APP_API_URL}${item.images[0]}` : (item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} 
                                  alt={item.name} 
                                />
                              ))}
                            </AvatarGroup>
                            {order.orderItems.length > 3 && (
                              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>+ {order.orderItems.length - 3} more</Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ mt: 'auto' }}>
                            <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                              ₹{order.totalPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            size="small" 
                            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {/* Pagination */}
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
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderHistoryPage;