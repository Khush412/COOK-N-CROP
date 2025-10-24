import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Radio, RadioGroup, FormControl, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, useTheme, alpha, Card, CardContent
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NoteIcon from '@mui/icons-material/Note';
import SecurityIcon from '@mui/icons-material/Security';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import orderService from '../services/orderService';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';

const PaymentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const {
    shippingAddress,
    appliedCoupon,
    deliveryTimeSlot,
    orderNotes,
    harvestCoinsDiscount = 0,
    harvestCoinsUsed = 0,
    deliveryCharge: passedDeliveryCharge
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderSuccessDialogOpen, setOrderSuccessDialogOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await productService.getCart();
        setCart(cartData);
      } catch (err) {
        setError('Failed to load cart.');
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
        deliveryTimeSlot: deliveryTimeSlot || undefined,
        orderNotes: orderNotes || undefined,
        harvestCoinsUsed: harvestCoinsUsed || undefined,
        harvestCoinsDiscount: harvestCoinsDiscount || undefined,
        deliveryCharge: deliveryCharge || undefined,
      };

      const createdOrder = await orderService.createOrder(orderData);
      setPlacedOrderId(createdOrder._id);
      setOrderSuccessDialogOpen(true);
      // Clear the cart after successful order placement
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loadingCart || !cart) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // Trust badges data
  const trustBadges = [
    { icon: <SecurityIcon sx={{ fontSize: 24 }} />, title: "100% Secure", description: "Protected payments" },
    { icon: <VerifiedUserIcon sx={{ fontSize: 24 }} />, title: "Verified Sellers", description: "Trusted vendors" },
    { icon: <LocalOfferIcon sx={{ fontSize: 24 }} />, title: "Best Prices", description: "Guaranteed deals" },
  ];

  const subtotal = validItems.reduce((acc, item) => {
    const effectivePrice = item.product.salePrice || item.product.price;
    return acc + effectivePrice * item.quantity;
  }, 0) || 0;
  
  // Use passed delivery charge or calculate if not provided
  const deliveryCharge = passedDeliveryCharge !== undefined 
    ? passedDeliveryCharge 
    : (subtotal < 200 ? 40 : 0);
  
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + deliveryCharge - discountAmount - (harvestCoinsDiscount || 0);

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
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Phone: {shippingAddress.phone}</Typography>
            </Box>
            <Button component={RouterLink} to="/cart" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Change Address</Button>
          </Paper>

          {deliveryTimeSlot && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Delivery Time Slot</Typography>
              </Stack>
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {deliveryTimeSlot === 'morning' && '🌅 Morning (8AM - 12PM)'}
                  {deliveryTimeSlot === 'afternoon' && '☀️ Afternoon (12PM - 5PM)'}
                  {deliveryTimeSlot === 'evening' && '🌆 Evening (5PM - 8PM)'}
                </Typography>
              </Box>
            </Paper>
          )}

          {orderNotes && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <NoteIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Notes</Typography>
              </Stack>
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography sx={{ fontFamily: theme.typography.fontFamily, fontStyle: 'italic' }}>
                  "{orderNotes}"
                </Typography>
              </Box>
            </Paper>
          )}

          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>Order Items</Typography>
            <List>
              {validItems.map(item => {
                const effectivePrice = item.product.salePrice || item.product.price;
                const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
                
                return (
                <ListItem key={item.product?._id} divider>
                  <ListItemAvatar>
                    <Avatar src={item.product.image ? `${process.env.REACT_APP_API_URL}${item.product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} variant="rounded" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product.name}
                    secondary={
                      <Box component="span">
                        Qty: {item.quantity} x 
                        {hasDiscount && (
                          <Typography component="span" sx={{ textDecoration: 'line-through', mx: 0.5, color: 'text.disabled' }}>
                            ₹{item.product.price.toFixed(2)}
                          </Typography>
                        )}
                        <Typography component="span" sx={{ color: hasDiscount ? 'error.main' : 'text.primary', fontWeight: hasDiscount ? 'bold' : 'normal' }}>
                            ₹{effectivePrice.toFixed(2)}
                        </Typography>
                        {item.product.unit ? ` / ${item.product.unit}` : ''}
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}
                    secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily, component: 'div' }}
                  />
                  <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: hasDiscount ? 'error.main' : 'text.primary' }}>
                    ₹{(item.quantity * effectivePrice).toFixed(2)}
                  </Typography>
                </ListItem>
              )})}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Payment & Order Total */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: theme.spacing(10) }}>
            {/* Trust Badges */}
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: theme.typography.fontFamily }}>
                  Secure Checkout
                </Typography>
                <Grid container spacing={2}>
                  {trustBadges.map((badge, index) => (
                    <Grid item xs={4} key={index} sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {badge.icon}
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                        {badge.title}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

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
              </RadioGroup>
            </FormControl>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>Order Summary</Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal:</Typography>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>₹{subtotal.toFixed(2)}</Typography>
                </Stack>
                {deliveryCharge > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Delivery Charge:</Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily }}>₹{deliveryCharge.toFixed(2)}</Typography>
                  </Stack>
                )}
                {harvestCoinsDiscount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Harvest Coins Discount:</Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main' }}>-₹{harvestCoinsDiscount.toFixed(2)}</Typography>
                  </Stack>
                )}
                {appliedCoupon && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Coupon ({appliedCoupon.code}):</Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main' }}>-₹{appliedCoupon.discountAmount.toFixed(2)}</Typography>
                  </Stack>
                )}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>₹{total.toFixed(2)}</Typography>
                </Stack>
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
                {isPlacingOrder ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Place Order'}
              </Button>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={orderSuccessDialogOpen} onClose={() => navigate('/')} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontFamily: theme.typography.fontFamily }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Placed Successfully!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', fontFamily: theme.typography.fontFamily }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
            Thank you for your order!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
            Your order #{placedOrderId?.toString().slice(-6)} has been placed successfully. You will receive a confirmation email shortly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/order/${placedOrderId}`}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 4 }}
          >
            View Order Details
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 4 }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentPage;