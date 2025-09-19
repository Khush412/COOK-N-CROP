import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Radio, RadioGroup, FormControlLabel, FormControl, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, useTheme, alpha, Tooltip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import UpiIcon from '@mui/icons-material/TapAndPlay'; // Using a generic icon for UPI
import orderService from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import productService from '../services/productService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { clearCart } = useCart();

  const { shippingAddress, appliedCoupon } = location.state || {};
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccessDialogOpen, setOrderSuccessDialogOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await productService.getCart();
        const validItems = cartData?.items?.filter(item => item.product) || [];
        if (validItems.length === 0) {
          navigate('/cart');
        } else {
          setCart(cartData);
        }
      } catch (err) {
        navigate('/cart');
      } finally {
        setLoadingCart(false);
      }
    };

    if (!shippingAddress) {
      navigate('/cart');
    } else {
      fetchCart();
    }
  }, [shippingAddress, navigate]);

  const validItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter(item => item.product);
  }, [cart]);

  const subtotal = validItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discountAmount;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError('');
    try {
      const orderData = {
        orderItems: validItems.map(item => ({ product: item.product._id, qty: item.quantity })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const createdOrder = await orderService.createOrder(orderData);
      setPlacedOrderId(createdOrder._id);
      setOrderSuccessDialogOpen(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loadingCart || !cart) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Typography variant="h3" component="h1" fontWeight={800} gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily }}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Left Side: Order Summary & Shipping */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Shipping To</Typography>
            </Stack>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{shippingAddress.fullName}</Typography>
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</Typography>
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{shippingAddress.country}</Typography>
              {shippingAddress.phone && <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Phone: {shippingAddress.phone}</Typography>}
            </Box>
            <Button component={RouterLink} to="/cart" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Change Address</Button>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>Order Items</Typography>
            <List>
              {validItems.map(item => (
                <ListItem key={item.product?._id} divider>
                  <ListItemAvatar>
                    <Avatar src={item.product.image ? `${process.env.REACT_APP_API_URL}${item.product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} variant="rounded" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Qty: ${item.quantity} x $${item.product.price.toFixed(2)}${item.product.unit ? ` / ${item.product.unit}` : ''}`}
                    primaryTypographyProps={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}
                    secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                  />
                  <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>${(item.quantity * item.product.price).toFixed(2)}</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Payment & Order Total */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: theme.spacing(10) }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <PaymentsIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Payment Method</Typography>
            </Stack>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', bgcolor: paymentMethod === 'COD' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}>
                  <Radio value="COD" id="cod-radio" />
                  <label htmlFor="cod-radio" style={{ flexGrow: 1, cursor: 'pointer' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <AccountBalanceWalletIcon />
                      <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Cash on Delivery (COD)</Typography>
                    </Stack>
                  </label>
                </Paper>
                <Tooltip title="Coming Soon!" placement="left">
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2, display: 'flex', alignItems: 'center', cursor: 'not-allowed', opacity: 0.5 }}>
                    <Radio value="UPI" disabled />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <UpiIcon />
                      <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>UPI</Typography>
                    </Stack>
                  </Paper>
                </Tooltip>
                <Tooltip title="Coming Soon!" placement="left">
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', cursor: 'not-allowed', opacity: 0.5 }}>
                    <Radio value="Card" disabled />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <CreditCardIcon />
                      <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Credit / Debit Card</Typography>
                    </Stack>
                  </Paper>
                </Tooltip>
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Order Summary</Typography>
            <Stack spacing={1.5} sx={{ my: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal</Typography>
                <Typography sx={{ fontFamily: theme.typography.fontFamily }}>${subtotal.toFixed(2)}</Typography>
              </Stack>
              {appliedCoupon && (
                <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Discount ({appliedCoupon.code})</Typography>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>-${discountAmount.toFixed(2)}</Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping</Typography>
                <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Free</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Total</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>${total.toFixed(2)}</Typography>
            </Stack>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              sx={{ fontFamily: theme.typography.fontFamily, py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}
            >
              {isPlacingOrder ? <CircularProgress size={24} color="inherit" /> : `Confirm Order (${paymentMethod})`}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={orderSuccessDialogOpen} onClose={() => setOrderSuccessDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Order Placed Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>
            Your order has been placed. Thank you for your purchase!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(`/order/${placedOrderId}`)} autoFocus variant="contained" color="secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            View Order Details
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentPage;