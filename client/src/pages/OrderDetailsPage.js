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
  useMediaQuery,
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
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Loader from '../custom_components/Loader';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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
      <Container maxWidth="md" sx={{ mt: { xs: 10, sm: 12, md: 14 }, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Loader size="large" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 10, sm: 12, md: 14 }, mb: 4, fontFamily: theme.typography.fontFamily }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 10, sm: 12, md: 14 }, mb: 4, fontFamily: theme.typography.fontFamily }}>
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
    <Container maxWidth="lg" sx={{ mt: { xs: 10, sm: 12, md: 14 }, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Order Details
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Order #{order._id}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 24 }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Placed On
              </Typography>
            </Box>
            <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, ml: isMobile ? 4.5 : 5.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {format(new Date(order.createdAt), 'PPP')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block', ml: isMobile ? 4.5 : 5.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              ({formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })})
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ReceiptLongIcon sx={{ color: theme.palette.secondary.main, fontSize: isMobile ? 20 : 24 }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Total Amount
              </Typography>
            </Box>
            <Typography variant={isMobile ? "body1" : "body1"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, ml: isMobile ? 4.5 : 5.5, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              ₹{order.totalPrice.toFixed(2)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.info.main, 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <ReceiptLongIcon sx={{ color: theme.palette.info.main, fontSize: isMobile ? 20 : 24 }} />
              </Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block', mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Status
              </Typography>
            </Box>
            <Chip
              label={order.status}
              color={statusColors[order.status] || 'default'} 
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                ml: isMobile ? 4.5 : 5.5,
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                height: isMobile ? 24 : 28
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
            <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 1 : 1.5} sx={{ width: isMobile ? '100%' : 'auto' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={reordering ? <Loader size="small" color="inherit" /> : <ReplayIcon />}
                onClick={handleReorder}
                disabled={reordering || order.status === 'Canceled' || order.orderItems.length === 0}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: isMobile ? 1.5 : 2,
                  py: isMobile ? 0.75 : 1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  width: isMobile ? '100%' : 'auto'
                }}
                size={isMobile ? "small" : "medium"}
              > 
                {isMobile ? 'Re-order' : 'Re-order'}
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  component={RouterLink} 
                  to={`/admin/orders/edit/${order._id}`} 
                  variant="outlined" 
                  startIcon={<EditIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                  sx={{ 
                    borderRadius: '50px', 
                    px: isMobile ? 1.5 : 2,
                    py: isMobile ? 0.75 : 1,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    width: isMobile ? '100%' : 'auto',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                  size={isMobile ? "small" : "medium"}
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
        <Paper elevation={2} sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
            Order Status Timeline
          </Typography>
          <Stepper 
            activeStep={standardStatusFlow.indexOf(order.status)} 
            alternativeLabel 
            sx={{ 
              mt: { xs: 1.5, sm: 3 },
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.875rem' }
              },
              '& .MuiStepConnector-line': {
                borderColor: theme.palette.divider
              }
            }}
            orientation="horizontal"
          >
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
                          width: isMobile ? 20 : 48,
                          height: isMobile ? 20 : 48,
                          borderRadius: '50%',
                          bgcolor: statusColors[status] 
                            ? `${theme.palette[statusColors[status]].main}`
                            : theme.palette.grey[300],
                          color: 'white',
                          boxShadow: isActive ? 2 : 1,
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          border: isActive ? `1px solid ${theme.palette.grey[400]}` : 'none'
                        }}
                      >
                        {statusIcons[status] || <PendingIcon sx={{ fontSize: isMobile ? 10 : 20 }} />}
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
                      py: isMobile ? 0.1 : 0.25,
                      px: isMobile ? 0.25 : 0.5,
                      borderRadius: 0.5,
                      bgcolor: isActive ? alpha(statusColors[status] ? theme.palette[statusColors[status]].main : theme.palette.grey[300], 0.1) : 'transparent'
                    }}>
                      <Typography 
                        fontWeight="bold" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          color: statusColors[status] 
                            ? theme.palette[statusColors[status]].main
                            : 'inherit',
                          textShadow: isActive ? `0 0 2px ${alpha(statusColors[status] ? theme.palette[statusColors[status]].main : theme.palette.grey[300], 0.3)}` : 'none',
                          fontSize: { xs: '0.5rem', sm: '0.65rem', md: '0.875rem' }
                        }}
                      >
                        {status}
                      </Typography>
                      {historyItem ? (
                        <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.35rem', sm: '0.45rem' } }}>
                          {format(new Date(historyItem.timestamp), 'MMM d')}
                        </Typography>
                      ) : isActive ? (
                        <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary', fontSize: { xs: '0.35rem', sm: '0.45rem' } }}>
                          Now
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

        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Order Items */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  width: isMobile ? 40 : 48, 
                  height: isMobile ? 40 : 48, 
                  borderRadius: { xs: 1.5, sm: 2 }, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <ShoppingCartIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 24 }} />
                </Box>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                  Order Items
                </Typography>
              </Box>
              <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
              <List>
                {order.orderItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItemButton
                      component={item.product ? RouterLink : 'div'}
                      to={item.product ? `/product/${item.product._id}` : undefined}
                      alignItems="flex-start"
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 1.5, sm: 2 },
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
                            width: isMobile ? 60 : 80, 
                            height: isMobile ? 60 : 80, 
                            mr: { xs: 1.5, sm: 2 }, 
                            border: `2px solid ${theme.palette.divider}`,
                            boxShadow: 2
                          }} 
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ mb: 0.5, fontFamily: theme.typography.fontFamily, color: item.product ? 'text.primary' : 'text.disabled', fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                            {item.name} {!item.product && '(Product no longer available)'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, mt: 1 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Quantity: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{item.qty}</Typography>
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Price: <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>₹{item.price.toFixed(2)}</Typography>{item.unit ? ` / ${item.unit}` : ''}
                              </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant={isMobile ? "body2" : "body1"} color="text.primary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
            <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Grid container spacing={isMobile ? 2 : 4}> 
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ 
                      width: isMobile ? 40 : 48, 
                      height: isMobile ? 40 : 48, 
                      borderRadius: { xs: 1.5, sm: 2 }, 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <LocalShippingIcon sx={{ color: theme.palette.secondary.main, fontSize: isMobile ? 20 : 24 }} />
                    </Box>
                    <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                      Shipping Address
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
                  <Box sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    borderRadius: { xs: 1.5, sm: 2 }, 
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                      {order.shippingAddress.fullName && <Typography component="span" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{order.shippingAddress.fullName}</Typography>}
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{order.shippingAddress.street}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{order.shippingAddress.country}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                      <strong>Phone:</strong> {order.shippingAddress.phone}
                    </Typography>
                  </Box>
                  
                  {order.deliveryTimeSlot && (
                    <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 }, border: `1px solid ${theme.palette.divider}`, borderRadius: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <ScheduleIcon fontSize={isMobile ? "small" : "medium"} color="primary" sx={{ fontSize: isMobile ? 16 : 20 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Delivery Time Slot</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, ml: isMobile ? 3 : 3.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order.deliveryTimeSlot === 'morning' && '🌅 Morning (8AM - 12PM)'}
                        {order.deliveryTimeSlot === 'afternoon' && '☀️ Afternoon (12PM - 5PM)'}
                        {order.deliveryTimeSlot === 'evening' && '🌆 Evening (5PM - 8PM)'}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.orderNotes && (
                    <Box sx={{ mt: { xs: 1.5, sm: 2 }, p: { xs: 1.5, sm: 2 }, border: `1px solid ${theme.palette.divider}`, borderRadius: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <NoteIcon fontSize={isMobile ? "small" : "medium"} color="info" sx={{ fontSize: isMobile ? 16 : 20 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Order Notes</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontStyle: 'italic', ml: isMobile ? 3 : 3.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        "{order.orderNotes}"
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ 
                      width: isMobile ? 40 : 48, 
                      height: isMobile ? 40 : 48, 
                      borderRadius: { xs: 1.5, sm: 2 }, 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <ReceiptLongIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />
                    </Box>
                    <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                      Payment Summary
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
                  <Stack spacing={isMobile ? 1 : 1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Subtotal:</Typography>
                      <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>₹{order.subtotal.toFixed(2)}</Typography>
                    </Stack>
                    {order.harvestCoinsDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Harvest Coins Discount:</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>-&#8377;{order.harvestCoinsDiscount.toFixed(2)}</Typography>
                      </Stack>
                    )}
                    {order.discount?.amount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Coupon Discount ({order.discount.code}):</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>-&#8377;{order.discount.amount.toFixed(2)}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Shipping:</Typography>
                      <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'Free'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Payment Method:</Typography>
                      <Chip label={order.paymentMethod} size={isMobile ? "small" : "medium"} variant="outlined" sx={{ borderRadius: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>Total:</Typography>
                      <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>₹{order.totalPrice.toFixed(2)}</Typography>
                    </Stack>
                    {order.harvestCoinsEarned > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, p: { xs: 1, sm: 1.5 }, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Harvest Coins Earned:</Typography>
                        <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{order.harvestCoinsEarned} coins</Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  {/* Customer Support */}
                  <Box sx={{ mt: { xs: 2, sm: 4 } }}>
                    <Card variant="outlined" sx={{ borderRadius: { xs: 1.5, sm: 2 }, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <SupportAgentIcon color="primary" sx={{ fontSize: isMobile ? 20 : 24 }} />
                          <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                            Need Help?
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1.5, sm: 2 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          If you have any questions about your order, our support team is here to help.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          component={RouterLink} 
                          to="/support"
                          startIcon={<SupportAgentIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                          sx={{ 
                            borderRadius: '50px', 
                            fontFamily: theme.typography.fontFamily,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.main,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.05)
                            },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            width: isMobile ? '100%' : 'auto'
                          }}
                          size={isMobile ? "small" : "medium"}
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
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailsPage;