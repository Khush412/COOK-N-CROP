import React, { useState, useEffect, useMemo } from 'react';
import {
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
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import SearchIcon from '@mui/icons-material/Search';

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
  const [sortOption, setSortOption] = useState('dateDesc'); // New

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

    switch (sortOption) {
      case 'currentYear':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'last9Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 8, 1); // 9 months ago
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 months ago
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 3 months ago
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
  }, [orders, searchTerm, sortOption]);

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
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, minHeight: '70vh' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily }}>
          Your Order History
        </Typography>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4, p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
              You haven't placed any orders yet.
            </Typography>
            <Button component={Link} to="/CropCorner" variant="contained" size="large" sx={{ mt: 3, fontFamily: theme.typography.fontFamily }}>
              Start Shopping
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Search Orders"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, maxWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOption}
                  label="Sort By"
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="currentYear">Current Year</MenuItem>
                  <MenuItem value="last9Months">Last 9 Months</MenuItem>
                  <MenuItem value="last6Months">Last 6 Months</MenuItem>
                  <MenuItem value="last3Months">Last 3 Months</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Orders Display - Will be replaced with cards */}
            <Grid container spacing={3}>
              {filteredAndSortedOrders.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', my: 4, p: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
                      No orders found matching your criteria.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <Grid item xs={12} sm={6} md={4} key={order._id}>
                    <Card
                      elevation={2}
                      sx={{
                        borderRadius: 2,
                        transition: '0.3s',
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-4px)',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Order ID: {order._id}
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ mb: 1.5, fontFamily: theme.typography.fontFamily }}>
                          Total: ${order.totalPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Status: <Chip
                            label={order.status}
                            color={statusColors[order.status] || 'default'}
                            size="small"
                          />
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">Items:</Typography>
                          {order.orderItems.slice(0, 2).map((item) => (
                            <Typography key={item.product} variant="body2" color="text.secondary">
                              - {item.name} ({item.qty})
                            </Typography>
                          ))}
                          {order.orderItems.length > 2 && (
                            <Typography variant="body2" color="text.secondary">
                              ...and {order.orderItems.length - 2} more items
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/order/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        )}
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderHistoryPage;
