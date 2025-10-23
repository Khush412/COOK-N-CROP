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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const OrderHistoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [searchTerm, setSearchTerm] = useState(''); // New
  const [dateFilter, setDateFilter] = useState('all'); // New

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
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

    const now = new Date();
    let startDate = null;

    switch (dateFilter) {
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
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
        // No date filtering
        break;
    }

    if (startDate) {
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }

    // Always sort by date descending (newest first) within the filtered set
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [orders, searchTerm, dateFilter]);

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
            <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 2 }}>
              <TextField
                label="Search Orders"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                }}
                sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '20px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Filter by Date</InputLabel>
                <Select
                  value={dateFilter}
                  label="Filter by Date"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
                  MenuProps={{
                    PaperProps: {
                      sx: { '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } },
                    },
                  }}
                >
                  <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All Orders</MenuItem>
                  <MenuItem value="last3Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 3 Months</MenuItem>
                  <MenuItem value="last6Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 6 Months</MenuItem>
                  <MenuItem value="last9Months" sx={{ fontFamily: theme.typography.fontFamily }}>Last 9 Months</MenuItem>
                  <MenuItem value="currentYear" sx={{ fontFamily: theme.typography.fontFamily }}>This Year</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            {/* Orders Display - Will be replaced with cards */}
            <Stack spacing={3}> {/* Use size prop */}
              {filteredAndSortedOrders.length === 0 ? (
                <Paper sx={{ textAlign: 'center', my: 4, p: { xs: 3, sm: 6 }, borderRadius: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
                    No orders found matching your criteria.
                  </Typography>
                </Paper>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <Paper
                    key={order._id}
                    component={RouterLink}
                    to={`/order/${order._id}`}
                    elevation={3}
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
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>ORDER PLACED</Typography>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{new Date(order.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>TOTAL</Typography>
                          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>${order.totalPrice.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 150 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>ORDER # {order._id}</Typography>
                          <Chip
                            label={order.status}
                            color={statusColors[order.status] || 'default'}
                            size="small" sx={{ fontFamily: theme.typography.fontFamily,fontWeight: 'bold' }}
                          />
                        </Box>
                      </Stack>
                      <Divider />
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mt={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 60, height: 60, border: `2px solid ${theme.palette.background.paper}` } }}>
                            {order.orderItems.map(item => (
                              <Avatar key={item._id} src={item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} alt={item.name} />
                            ))}
                          </AvatarGroup>
                          {order.orderItems.length > 4 && (
                            // Added fontFamily to Typography
                            <Typography variant="body2" sx={{ ml: 1, fontFamily: theme.typography.fontFamily }}>+ {order.orderItems.length - 4} more</Typography>
                          )}
                        </Box>
                        <Button variant="contained" size="small" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
                          View Order Details
                        </Button>
                      </Stack>
                  </Paper>
                ))
              )}
            </Stack>
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
