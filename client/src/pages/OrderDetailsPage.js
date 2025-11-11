import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  alpha,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  Chip,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ReplayIcon from '@mui/icons-material/Replay';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NoteIcon from '@mui/icons-material/Note';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Loader from '../custom_components/Loader';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderDetails(id);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details.');
        showSnackbar('Failed to load order details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

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

  const { addMultipleToCart } = useCart();

  const handleReorder = async () => {
    if (!order || !order.orderItems) return;
    setReordering(true);
    try {
      const itemsToReorder = order.orderItems
        .filter(item => item.product) // Filter out items where product was deleted
        .map(item => ({
          productId: item.product._id,
          quantity: item.qty,
        }));

      if (itemsToReorder.length === 0) {
        showSnackbar('None of the items from this order are currently available to re-order.', 'warning');
        setReordering(false);
        return;
      }

      await addMultipleToCart(itemsToReorder);
      const successMessage = itemsToReorder.length === order.orderItems.length ? 'Items added back to your cart!' : `${itemsToReorder.length} of ${order.orderItems.length} items were added back to your cart. Some may no longer be available.`;
      showSnackbar(successMessage, 'success');
      navigate('/cart');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to re-order items.';
      const unavailable = err.response?.data?.unavailableItems;
      // Create a more detailed error message if the backend provides details
      const detailedMessage = unavailable ? `${message} The following items may be out of stock: ${unavailable.map(i => i.name).join(', ')}.` : message;
      showSnackbar(detailedMessage, 'error');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Loader size="large" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4, fontFamily: theme.typography.fontFamily }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4, fontFamily: theme.typography.fontFamily }}>
        <Alert severity="info">Order not found.</Alert>
      </Container>
    );
  }

  // Trust badges data
  const trustBadges = [
    { icon: <LocalShippingIcon sx={{ fontSize: 24 }} />, title: "Free Delivery", description: "On orders over ₹2000" },
    { icon: <SecurityIcon sx={{ fontSize: 24 }} />, title: "100% Secure", description: "Protected payments" },
    { icon: <AutorenewIcon sx={{ fontSize: 24 }} />, title: "Easy Returns", description: "30-day guarantee" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Order Details
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Order #{order._id}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Placed On</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{format(new Date(order.createdAt), 'PPP')}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              ({formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })})
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Total Amount</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{order.totalPrice.toFixed(2)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block', mb: 0.5 }}>Status</Typography>
            <Chip
              label={order.status}
              color={statusColors[order.status] || 'default'} sx={{ fontFamily: theme.typography.fontFamily }}
              size="medium"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={reordering ? <Loader size="small" color="inherit" /> : <ReplayIcon />}
              onClick={handleReorder}
              disabled={reordering || order.status === 'Canceled' || order.orderItems.length === 0}
              sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px' }}
            > 
              Re-order
            </Button>
            {user?.role === 'admin' && (
              <Button component={RouterLink} to={`/admin/orders/edit/${order._id}`} variant="outlined" sx={{ borderRadius: '50px' }}>
                Edit
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Order History Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
            Order Status Timeline
          </Typography>
          <Stepper activeStep={order.statusHistory.length - 1} alternativeLabel sx={{ mt: 3 }}>
            {order.statusHistory.map((historyItem, index) => (
              <Step key={historyItem.timestamp}>
                <StepLabel>
                  <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{historyItem.status}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {format(new Date(historyItem.timestamp), 'MMM d, h:mm a')}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

        <Grid container spacing={4}>
          {/* Order Items */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {order.orderItems.map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItemButton
                        component={item.product ? RouterLink : 'div'}
                        to={item.product ? `/product/${item.product._id}` : undefined}
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          cursor: item.product ? 'pointer' : 'default',
                          '&:hover': { bgcolor: item.product ? alpha(theme.palette.action.hover, 0.5) : 'transparent' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar alt={item.name} src={item.images && item.images.length > 0 ? `${process.env.REACT_APP_API_URL}${item.images[0]}` : (item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} variant="rounded" sx={{ width: 80, height: 80, mr: 2, border: `1px solid ${theme.palette.divider}` }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, fontFamily: theme.typography.fontFamily, color: item.product ? 'text.primary' : 'text.disabled' }}>
                              {item.name} {!item.product && '(Product no longer available)'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                Quantity: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{item.qty}</Typography>
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                Price: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{item.price.toFixed(2)}</Typography>{item.unit ? ` / ${item.unit}` : ''}
                              </Typography>
                              <Typography variant="body1" color="text.primary" sx={{ mt: 0.5, fontFamily: theme.typography.fontFamily }}>
                                Subtotal: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{(item.price * item.qty).toFixed(2)}</Typography>
                              </Typography>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItemButton>
                      <Divider component="li" variant="inset" sx={{ ml: '100px' }} />
                    </React.Fragment>
                  ))}
                </List>
            </Paper>
          </Grid>

          {/* Shipping & Payment Summary */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
              <Grid container spacing={4}> 
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                    Shipping Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {order.shippingAddress.fullName && <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.fullName}</Typography>}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.street}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.country}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}><strong>Phone:</strong> {order.shippingAddress.phone}</Typography>
                  
                  {order.deliveryTimeSlot && (
                    <Box sx={{ mt: 3, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <ScheduleIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Delivery Time Slot</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, ml: 3.5 }}>
                        {order.deliveryTimeSlot === 'morning' && '🌅 Morning (8AM - 12PM)'}
                        {order.deliveryTimeSlot === 'afternoon' && '☀️ Afternoon (12PM - 5PM)'}
                        {order.deliveryTimeSlot === 'evening' && '🌆 Evening (5PM - 8PM)'}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.orderNotes && (
                    <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <NoteIcon fontSize="small" color="info" />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Order Notes</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontStyle: 'italic', ml: 3.5 }}>
                        "{order.orderNotes}"
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                    Payment Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal:</Typography><Typography sx={{ fontFamily: theme.typography.fontFamily }}>₹{order.subtotal.toFixed(2)}</Typography></Stack>
                    {order.harvestCoinsDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Harvest Coins Discount:</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>-₹{order.harvestCoinsDiscount.toFixed(2)}</Typography>
                      </Stack>
                    )}
                    {order.discount?.amount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Coupon Discount ({order.discount.code}):</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>-₹{order.discount.amount.toFixed(2)}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping:</Typography><Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                      {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'Free'}
                    </Typography></Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Payment Method:</Typography>
                      <Chip label={order.paymentMethod} size="small" variant="outlined" />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Total:</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{order.totalPrice.toFixed(2)}</Typography>
                    </Stack>
                    {order.harvestCoinsEarned > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, p: 1, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Harvest Coins Earned:</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>{order.harvestCoinsEarned} coins</Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  {/* Customer Support */}
                  <Box sx={{ mt: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <SupportAgentIcon color="primary" />
                          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                            Need Help?
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
                          If you have any questions about your order, our support team is here to help.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          component={RouterLink} 
                          to="/support"
                          sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                        >
                          Contact Support
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailsPage;