import React, { useState, useEffect } from 'react';
import { alpha,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  Stack,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Container,
  Paper,
  Grid,
  CardMedia,
  Snackbar,
  Alert,
  useTheme,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  CardActions,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import addressService from '../services/addressService'; // New: Import address service
import orderService from '../services/orderService';     // New: Import order service
import couponService from '../services/couponService';   // New: Import coupon service
import AddressForm from '../components/AddressForm';     // New: Import AddressForm component
import { useAuth } from '../contexts/AuthContext';       // New: Import useAuth

const CartPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [addresses, setAddresses] = useState([]); // New: State for user addresses
  const [selectedAddress, setSelectedAddress] = useState(null); // New: State for selected address
  const [showAddressForm, setShowAddressForm] = useState(false); // New: State to toggle address form
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // New: State for order placement loading
  const [orderSuccessDialogOpen, setOrderSuccessDialogOpen] = useState(false); // New: State for order success dialog
  const [placedOrderId, setPlacedOrderId] = useState(null); // New: State to store placed order ID
  const [couponCode, setCouponCode] = useState(''); // New: State for coupon input
  const [appliedCoupon, setAppliedCoupon] = useState(null); // New: State for applied coupon details
  const [couponError, setCouponError] = useState(''); // New: State for coupon errors
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false); // New: State for coupon apply loading
  const { user } = useAuth(); // New: Get user for prefill

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cartData = await productService.getCart();
        setCart(cartData);

        const userAddresses = await addressService.getAddresses();
        setAddresses(userAddresses);
        // Set default address if available
        const defaultAddress = userAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0]); // Select the first address if no default
        }

      } catch (err) {
        setError('Failed to load cart or addresses.');
        showSnackbar('Failed to load cart or addresses.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    if (appliedCoupon) {
        return (subtotal - appliedCoupon.discountAmount).toFixed(2);
    }
    return subtotal.toFixed(2);
  };

  const calculateSubtotal = () => cart ? cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0) : 0;

  const handleUpdateQuantity = async (productId, quantity) => {
    const item = cart.items.find(i => i.product._id === productId);
    if (item && quantity > item.product.countInStock) {
      showSnackbar(`Only ${item.product.countInStock} of ${item.product.name} available.`, 'warning');
      return;
    }

    try {
      await productService.updateCartItemQuantity(productId, quantity);
      const data = await productService.getCart();
      setAppliedCoupon(null); // Reset coupon on cart change
      setCart(data);
      showSnackbar('Cart updated successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to update quantity.', 'error');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await productService.removeCartItem(productId);
      const data = await productService.getCart();
      setAppliedCoupon(null); // Reset coupon on cart change
      setCart(data);
      showSnackbar('Item removed from cart.', 'info');
    } catch (err) {
      showSnackbar('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await productService.clearCart();
      const data = await productService.getCart();
      setAppliedCoupon(null); // Reset coupon on cart change
      setCart(data);
      showSnackbar('Cart cleared successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to clear cart.', 'error');
    }
  };
  // New: Handle address selection
  const handleAddressChange = (event) => {
    const addressId = event.target.value;
    const address = addresses.find(addr => addr._id === addressId);
    setSelectedAddress(address);
  };

  // New: Handle adding a new address
  const handleAddAddress = async (newAddressData) => {
    try {
      const addedAddress = await addressService.addAddress(newAddressData);
      setAddresses([...addresses, addedAddress]);
      setSelectedAddress(addedAddress); // Select the newly added address
      setShowAddressForm(false);
      showSnackbar('Address added successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to add address.', 'error');
    }
  };

  // New: Handle applying a coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
        setCouponError('Please enter a coupon code.');
        return;
    }
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
        const subtotal = calculateSubtotal();
        const data = await couponService.validateCoupon(couponCode, subtotal);
        setAppliedCoupon(data);
        showSnackbar('Coupon applied successfully!', 'success');
    } catch (err) {
        setCouponError(err.response?.data?.message || 'Failed to apply coupon.');
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  // New: Handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showSnackbar('Please select a shipping address.', 'warning');
      return;
    }
    if (!cart || cart.items.length === 0) {
      showSnackbar('Your cart is empty.', 'warning');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // The backend should fetch price/name/image from the DB using the product ID
      // to prevent price tampering on the client. We only need to send ID and quantity.
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        qty: item.quantity,
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        },
        // Pass coupon code only if it has been successfully applied
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const createdOrder = await orderService.createOrder(orderData);

      // Show success dialog and clear cart
      setPlacedOrderId(createdOrder._id);
      setOrderSuccessDialogOpen(true);
      await productService.clearCart();
      setCart(null);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to place order.', 'error');
      console.error('Order placement error:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Box sx={{ p: { xs: 0, sm: 2, md: 4 } }}>
       <Typography variant="h3" component="h1" fontWeight={800} gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily }}>
          Your Shopping Cart
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 4, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{error}</Typography>
        ) : !cart || cart.items.length === 0 ? (
          <Paper sx={{ textAlign: 'center', my: 4, p: { xs: 3, sm: 6 }, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
              Your cart is empty. Go ahead and add some delicious products!
            </Typography>
            <Button component={RouterLink} to="/CropCorner" variant="contained" size="large" sx={{ mt: 3, fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 4 }}>
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Items in your cart ({cart.items.length})</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCart}
                  sx={{ ml: 2, fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
                >
                  Clear Cart
                </Button>
              </Box>
              <List sx={{ width: '100%' }}>
                {cart.items.map((item) => (
                  <Paper key={item.product._id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, borderRadius: 3, position: 'relative' }}>
                    <CardMedia component="img" sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mr: 2 }}
                      image={item.product.image || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={item.product.name} />
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
                        <Typography component={RouterLink} to={`/product/${item.product._id}`} variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                          ${item.product.price.toFixed(2)} each
                        </Typography>
                        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: '50px' }}>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity === 1}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} disabled={item.quantity >= item.product.countInStock}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                          </Box>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                    </Box>
                    <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.product._id)} aria-label="delete" sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: theme.spacing(10), display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping Address</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {showAddressForm ? (
                        <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} />
                      ) : (
                        <>
                          {addresses.length > 0 ? (
                            <FormControl component="fieldset" fullWidth>
                              <RadioGroup value={selectedAddress?._id || ''} onChange={handleAddressChange}>
                                {addresses.map((addr) => (
                                  <Paper key={addr._id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', bgcolor: selectedAddress?._id === addr._id ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}>
                                    <Radio value={addr._id} />
                                    <Box>
                                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{addr.street}, {addr.city}</Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{addr.state}, {addr.zipCode}, {addr.country}</Typography>
                                      {addr.label && <Chip label={addr.label} size="small" sx={{ mt: 0.5 }} />}
                                    </Box>
                                  </Paper>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>No saved addresses. Please add one.</Typography>
                          )}
                          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddressForm(true)} sx={{ mt: 1, fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
                            Add New Address
                          </Button>
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Apply Coupon</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          label="Coupon Code" variant="outlined" size="small" fullWidth value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)} error={!!couponError} helperText={couponError}
                          disabled={isApplyingCoupon} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                        />
                        <Button variant="contained" onClick={handleApplyCoupon} disabled={isApplyingCoupon} sx={{ height: '40px', fontFamily: theme.typography.fontFamily }}>
                          {isApplyingCoupon ? <CircularProgress size={24} /> : 'Apply'}
                        </Button>
                      </Box>
                      {appliedCoupon && <Alert severity="success" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Coupon "{appliedCoupon.code}" applied! You saved ${appliedCoupon.discountAmount.toFixed(2)}.</Alert>}
                    </AccordionDetails>
                  </Accordion>
                </Box>
                <Box sx={{ flexShrink: 0, mt: 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Order Summary</Typography>
                  <Stack spacing={1.5} sx={{ my: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal</Typography>
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                      ${calculateSubtotal().toFixed(2)}
                      </Typography>
                    </Stack>
                    {appliedCoupon && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>Discount ({appliedCoupon.code})</Typography>
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                        -${appliedCoupon.discountAmount.toFixed(2)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping:</Typography>
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>Free</Typography>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Total:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                      ${calculateTotal()}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !selectedAddress || cart.items.length === 0}
                    sx={{ fontFamily: theme.typography.fontFamily, mt: 2, py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}
                  >
                    {isPlacingOrder ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
      <Dialog
        open={orderSuccessDialogOpen}
        onClose={() => setOrderSuccessDialogOpen(false)}
        aria-labelledby="order-success-dialog-title"
        aria-describedby="order-success-dialog-description"
      >
        <DialogTitle id="order-success-dialog-title" sx={{ textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" sx={{ fontFamily: theme.typography.fontFamily }}>Order Placed Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography id="order-success-dialog-description" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
            Your order has been placed successfully. Thank you for your purchase!
          </Typography>
          <Typography>
            You can view your order details by clicking the button below.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOrderSuccessDialogOpen(false);
              if (placedOrderId) {
                navigate(`/order/${placedOrderId}`);
              }
            }}
            autoFocus
            variant="contained"
            color="secondary"
          >
            View Order Details
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};


export default CartPage;
