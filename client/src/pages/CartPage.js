import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

const CartPage = () => {
  const theme = useTheme();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await productService.getCart();
        setCart(data);
      } catch (err) {
        setError('Failed to load cart.');
        showSnackbar('Failed to load cart.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
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
    return cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2);
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await productService.updateCartItemQuantity(productId, quantity);
      const data = await productService.getCart();
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
      setCart(data);
      showSnackbar('Cart cleared successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to clear cart.', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center" sx={{ mb: 4, fontFamily: theme.typography.fontFamily }}>
          Your Shopping Cart
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 4, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{error}</Typography>
        ) : !cart || cart.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4, p: 3 }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
              Your cart is empty. Go ahead and add some delicious products!
            </Typography>
            <Button component={Link} to="/CropCorner" variant="contained" size="large" sx={{ mt: 3, fontFamily: theme.typography.fontFamily }}>
              Start Shopping
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
            <Grid width={650} item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Items in your cart ({cart.items.length})</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCart}
                  sx={{ ml: 2, fontFamily: theme.typography.fontFamily }}
                >
                  Clear Cart
                </Button>
              </Box>
              <List sx={{ width: '100%' }}>
                {cart.items.map((item) => (
                  <Card key={item.product._id} sx={{ display: 'flex', mb: 2, boxShadow: 3, borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '8px 0 0 8px' }}
                      image={item.product.image || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={item.product.name}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                        <Typography component="div" variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mt: 1, fontFamily: theme.typography.fontFamily }}>
                          ${item.product.price.toFixed(2)} each
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity === 1}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          color="error"
                          size="medium"
                          onClick={() => handleRemoveItem(item.product._id)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Box>
                  </Card>
                ))}
              </List>
            </Grid>
            {/* Faint vertical line */}
            <Grid item sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch' }}>
              <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
            </Grid>
            <Grid  width={300}item xs={12} md={4} height={'100%'}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: theme.spacing(10), display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {cart.items.map((item) => (
                      <ListItem key={item.product._id} disablePadding>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{item.product.name} x {item.quantity}</Typography>}
                          secondary={<Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>${(item.product.price * item.quantity).toFixed(2)}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box sx={{ flexShrink: 0, mt: 2, borderTop: '1px solid', borderColor: theme.palette.divider, pt: 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
                    Billing Info
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal:</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                      ${calculateTotal()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>Shipping:</Typography>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>Free</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>Total:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                      ${calculateTotal()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Box sx={{ paddingLeft: { xs: '100px', md: '795px' }, alignSelf: 'flex-end', pr: { xs: 2, md: 4 }, pb: { xs: 2, md: 4 } }}>
                <Button variant="contained" color="primary" size="large" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Proceed to Checkout
                </Button>
              </Box>
          </Grid>
        )}
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CartPage;
