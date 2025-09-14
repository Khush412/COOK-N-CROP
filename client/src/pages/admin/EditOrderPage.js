import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper, Typography, Box, Grid, TextField, Autocomplete, Button, IconButton, Container, Stack,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress, Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';

const EditOrderPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [product, setProduct] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const [orderItems, setOrderItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const order = await orderService.getOrderDetails(orderId);
        setUser(order.user);
        const formattedItems = order.orderItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.product._id, // Ensure product is just the ID
        }));
        setOrderItems(formattedItems);
        setShippingAddress(order.shippingAddress);
      } catch (err) {
        setError('Failed to load order data.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleProductSearch = async (event, newValue) => {
    if (newValue.length < 2) return;
    setProductLoading(true);
    try {
      const products = await adminService.searchProductsForAdmin(newValue);
      setProductOptions(products);
    } catch (err) {
      console.error("Failed to search products", err);
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!product) return;
    const existItem = orderItems.find(x => x.product === product._id);
    if (existItem) {
      setOrderItems(orderItems.map(x => x.product === existItem.product ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setOrderItems([...orderItems, {
        product: product._id, name: product.name, image: product.image, price: product.price, qty: 1,
      }]);
    }
    setProduct(null);
    setProductOptions([]);
  };

  const handleRemoveItem = (id) => {
    setOrderItems(orderItems.filter(x => x.product !== id));
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    setError('');
    if (orderItems.length === 0) {
      setError('Orders must have at least one item.');
      return;
    }
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setSaving(true);
    try {
      const orderData = {
        orderItems: orderItems.map(item => ({ product: item.product, qty: item.qty })),
        shippingAddress,
      };
      await adminService.editOrder(orderId, orderData);
      navigate(`/admin/orders`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Button onClick={() => navigate('/admin/orders')} startIcon={<ArrowBackIcon />} sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
          Back to Manage Orders
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
          Edit Order #{orderId.slice(-6)}
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>1. User</Typography>
            {user && <Alert severity="info" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Editing order for: <strong>{user.username}</strong></Alert>}
          </Paper>

          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>2. Add/Edit Products</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <Autocomplete sx={{ flexGrow: 1 }} options={productOptions} getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option._id === value._id} value={product} onChange={(event, newValue) => setProduct(newValue)}
                onInputChange={handleProductSearch} loading={productLoading}
                renderInput={(params) => (
                  <TextField {...params} label="Search for a product to add..." variant="outlined"
                    InputProps={{ ...params.InputProps, endAdornment: (<>{productLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),}}
                  />
                )}
              />
              <Button variant="contained" onClick={handleAddProduct} disabled={!product} sx={{ fontFamily: theme.typography.fontFamily }}>Add</Button>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Order Items</Typography>
            <List>
              {orderItems.map(item => (
                <ListItem key={item.product} secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.product)}><DeleteIcon /></IconButton>}>
                  <ListItemAvatar><Avatar src={item.image} variant="rounded" /></ListItemAvatar>
                  <ListItemText primary={item.name} secondary={`Qty: ${item.qty} - $${(item.price * item.qty).toFixed(2)}`} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>3. Shipping Address</Typography>
            <TextField label="Full Name" name="fullName" value={shippingAddress.fullName || ''} onChange={handleAddressChange} fullWidth margin="normal" />
            <TextField label="Street" name="street" value={shippingAddress.street || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
            <TextField label="City" name="city" value={shippingAddress.city || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
            <TextField label="State" name="state" value={shippingAddress.state || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
            <TextField label="Zip Code" name="zipCode" value={shippingAddress.zipCode || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
            <TextField label="Country" name="country" value={shippingAddress.country || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
            <TextField label="Phone (Optional)" name="phone" value={shippingAddress.phone || ''} onChange={handleAddressChange} fullWidth margin="normal" />
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Subtotal</Typography>
              <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Button variant="contained" color="primary" fullWidth size="large" onClick={handleSaveChanges} disabled={saving} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px', py: 1.5 }}>
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditOrderPage;