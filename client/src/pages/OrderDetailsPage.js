import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  Card,
  CardContent,
  Chip,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import orderService from '../services/orderService';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

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

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
        <Alert severity="info">Order not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Order Details
        </Typography>

        {/* Centralized Order Summary */}
        <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" fontWeight="bold">Order ID:</Typography>
                <Typography variant="body2" color="text.secondary">{order._id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" fontWeight="bold">Placed On:</Typography>
                <Typography variant="body2" color="text.secondary">{format(new Date(order.createdAt), 'PPP p')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="h6" color="primary">${order.totalPrice.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" fontWeight="bold">Status:</Typography>
                {order.isDelivered ? (
                  <Chip label="Delivered" color="success" size="medium" sx={{ fontWeight: 'bold' }} />
                ) : order.isPaid ? (
                  <Chip label="Paid" color="info" size="medium" sx={{ fontWeight: 'bold' }} />
                ) : (
                  <Chip label="Pending" color="warning" size="medium" sx={{ fontWeight: 'bold' }} />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Shipping Address */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.secondary.main }}>
                  Shipping Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">
                  {order.shippingAddress.fullName && <Typography component="span" fontWeight="bold">{order.shippingAddress.fullName}</Typography>}
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress.street}
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress.country}
                </Typography>
                {order.shippingAddress.phone && (
                  <Typography variant="body1">
                    <strong>Phone:</strong> {order.shippingAddress.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment and Delivery Details */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.secondary.main }}>
                  Payment & Delivery
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {order.paymentMethod && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Payment Method:</strong> {order.paymentMethod}
                  </Typography>
                )}
                {order.isPaid && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Paid On:</strong> {format(new Date(order.paidAt), 'PPP p')}
                  </Typography>
                )}
                {order.isDelivered && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Delivered On:</strong> {format(new Date(order.deliveredAt), 'PPP p')}
                  </Typography>
                )}
                {!order.isPaid && !order.isDelivered && (
                  <Typography variant="body1" color="text.secondary">
                    No payment or delivery details available yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.secondary.main }}>
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List sx={{ maxWidth:330,maxHeight: 340, overflowY: 'auto',overflowX:'auto' }}>
                  {order.orderItems.map((item) => (
                    <React.Fragment key={item.product}>
                      <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar
                            alt={item.name}
                            src={item.image || '/images/placeholder.png'} // Use a placeholder if image is not available
                            variant="rounded"
                            sx={{ width: 80, height: 80, mr: 2, border: `1px solid ${theme.palette.divider}` }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: <Typography component="span" fontWeight="bold">{item.qty}</Typography>
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Price: <Typography component="span" fontWeight="bold">${item.price.toFixed(2)}</Typography> each
                              </Typography>
                              <Typography variant="body1" color="text.primary" sx={{ mt: 0.5 }}>
                                Subtotal: <Typography component="span" fontWeight="bold">${(item.price * item.qty).toFixed(2)}</Typography>
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" sx={{ ml: '100px' }} />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailsPage;
