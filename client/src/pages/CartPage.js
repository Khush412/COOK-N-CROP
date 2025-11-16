import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  Stack,
  Chip,
  Divider,
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
  Card,
  CardContent,
  InputLabel,
  alpha,
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import productService from '../services/productService';
import couponService from '../services/couponService';
import { redeemHarvestCoins } from '../services/loyaltyService';
import HarvestCoinsRedeem from '../components/HarvestCoinsRedeem';
import api from '../config/axios';
import Loader from '../custom_components/Loader';

const CartPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation(); // Add this to get location state
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [itemLoading, setItemLoading] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [harvestCoinsDiscount, setHarvestCoinsDiscount] = useState(0);
  const [harvestCoinsUsed, setHarvestCoinsUsed] = useState(0);
  const [reservedHarvestCoins, setReservedHarvestCoins] = useState(0);
  const [reservedHarvestCoinsDiscount, setReservedHarvestCoinsDiscount] = useState(0);
  
  // Refs to preserve coupon and Harvest Coins across cart updates
  const couponCodeRef = useRef(couponCode);
  const appliedCouponRef = useRef(appliedCoupon);
  const harvestCoinsDiscountRef = useRef(harvestCoinsDiscount);
  const reservedHarvestCoinsRef = useRef(reservedHarvestCoins);
  const reservedHarvestCoinsDiscountRef = useRef(reservedHarvestCoinsDiscount);
  
  // Update refs when state changes
  useEffect(() => {
    couponCodeRef.current = couponCode;
  }, [couponCode]);
  
  useEffect(() => {
    appliedCouponRef.current = appliedCoupon;
  }, [appliedCoupon]);
  
  useEffect(() => {
    harvestCoinsDiscountRef.current = harvestCoinsDiscount;
  }, [harvestCoinsDiscount]);
  
  useEffect(() => {
    reservedHarvestCoinsRef.current = reservedHarvestCoins;
  }, [reservedHarvestCoins]);
  
  useEffect(() => {
    reservedHarvestCoinsDiscountRef.current = reservedHarvestCoinsDiscount;
  }, [reservedHarvestCoinsDiscount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cartData = await productService.getCart();
        // Preserve coupon and Harvest Coins when updating cart
        if (couponCodeRef.current) {
          setCouponCode(couponCodeRef.current);
        }
        if (appliedCouponRef.current) {
          setAppliedCoupon(appliedCouponRef.current);
        }
        if (harvestCoinsDiscountRef.current) {
          setHarvestCoinsDiscount(harvestCoinsDiscountRef.current);
        }
        if (reservedHarvestCoinsRef.current) {
          setReservedHarvestCoins(reservedHarvestCoinsRef.current);
        }
        if (reservedHarvestCoinsDiscountRef.current) {
          setReservedHarvestCoinsDiscount(reservedHarvestCoinsDiscountRef.current);
        }
        setCart(cartData);
      } catch (err) {
        setError('Failed to load cart.');
        showSnackbar('Failed to load cart.', 'error');
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

  // Function to update cart while preserving coupon and Harvest Coins
  const updateCartWithPreservation = async () => {
    try {
      const cartData = await productService.getCart();
      // Preserve coupon and Harvest Coins when updating cart
      if (couponCodeRef.current) {
        setCouponCode(couponCodeRef.current);
      }
      if (appliedCouponRef.current) {
        setAppliedCoupon(appliedCouponRef.current);
      }
      if (harvestCoinsDiscountRef.current) {
        setHarvestCoinsDiscount(harvestCoinsDiscountRef.current);
      }
      if (reservedHarvestCoinsRef.current) {
        setReservedHarvestCoins(reservedHarvestCoinsRef.current);
      }
      if (reservedHarvestCoinsDiscountRef.current) {
        setReservedHarvestCoinsDiscount(reservedHarvestCoinsDiscountRef.current);
      }
      setCart(cartData);
      return cartData;
    } catch (err) {
      setError('Failed to update cart.');
      showSnackbar('Failed to update cart.', 'error');
      throw err;
    }
  };

  const showSnackbar = useCallback((message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  useEffect(() => {
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
    
    const deliveryCharge = subtotal < 200 ? 40 : 0;
    const afterHarvestCoins = subtotal + deliveryCharge - harvestCoinsDiscount;
    
    if (appliedCoupon) {
        return (afterHarvestCoins - appliedCoupon.discountAmount).toFixed(2);
    }
    
    return afterHarvestCoins.toFixed(2);
  };

  const calculateSubtotal = () => cart ? validItems.reduce((acc, item) => {
    const effectivePrice = item.product.salePrice || item.product.price;
    return acc + effectivePrice * item.quantity;
  }, 0) : 0;
  
  const calculateDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    return subtotal < 200 ? 40 : 0;
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    const item = cart.items.find(i => i.product._id === productId);
    if (item && quantity > item.product.countInStock) {
      showSnackbar(`Only ${item.product.countInStock} of ${item.product.name} available.`, 'warning');
      return;
    }

    try {
      await productService.updateCartItemQuantity(productId, quantity);
      // Update cart while preserving coupon and Harvest Coins
      await updateCartWithPreservation();
      showSnackbar('Cart updated successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to update quantity.', 'error');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await productService.removeCartItem(productId);
      // Update cart while preserving coupon and Harvest Coins
      await updateCartWithPreservation();
      showSnackbar('Item removed from cart.', 'info');
    } catch (err) {
      showSnackbar('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      // Reset Harvest Coins reservation
      setReservedHarvestCoins(0);
      setReservedHarvestCoinsDiscount(0);
      setHarvestCoinsDiscount(0);
      setHarvestCoinsUsed(0);
      // Reset refs
      reservedHarvestCoinsRef.current = 0;
      reservedHarvestCoinsDiscountRef.current = 0;
      harvestCoinsDiscountRef.current = 0;
      
      // Reset coupon
      if (appliedCoupon) {
        setAppliedCoupon(null);
        appliedCouponRef.current = null; // Update ref
      }
      if (couponCode) {
        setCouponCode('');
        couponCodeRef.current = ''; // Update ref
      }
      
      await productService.clearCart();
      const data = await productService.getCart();
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
        appliedCouponRef.current = data; // Update ref
        showSnackbar('Coupon applied successfully!', 'success');
    } catch (err) {
        setCouponError(err.response?.data?.message || 'Failed to apply coupon.');
        appliedCouponRef.current = null; // Update ref
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!cart || cart.items.length === 0) {
      showSnackbar('Your cart is empty.', 'warning');
      return;
    }
    
    // If Harvest Coins are reserved, we need to actually redeem them
    if (reservedHarvestCoins > 0) {
      try {
        await redeemHarvestCoins(reservedHarvestCoins, calculateSubtotal());
        showSnackbar(`Successfully redeemed ${reservedHarvestCoins} Harvest Coins!`, 'success');
      } catch (err) {
        showSnackbar('Failed to redeem Harvest Coins: ' + err.message, 'error');
        return; // Don't proceed with payment if coins can't be redeemed
      }
    }
    
    navigate('/payment', {
      state: { 
        appliedCoupon: appliedCoupon,
        deliveryTimeSlot: deliveryTimeSlot,
        orderNotes: orderNotes,
        harvestCoinsDiscount: reservedHarvestCoinsDiscount,
        harvestCoinsUsed: reservedHarvestCoins,
        deliveryCharge: calculateDeliveryCharge()
      },
    });
  };

  const handleHarvestCoinsApply = (discountValue, coinsUsed) => {
    setReservedHarvestCoins(coinsUsed);
    setReservedHarvestCoinsDiscount(discountValue);
    // Update the state variables that are used in calculations
    setHarvestCoinsDiscount(discountValue);
    setHarvestCoinsUsed(coinsUsed);
    // Update refs
    reservedHarvestCoinsRef.current = coinsUsed;
    reservedHarvestCoinsDiscountRef.current = discountValue;
    harvestCoinsDiscountRef.current = discountValue;
    showSnackbar(`Reserved ${coinsUsed} Harvest Coins for ₹${discountValue} discount!`, 'success');
  };

  // Check for applied coupon from OffersPage
  useEffect(() => {
    if (location.state && location.state.appliedCoupon) {
      const couponFromOffers = location.state.appliedCoupon;
      setCouponCode(couponFromOffers);
      // Auto-apply the coupon immediately with a small delay to ensure UI updates
      setTimeout(() => {
        handleApplyCouponAuto(couponFromOffers);
      }, 100);
    }
  }, [location.state]);

  const handleApplyCouponAuto = async (code) => {
    if (!code || !code.trim()) {
      // Don't show error for auto-applied coupons from Offers page
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const subtotal = calculateSubtotal();
      const data = await couponService.validateCoupon(code, subtotal);
      setAppliedCoupon(data);
      appliedCouponRef.current = data; // Update ref
      // Don't show success message for auto-applied coupons to avoid confusion
    } catch (err) {
      // Don't show error for auto-applied coupons from Offers page, just silently fail
      setAppliedCoupon(null);
      appliedCouponRef.current = null; // Update ref
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const hasItems = validItems.length > 0;
  const hasSavedItems = savedForLaterItems.length > 0;
  const isEmpty = !hasItems && !hasSavedItems;

  // Professional cart design with intuitive layout
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Box sx={{ p: { xs: 0, sm: 1, md: 2 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight={800} 
          gutterBottom 
          sx={{ 
            mb: 3, 
            fontFamily: theme.typography.fontFamily,
            color: theme.palette.text.primary
          }}
        >
          Shopping Cart
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <Loader size="medium" />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 4, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{error}</Typography>
        ) : isEmpty ? (
          <Paper sx={{ textAlign: 'center', my: 4, p: { xs: 2, sm: 6 }, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: theme.palette.grey[400] }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, mt: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Looks like you haven't added anything to your cart yet
            </Typography>
            <Button component={RouterLink} to="/CropCorner" variant="contained" size="large" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: { xs: 3, sm: 4 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Cart Items */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  mb: 3
                }}
              >
                <Box 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: 'background.default',
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 1, sm: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      Cart ({validItems.length} items)
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearCart}
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        borderRadius: '50px',
                        textTransform: 'none',
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 0.75 },
                        minWidth: { xs: 'auto', sm: 'auto' }
                      }}
                    >
                      Clear All
                    </Button>
                  </Stack>
                </Box>
                
                <List sx={{ width: '100%', p: 0 }}>
                  {validItems.map((item) => {
                    const effectivePrice = item.product.salePrice || item.product.price;
                    const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
                    
                    return (
                      <Box 
                        key={item.product?._id} 
                        sx={{ 
                          p: 2.5, 
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <CardMedia 
                            component="img" 
                            sx={{ 
                              width: { xs: '100%', md: 120 }, 
                              height: { xs: 140, md: 120 }, 
                              objectFit: 'cover', 
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                            }}
                            image={item.product.images && item.product.images.length > 0 ? 
                              `${process.env.REACT_APP_API_URL}${item.product.images[0]}` : 
                              `${process.env.PUBLIC_URL}/images/placeholder.png`}
                            alt={item.product.name} 
                          />
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                              <Box sx={{ mb: { xs: 1.5, sm: 0 } }}>
                                <Typography 
                                  component={RouterLink} 
                                  to={`/product/${item.product._id}`} 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    fontFamily: theme.typography.fontFamily, 
                                    textDecoration: 'none', 
                                    color: 'text.primary', 
                                    '&:hover': { color: 'primary.main' },
                                    mb: 0.5,
                                    fontSize: { xs: '0.95rem', sm: '1rem' }
                                  }}
                                >
                                  {item.product.name}
                                </Typography>
                                
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontFamily: theme.typography.fontFamily,
                                    mb: 1,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                  }}
                                >
                                  {item.product.category}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {hasDiscount && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        textDecoration: 'line-through', 
                                        color: 'text.secondary', 
                                        fontFamily: theme.typography.fontFamily 
                                      }}
                                    >
                                      ₹{item.product.price.toFixed(2)}
                                    </Typography>
                                  )}
                                  <Typography 
                                    variant="h6" 
                                    color={hasDiscount ? 'error' : 'text.primary'} 
                                    sx={{ 
                                      fontFamily: theme.typography.fontFamily, 
                                      fontWeight: hasDiscount ? 700 : 600,
                                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                  >
                                    ₹{effectivePrice.toFixed(2)}
                                  </Typography>
                                  {item.product.unit && (
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ 
                                        fontFamily: theme.typography.fontFamily 
                                      }}
                                    >
                                      / {item.product.unit}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontFamily: theme.typography.fontFamily,
                                  fontWeight: 700,
                                  alignSelf: { xs: 'flex-start', sm: 'flex-end' },
                                  mb: { xs: 1.5, sm: 0 },
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                              >
                                ₹{(effectivePrice * item.quantity).toFixed(2)}
                              </Typography>
                            </Stack>
                            
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mt: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: '50px', bgcolor: 'background.paper' }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} 
                                    disabled={item.quantity === 1}
                                    sx={{ 
                                      width: { xs: 40, sm: 36 }, 
                                      height: { xs: 40, sm: 36 },
                                      '&:disabled': {
                                        color: alpha(theme.palette.text.disabled, 0.5)
                                      }
                                    }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography 
                                    sx={{ 
                                      mx: 2, 
                                      minWidth: 20, 
                                      textAlign: 'center', 
                                      fontFamily: theme.typography.fontFamily,
                                      fontWeight: 600,
                                      fontSize: { xs: '1.2rem', sm: '1.1rem' }
                                    }}
                                  >
                                    {item.quantity}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} 
                                    disabled={item.quantity >= item.product.countInStock}
                                    sx={{ 
                                      width: { xs: 40, sm: 36 }, 
                                      height: { xs: 40, sm: 36 },
                                      '&:disabled': {
                                        color: alpha(theme.palette.text.disabled, 0.5)
                                      }
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                
                                {item.product.countInStock <= 5 && item.product.countInStock > 0 && (
                                  <Chip 
                                    label={`Only ${item.product.countInStock} left`} 
                                    size="small" 
                                    color="warning" 
                                    variant="outlined"
                                    sx={{ 
                                      fontFamily: theme.typography.fontFamily,
                                      borderColor: alpha(theme.palette.warning.main, 0.3),
                                      height: 24
                                    }} 
                                  />
                                )}
                              </Box>
                              
                              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.5, sm: 0 } }}>
                                <Button
                                  size="small" 
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSaveForLater(item.product._id)}
                                  disabled={!!itemLoading}
                                  sx={{ 
                                    textTransform: 'none', 
                                    color: 'text.secondary',
                                    borderRadius: '50px',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    px: { xs: 1.5, sm: 2 },
                                    py: { xs: 1, sm: 0.7 },
                                    minHeight: { xs: 40, sm: 36 },
                                    fontSize: { xs: '0.9rem', sm: '0.85rem' }
                                  }}
                                >
                                  Save for later
                                </Button>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRemoveItem(item.product._id)} 
                                  sx={{ 
                                    color: 'text.secondary',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    borderRadius: '50px',
                                    width: { xs: 40, sm: 36 },
                                    height: { xs: 40, sm: 36 },
                                    '&:hover': {
                                      color: 'error.main',
                                      bgcolor: alpha(theme.palette.error.main, 0.1)
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </List>
              </Paper>
              
              {/* Saved for Later Section */}
              {hasSavedItems && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: 'background.default',
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      Saved for Later ({savedForLaterItems.length})
                    </Typography>
                  </Box>
                  
                  <List sx={{ width: '100%', p: 0 }}>
                    {savedForLaterItems.map((item) => (
                      <Box 
                        key={item.product?._id} 
                        sx={{ 
                          p: 2.5, 
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          '&:last-child': {
                            borderBottom: 'none'
                          },
                          bgcolor: alpha(theme.palette.action.hover, 0.3)
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <CardMedia 
                            component="img" 
                            sx={{ 
                              width: { xs: '100%', md: 100 }, 
                              height: { xs: 120, md: 100 }, 
                              objectFit: 'cover', 
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                            }}
                            image={item.product.images && item.product.images.length > 0 ? 
                              `${process.env.REACT_APP_API_URL}${item.product.images[0]}` : 
                              `${process.env.PUBLIC_URL}/images/placeholder.png`}
                            alt={item.product.name} 
                          />
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                              <Box>
                                <Typography 
                                  component={RouterLink} 
                                  to={`/product/${item.product._id}`} 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    fontFamily: theme.typography.fontFamily, 
                                    textDecoration: 'none', 
                                    color: 'text.primary', 
                                    '&:hover': { color: 'primary.main' },
                                    mb: 0.5
                                  }}
                                >
                                  {item.product.name}
                                </Typography>
                                
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontFamily: theme.typography.fontFamily,
                                    mb: 1
                                  }}
                                >
                                  Saved Quantity: {item.quantity}
                                </Typography>
                                
                                <Typography 
                                  variant="h6" 
                                  color="text.primary" 
                                  sx={{ 
                                    fontFamily: theme.typography.fontFamily, 
                                    fontWeight: 600
                                  }}
                                >
                                  ₹{(item.product.salePrice || item.product.price).toFixed(2)}
                                </Typography>
                              </Box>
                              
                              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.5, sm: 0 }, alignSelf: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<MoveToInboxIcon />}
                                  onClick={() => handleMoveToCart(item.product._id)}
                                  sx={{ 
                                    textTransform: 'none', 
                                    borderRadius: '50px',
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 1, sm: 0.5 },
                                    height: { xs: 36, sm: 30 },
                                    minHeight: { xs: 36, sm: 30 },
                                    boxShadow: 'none',
                                    '&:hover': {
                                      boxShadow: 'none'
                                    },
                                    fontSize: { xs: '0.8rem', sm: '0.75rem' }
                                  }}
                                >
                                  Move to Cart
                                </Button>
                                <Button 
                                  size="small" 
                                  onClick={() => handleRemoveFromSaved(item.product._id)} 
                                  sx={{ 
                                    textTransform: 'none', 
                                    color: 'text.secondary',
                                    borderRadius: '50px',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    px: { xs: 2, sm: 1.5 },
                                    py: { xs: 1, sm: 0.5 },
                                    height: { xs: 36, sm: 30 },
                                    minHeight: { xs: 36, sm: 30 },
                                    fontSize: { xs: '0.8rem', sm: '0.75rem' }
                                  }}
                                >
                                  Remove
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
            
            {/* Right Column - Order Summary */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Coupon Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  p: 2.5,
                  mt: 2
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 2 }}>
                  Apply Coupon
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    error={!!couponError}
                    helperText={couponError}
                    disabled={isApplyingCoupon}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      },
                      mb: { xs: 1, sm: 0 }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleApplyCoupon} 
                    disabled={isApplyingCoupon} 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      borderRadius: 1,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none'
                      },
                      px: 2,
                      minWidth: { xs: '100%', sm: 'auto' },
                      py: { xs: 1.2, sm: 0.75 }
                    }}
                  >
                    {isApplyingCoupon ? <Loader size="small" /> : 'Apply'}
                  </Button>
                </Box>
                <Button 
                  component={RouterLink} 
                  to="/offers"
                  size="small"
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    textTransform: 'none',
                    p: 0,
                    minWidth: 0,
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                >
                  View Special Offers
                </Button>
              </Paper>
              
              {/* Harvest Coins Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  p: 2.5,
                  mt: 2
                }}
              >
                <HarvestCoinsRedeem 
                  cartTotal={calculateSubtotal()} 
                  onDiscountApply={handleHarvestCoinsApply} 
                  reservedCoins={reservedHarvestCoins}
                  reservedDiscount={reservedHarvestCoinsDiscount}
                />
              </Paper>
              
              {/* Order Summary */}
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`, 
                  overflow: 'hidden',
                  mt: 2
                }}
              >
                <Box 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: 'background.default',
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                    Order Summary
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily 
                        }}
                      >
                        Subtotal ({validItems.reduce((acc, item) => acc + item.quantity, 0)} items)
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 500
                        }}
                      >
                        ₹{calculateSubtotal().toFixed(2)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily 
                        }}
                      >
                        Delivery Fee
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 500
                        }}
                      >
                        {calculateDeliveryCharge() > 0 ? `₹${calculateDeliveryCharge().toFixed(2)}` : 'Free'}
                      </Typography>
                    </Stack>
                    
                    {harvestCoinsDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily 
                          }}
                        >
                          Harvest Coins Discount
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontWeight: 500
                          }}
                        >
                          -₹{harvestCoinsDiscount.toFixed(2)}
                        </Typography>
                      </Stack>
                    )}
                    
                    {appliedCoupon && (
                      <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily 
                          }}
                        >
                          Coupon ({appliedCoupon.code})
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontWeight: 500
                          }}
                        >
                          -₹{appliedCoupon.discountAmount.toFixed(2)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 700,
                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                      }}
                    >
                      Total
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                      }}
                    >
                      ₹{calculateTotal()}
                    </Typography>
                  </Stack>
                  
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleProceedToPayment}
                    disabled={validItems.length === 0}
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      py: { xs: 1.2, sm: 1.5 }, 
                      borderRadius: 1,
                      fontWeight: 600,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 5
                      },
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontSize: '0.8rem'
                    }}
                  >
                    By placing your order, you agree to our Terms and Conditions
                  </Typography>
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