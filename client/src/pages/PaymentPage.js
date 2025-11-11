import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Radio, RadioGroup, FormControl, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, useTheme, alpha, Card, CardContent, CardHeader, Chip, LinearProgress, Select, MenuItem, InputLabel, FormControlLabel, Checkbox, TextField
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NoteIcon from '@mui/icons-material/Note';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarsIcon from '@mui/icons-material/Stars';
import AddIcon from '@mui/icons-material/Add';
import orderService from '../services/orderService';
import productService from '../services/productService';
import addressService from '../services/addressService';
import { useCart } from '../contexts/CartContext';
import Loader from '../custom_components/Loader';

const PaymentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const {
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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

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

    const fetchAddresses = async () => {
      try {
        const userAddresses = await addressService.getAddresses();
        setAddresses(userAddresses);
        // Set default address if available
        if (userAddresses.length > 0) {
          const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
          setSelectedAddress(defaultAddress);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };

    fetchCart();
    fetchAddresses();
  }, []);

  const validItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter(item => item.product);
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address.');
      return;
    }
    
    setIsPlacingOrder(true);
    setError('');
    try {
      const orderData = {
        orderItems: validItems.map(item => ({ product: item.product._id, qty: item.quantity })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
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

  const handleAddressChange = (event) => {
    const addressId = event.target.value;
    const address = addresses.find(addr => addr._id === addressId);
    setSelectedAddress(address);
  };

  const handleAddNewAddressClick = () => {
    setShowAddressForm(true);
  };

  const handleAddressFormClose = () => {
    setShowAddressForm(false);
    setNewAddress({
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    });
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewAddress = async () => {
    try {
      const addedAddress = await addressService.addAddress(newAddress);
      setAddresses(prev => [...prev, addedAddress]);
      setSelectedAddress(addedAddress);
      handleAddressFormClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address.');
    }
  };

  if (loadingCart || !cart) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Loader size="medium" /></Box>;
  }

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

  // Calculate savings
  const totalSavings = discountAmount + (harvestCoinsDiscount || 0);

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          fontWeight={800} 
          gutterBottom 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Secure Checkout
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ fontFamily: theme.typography.fontFamily, maxWidth: 600, mx: 'auto' }}
        >
          Complete your purchase with confidence. Your order is protected with our secure payment system.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Left Side: Order Summary & Shipping */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Progress Indicator */}
          <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                  Checkout Progress
                </Typography>
                <Chip 
                  label={`Step 3 of 3`} 
                  color="primary" 
                  size="small" 
                  sx={{ fontWeight: 'bold' }} 
                />
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.divider, 0.3),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.primary.main
                  }
                }} 
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                  Cart
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                  Information
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary', fontWeight: 'bold' }}>
                  Payment
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Address Selection */}
          <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardHeader
              avatar={<LocalShippingIcon sx={{ color: theme.palette.primary.main }} />}
              title={<Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Shipping Address</Typography>}
              action={
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={handleAddNewAddressClick}
                  sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                >
                  Add New
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {addresses.length > 0 ? (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>
                    Select Shipping Address
                  </InputLabel>
                  <Select
                    value={selectedAddress?._id || ''}
                    label="Select Shipping Address"
                    onChange={handleAddressChange}
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      borderRadius: 1
                    }}
                  >
                    {addresses.map((address) => (
                      <MenuItem 
                        key={address._id} 
                        value={address._id}
                        sx={{ fontFamily: theme.typography.fontFamily }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                            {address.fullName} {address.isDefault && (
                              <Chip 
                                label="Default" 
                                size="small" 
                                sx={{ 
                                  ml: 1, 
                                  height: 20, 
                                  '& .MuiChip-label': { 
                                    px: 1, 
                                    fontSize: '0.7rem' 
                                  } 
                                }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            {address.street}, {address.city}, {address.state} {address.zipCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            Phone: {address.phone}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textAlign: 'center', py: 2 }}>
                  No addresses found. Add a new address to continue.
                </Typography>
              )}
              
              {selectedAddress && (
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  mt: 2
                }}>
                  <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 1 }}>
                    Selected Address:
                  </Typography>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                    <strong>{selectedAddress.fullName}</strong>
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Phone: {selectedAddress.phone}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardHeader
              avatar={<ShoppingCartIcon sx={{ color: theme.palette.primary.main }} />}
              title={<Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Items</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <List>
                {validItems.map(item => {
                  const effectivePrice = item.product.salePrice || item.product.price;
                  const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
                  
                  return (
                    <ListItem key={item.product?._id} sx={{ py: 2, px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={item.product.images && item.product.images.length > 0 ? `${process.env.REACT_APP_API_URL}${item.product.images[0]}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} 
                          variant="rounded" 
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                            {item.product.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span">
                            <Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                              Qty: {item.quantity} × 
                            </Typography>
                            {hasDiscount && (
                              <Typography component="span" sx={{ textDecoration: 'line-through', mx: 0.5, color: 'text.disabled' }}>
                                ₹{item.product.price.toFixed(2)}
                              </Typography>
                            )}
                            <Typography component="span" sx={{ color: hasDiscount ? 'error.main' : 'text.primary', fontWeight: hasDiscount ? 'bold' : 'normal' }}>
                              ₹{effectivePrice.toFixed(2)}
                              {item.product.unit ? ` / ${item.product.unit}` : ''}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}
                        secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily, component: 'div' }}
                      />
                      <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: hasDiscount ? 'error.main' : 'text.primary' }}>
                        ₹{(item.quantity * effectivePrice).toFixed(2)}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>

          {/* Delivery Time Slot */}
          {deliveryTimeSlot && (
            <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <CardHeader
                avatar={<ScheduleIcon sx={{ color: theme.palette.primary.main }} />}
                title={<Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Delivery Time Slot</Typography>}
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                    {deliveryTimeSlot === 'morning' && '🌅 Morning (8AM - 12PM)'}
                    {deliveryTimeSlot === 'afternoon' && '☀️ Afternoon (12PM - 5PM)'}
                    {deliveryTimeSlot === 'evening' && '🌆 Evening (5PM - 8PM)'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {orderNotes && (
            <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <CardHeader
                avatar={<NoteIcon sx={{ color: theme.palette.primary.main }} />}
                title={<Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Notes</Typography>}
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily, fontStyle: 'italic' }}>
                    "{orderNotes}"
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Side: Payment & Order Total */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Order Summary */}
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              position: 'sticky', 
              top: theme.spacing(10),
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <CardHeader
              avatar={<PaymentsIcon sx={{ color: theme.palette.primary.main }} />}
              title={<Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Summary</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Subtotal:
                  </Typography>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                    ₹{subtotal.toFixed(2)}
                  </Typography>
                </Stack>
                {deliveryCharge > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Delivery Charge:
                    </Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                      ₹{deliveryCharge.toFixed(2)}
                    </Typography>
                  </Stack>
                )}
                {harvestCoinsDiscount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Harvest Coins Discount:
                    </Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main' }}>
                      -₹{harvestCoinsDiscount.toFixed(2)}
                    </Typography>
                  </Stack>
                )}
                {appliedCoupon && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      Coupon ({appliedCoupon.code}):
                    </Typography>
                    <Typography sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main' }}>
                      -₹{appliedCoupon.discountAmount.toFixed(2)}
                    </Typography>
                  </Stack>
                )}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
                    ₹{total.toFixed(2)}
                  </Typography>
                </Stack>
                {totalSavings > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main', fontWeight: 'bold' }}>
                      You saved ₹{totalSavings.toFixed(2)} on this order!
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Payment Methods */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
                  Payment Method
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        bgcolor: paymentMethod === 'COD' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        border: paymentMethod === 'COD' ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.12)'
                      }}
                    >
                      <Radio value="COD" id="cod-radio" />
                      <label htmlFor="cod-radio" style={{ flexGrow: 1, cursor: 'pointer' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main }} />
                          <Box>
                            <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                              Cash on Delivery (COD)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              Pay when your order is delivered
                            </Typography>
                          </Box>
                        </Stack>
                      </label>
                    </Paper>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        opacity: 0.6,
                        bgcolor: 'rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      <Radio value="card" id="card-radio" disabled />
                      <label htmlFor="card-radio" style={{ flexGrow: 1, cursor: 'pointer' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <CreditCardIcon sx={{ color: 'text.disabled' }} />
                          <Box>
                            <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', color: 'text.disabled' }}>
                              Credit/Debit Card
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              Coming soon
                            </Typography>
                          </Box>
                        </Stack>
                      </label>
                    </Paper>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        opacity: 0.6,
                        bgcolor: 'rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      <Radio value="bank" id="bank-radio" disabled />
                      <label htmlFor="bank-radio" style={{ flexGrow: 1, cursor: 'pointer' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <AccountBalanceIcon sx={{ color: 'text.disabled' }} />
                          <Box>
                            <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', color: 'text.disabled' }}>
                              Bank Transfer
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              Coming soon
                            </Typography>
                          </Box>
                        </Stack>
                      </label>
                    </Paper>
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Place Order Button */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddress}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  py: 1.5, 
                  borderRadius: '50px', 
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                  }
                }}
              >
                {isPlacingOrder ? <Loader size="small" sx={{ color: 'white' }} /> : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add New Address Dialog */}
      <Dialog open={showAddressForm} onClose={handleAddressFormClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>
          Add New Address
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={newAddress.fullName}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="street"
                value={newAddress.street}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={newAddress.city}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={newAddress.state}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={newAddress.zipCode}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={newAddress.country}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={newAddress.phone}
                onChange={handleAddressFormChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiInputLabel-root': { fontFamily: theme.typography.fontFamily } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleAddressFormClose} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveNewAddress}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Save Address
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={orderSuccessDialogOpen} onClose={() => navigate('/')} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontFamily: theme.typography.fontFamily, pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
            Order Placed Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', fontFamily: theme.typography.fontFamily, pb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
            Thank you for your order!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1, fontFamily: theme.typography.fontFamily }}>
            Your order #{placedOrderId?.toString().slice(-6)} has been placed successfully.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
            You will receive a confirmation email shortly.
          </Typography>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'success.main', fontWeight: 'bold' }}>
              <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              You earned {Math.floor(total * 0.03)} Harvest Coins on this purchase!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/order/${placedOrderId}`}
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              borderRadius: '50px', 
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            View Order Details
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              borderRadius: '50px', 
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentPage;