import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { alpha,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  Stack,
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
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NoteIcon from '@mui/icons-material/Note';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import addressService from '../services/addressService'; // New: Import address service
import couponService from '../services/couponService';   // New: Import coupon service
import AddressForm from '../components/AddressForm';     // New: Import AddressForm component
import api from '../config/axios';

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
  const [couponCode, setCouponCode] = useState(''); // New: State for coupon input
  const [appliedCoupon, setAppliedCoupon] = useState(null); // New: State for applied coupon details
  const [couponError, setCouponError] = useState(''); // New: State for coupon errors
  const [itemLoading, setItemLoading] = useState(null); // For save/move/remove actions
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false); // New: State for coupon apply loading
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(''); // Delivery time slot
  const [orderNotes, setOrderNotes] = useState(''); // Special instructions

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

  const validItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter(item => item.product);
  }, [cart]);

  const savedForLaterItems = useMemo(() => {
    if (!cart?.savedForLater) return [];
    return cart.savedForLater.filter(item => item.product);
  }, [cart]);

  const showSnackbar = useCallback((message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  useEffect(() => {
    // This effect runs when the cart changes and checks if any items were filtered out.
    if (cart && validItems.length < cart.items.length) {
      showSnackbar('Some items in your cart were unavailable and have been removed.', 'warning');
    }
  }, [cart, validItems, showSnackbar]);
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    const subtotal = validItems.reduce((acc, item) => {
      const effectivePrice = item.product.salePrice || item.product.price;
      return acc + effectivePrice * item.quantity;
    }, 0);
    if (appliedCoupon) {
        return (subtotal - appliedCoupon.discountAmount).toFixed(2);
    }
    return subtotal.toFixed(2);
  };

  const calculateSubtotal = () => cart ? validItems.reduce((acc, item) => {
    const effectivePrice = item.product.salePrice || item.product.price;
    return acc + effectivePrice * item.quantity;
  }, 0) : 0;

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

  const handleSaveForLater = async (productId) => {
    setItemLoading(productId);
    try {
      const { data } = await api.post(`/cart/save-for-later/${productId}`);
      setCart(data);
      showSnackbar('Item saved for later!', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save item.', 'error');
    } finally {
      setItemLoading(null);
    }
  };

  const handleMoveToCart = async (productId) => {
    setItemLoading(productId);
    try {
      const { data } = await api.post(`/cart/move-to-cart/${productId}`);
      setCart(data);
      showSnackbar('Item moved to cart!', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to move item.', 'error');
    } finally {
      setItemLoading(null);
    }
  };

  const handleRemoveFromSaved = async (productId) => {
    setItemLoading(productId);
    try {
      const { data } = await api.delete(`/cart/saved-for-later/${productId}`);
      setCart(data);
      showSnackbar('Item removed from saved list.', 'info');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to remove item.', 'error');
    } finally {
      setItemLoading(null);
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
  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      showSnackbar('Please select a shipping address.', 'warning');
      return;
    }
    if (!cart || cart.items.length === 0) {
      showSnackbar('Your cart is empty.', 'warning');
      return;
    }
    navigate('/payment', {
      state: { 
        shippingAddress: selectedAddress, 
        appliedCoupon: appliedCoupon,
        deliveryTimeSlot: deliveryTimeSlot,
        orderNotes: orderNotes 
      },
    });
  };

  const hasItems = validItems.length > 0;
  const hasSavedItems = savedForLaterItems.length > 0;
  const isEmpty = !hasItems && !hasSavedItems;

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
        ) : isEmpty ? (
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
              {hasItems && <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Items in your cart ({validItems.length})</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCart}
                  sx={{ ml: 2, fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
                >
                  Clear Cart
                </Button>
              </Box>}
              {hasItems && <List sx={{ width: '100%' }}>
                {validItems.map((item) => {
                  const effectivePrice = item.product.salePrice || item.product.price;
                  const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
                  
                  return (
                  <Paper key={item.product?._id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, borderRadius: 3, position: 'relative' }}>
                    <CardMedia component="img" sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mr: 2 }}
                      image={item.product.image ? `${process.env.REACT_APP_API_URL}${item.product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`}
                      alt={item.product.name} />
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
                        <Typography component={RouterLink} to={`/product/${item.product._id}`} variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                          {item.product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {hasDiscount && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                              ${item.product.price.toFixed(2)}
                            </Typography>
                          )}
                          <Typography variant="body2" color={hasDiscount ? 'error' : 'text.secondary'} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: hasDiscount ? 'bold' : 'normal' }}>
                            ${effectivePrice.toFixed(2)}{item.product.unit ? ` / ${item.product.unit}` : ''}
                          </Typography>
                        </Box>
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
                          <Button
                            size="small" startIcon={itemLoading === item.product._id ? <CircularProgress size={16} /> : <SaveIcon />}
                            onClick={() => handleSaveForLater(item.product._id)}
                            disabled={!!itemLoading}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                          >
                            Save for later
                          </Button>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: hasDiscount ? 'error.main' : 'text.primary' }}>
                            ${(effectivePrice * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                    </Box>
                    <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.product._id)} aria-label="delete" sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                )})}
              </List>}

              {hasSavedItems && (
                <Box mt={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>Saved for Later ({savedForLaterItems.length})</Typography>
                  <List sx={{ width: '100%' }}>
                    {savedForLaterItems.map((item) => (
                      <Paper key={item.product?._id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, borderRadius: 3, position: 'relative', bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                        <CardMedia component="img" sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 2, mr: 2 }}
                          image={item.product.image ? `${process.env.REACT_APP_API_URL}${item.product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`}
                          alt={item.product.name} />
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
                          <Typography component={RouterLink} to={`/product/${item.product._id}`} variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                            Saved Quantity: {item.quantity}
                          </Typography>
                          <Box sx={{ mt: 'auto' }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<MoveToInboxIcon />}
                              onClick={() => handleMoveToCart(item.product._id)}
                              sx={{ textTransform: 'none', borderRadius: '50px', mr: 1 }}
                            >
                              Move to Cart
                            </Button>
                            <Button size="small" onClick={() => handleRemoveFromSaved(item.product._id)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Remove</Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Box>
              )}
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
                                      <Radio value={addr._id} sx={{ '& .MuiSvgIcon-root': { fontFamily: theme.typography.fontFamily } }} />
                                    <Box>
                                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>{addr.street}, {addr.city}</Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{addr.state}, {addr.zipCode}, {addr.country}</Typography>
                                      {addr.phone && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>Phone: {addr.phone}</Typography>}
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
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ScheduleIcon />
                        <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Delivery Time Slot</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Select Time Slot</InputLabel>
                        <Select
                          value={deliveryTimeSlot}
                          label="Select Time Slot"
                          onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                          sx={{ fontFamily: theme.typography.fontFamily }}
                        >
                          <MenuItem value="" sx={{ fontFamily: theme.typography.fontFamily }}>
                            <em>No Preference</em>
                          </MenuItem>
                          <MenuItem value="morning" sx={{ fontFamily: theme.typography.fontFamily }}>Morning (8AM - 12PM)</MenuItem>
                          <MenuItem value="afternoon" sx={{ fontFamily: theme.typography.fontFamily }}>Afternoon (12PM - 5PM)</MenuItem>
                          <MenuItem value="evening" sx={{ fontFamily: theme.typography.fontFamily }}>Evening (5PM - 8PM)</MenuItem>
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <NoteIcon />
                        <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily }}>Order Notes</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        label="Special Instructions (Optional)"
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="E.g., Please ring the doorbell, leave at the front door, etc."
                        InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                        inputProps={{ maxLength: 200 }}
                        helperText={`${orderNotes.length}/200 characters`}
                      />
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
                    onClick={handleProceedToPayment}
                    disabled={!selectedAddress || validItems.length === 0}
                    sx={{ fontFamily: theme.typography.fontFamily, mt: 2, py: 1.5, borderRadius: '50px', fontWeight: 'bold' }}
                  >
                    Proceed to Payment
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};


export default CartPage;
