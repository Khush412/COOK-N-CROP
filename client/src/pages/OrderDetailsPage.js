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
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// Adding order status icons
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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

  // Add the status icons mapping after the statusColors definition
  const statusIcons = {
    Pending: <PendingIcon />,
    Processing: <AccessTimeIcon />,
    Shipped: <LocalShippingIcon />,
    Delivered: <CheckCircleIcon />,
    Canceled: <CancelIcon />,
  };

  // Define the standard order status flow
  const standardStatusFlow = ['Pending', 'Processing', 'Shipped', 'Delivered'];

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
    { icon: <LocalShippingIcon sx={{ fontSize: 28 }} />, title: "Free Delivery", description: "On orders over ₹2000" },
    { icon: <SecurityIcon sx={{ fontSize: 28 }} />, title: "100% Secure", description: "Protected payments" },
    { icon: <AutorenewIcon sx={{ fontSize: 28 }} />, title: "Easy Returns", description: "30-day guarantee" },
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

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                Placed On
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, ml: 5.5 }}>
              {format(new Date(order.createdAt), 'PPP')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block', ml: 5.5 }}>
              ({formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })})
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ReceiptLongIcon sx={{ color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                Total Amount
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, ml: 5.5, fontSize: '1.2rem' }}>
              ₹{order.totalPrice.toFixed(2)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.info.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ReceiptLongIcon sx={{ color: theme.palette.info.main }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block', mb: 0.5 }}>
                Status
              </Typography>
            </Box>
            <Chip
              label={order.status}
              color={statusColors[order.status] || 'default'} 
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                ml: 5.5,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                height: 28
              }}
              size="medium"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={reordering ? <Loader size="small" color="inherit" /> : <ReplayIcon />}
                onClick={handleReorder}
                disabled={reordering || order.status === 'Canceled' || order.orderItems.length === 0}
                sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px', px: 2 }}
              > 
                Re-order
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  component={RouterLink} 
                  to={`/admin/orders/edit/${order._id}`} 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  sx={{ 
                    borderRadius: '50px', 
                    px: 2,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Order History Timeline */}
      {order && (
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
            Order Status Timeline
          </Typography>
          <Stepper activeStep={standardStatusFlow.indexOf(order.status)} alternativeLabel sx={{ mt: 3 }}>
            {standardStatusFlow.map((status, index) => {
              // Find if this status exists in the order history
              const historyItem = order.statusHistory?.find(item => item.status === status);
              // Determine if this step is completed (before current status)
              const isCompleted = standardStatusFlow.indexOf(status) < standardStatusFlow.indexOf(order.status);
              // Determine if this is the active step (current status)
              const isActive = status === order.status;
              
              return (
                <Step key={status} completed={isCompleted}>
                  <StepLabel
                    icon={
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: statusColors[status] 
                            ? `${theme.palette[statusColors[status]].main}`
                            : theme.palette.grey[300],
                          color: 'white',
                          boxShadow: isActive ? 4 : 2,
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          border: isActive ? `3px solid ${theme.palette.grey[400]}` : 'none'
                        }}
                      >
                        {statusIcons[status] || <PendingIcon />}
                      </Box>
                    }
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': {
                          color: statusColors[status] 
                            ? `${theme.palette[statusColors[status]].main} !important`
                            : theme.palette.grey[300],
                          transform: 'scale(1.1)'
                        },
                        '&.Mui-completed': {
                          color: statusColors[status] 
                            ? `${theme.palette[statusColors[status]].main} !important`
                            : theme.palette.grey[300],
                        },
                      }
                    }}
                  >
                    <Box sx={{ 
                      textAlign: 'center',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: isActive ? alpha(statusColors[status] ? theme.palette[statusColors[status]].main : theme.palette.grey[300], 0.1) : 'transparent'
                    }}>
                      <Typography 
                        fontWeight="bold" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          color: statusColors[status] 
                            ? theme.palette[statusColors[status]].main
                            : 'inherit',
                          textShadow: isActive ? `0 0 4px ${alpha(statusColors[status] ? theme.palette[statusColors[status]].main : theme.palette.grey[300], 0.3)}` : 'none'
                        }}
                      >
                        {status}
                      </Typography>
                      {historyItem ? (
                        <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>
                          {format(new Date(historyItem.timestamp), 'MMM d, h:mm a')}
                        </Typography>
                      ) : isActive ? (
                        <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                          In Progress
                        </Typography>
                      ) : null}
                    </Box>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      )}

        <Grid container spacing={4}>
          {/* Order Items */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <ShoppingCartIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  Order Items
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {order.orderItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItemButton
                      component={item.product ? RouterLink : 'div'}
                      to={item.product ? `/product/${item.product._id}` : undefined}
                      alignItems="flex-start"
                      sx={{
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        cursor: item.product ? 'pointer' : 'default',
                        '&:hover': { 
                          bgcolor: item.product ? alpha(theme.palette.action.hover, 0.3) : 'transparent',
                          transform: item.product ? 'translateY(-2px)' : 'none',
                          boxShadow: item.product ? 2 : 'none'
                        },
                        transition: 'all 0.2s ease',
                        mb: 1,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          alt={item.name} 
                          src={item.images && item.images.length > 0 ? `${process.env.REACT_APP_API_URL}${item.images[0]}` : (item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} 
                          variant="rounded" 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mr: 2, 
                            border: `2px solid ${theme.palette.divider}`,
                            boxShadow: 2
                          }} 
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, fontFamily: theme.typography.fontFamily, color: item.product ? 'text.primary' : 'text.disabled' }}>
                            {item.name} {!item.product && '(Product no longer available)'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                Quantity: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{item.qty}</Typography>
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                Price: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{item.price.toFixed(2)}</Typography>{item.unit ? ` / ${item.unit}` : ''}
                              </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" color="text.primary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                Subtotal: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>₹{(item.price * item.qty).toFixed(2)}</Typography>
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItemButton>
                    <Divider component="li" sx={{ my: 1 }} />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Shipping & Payment Summary */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Grid container spacing={4}> 
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <LocalShippingIcon sx={{ color: theme.palette.secondary.main }} />
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                      Shipping Address
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                      {order.shippingAddress.fullName && <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.fullName}</Typography>}
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>{order.shippingAddress.street}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>{order.shippingAddress.country}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                      <strong>Phone:</strong> {order.shippingAddress.phone}
                    </Typography>
                  </Box>
                  
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <ReceiptLongIcon sx={{ color: theme.palette.success.main }} />
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                      Payment Summary
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal:</Typography>
                      <Typography sx={{ fontFamily: theme.typography.fontFamily }}>₹{order.subtotal.toFixed(2)}</Typography>
                    </Stack>
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
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping:</Typography>
                      <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                        {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'Free'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Payment Method:</Typography>
                      <Chip label={order.paymentMethod} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Total:</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>₹{order.totalPrice.toFixed(2)}</Typography>
                    </Stack>
                    {order.harvestCoinsEarned > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Harvest Coins Earned:</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>{order.harvestCoinsEarned} coins</Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  {/* Customer Support */}
                  <Box sx={{ mt: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
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
                          startIcon={<SupportAgentIcon />}
                          sx={{ 
                            borderRadius: '50px', 
                            fontFamily: theme.typography.fontFamily,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.main,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
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