import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper, Typography, Box, Grid, TextField, Autocomplete, Button, IconButton,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress, Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';

const EditOrderPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

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
        setOrderItems(order.orderItems);
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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit Order</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>1. User</Typography>
          {user && <Alert severity="info" sx={{ mt: 2 }}>Editing order for: <strong>{user.username}</strong></Alert>}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>2. Add/Edit Products</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete sx={{ flexGrow: 1 }} options={productOptions} getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id} value={product} onChange={(event, newValue) => setProduct(newValue)}
              onInputChange={handleProductSearch} loading={productLoading}
              renderInput={(params) => (
                <TextField {...params} label="Search for a product to add..." variant="outlined"
                  InputProps={{ ...params.InputProps, endAdornment: (<>{productLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),}}
                />
              )}
            />
            <Button variant="contained" onClick={handleAddProduct} disabled={!product}>Add</Button>
          </Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Order Items</Typography>
          <List>
            {orderItems.map(item => (
              <ListItem key={item.product} secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.product)}><DeleteIcon /></IconButton>}>
                <ListItemAvatar><Avatar src={item.image} variant="rounded" /></ListItemAvatar>
                <ListItemText primary={item.name} secondary={`Qty: ${item.qty} - $${(item.price * item.qty).toFixed(2)}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>3. Shipping Address</Typography>
          <TextField label="Full Name" name="fullName" value={shippingAddress.fullName || ''} onChange={handleAddressChange} fullWidth margin="normal" />
          <TextField label="Street" name="street" value={shippingAddress.street || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
          <TextField label="City" name="city" value={shippingAddress.city || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
          <TextField label="State" name="state" value={shippingAddress.state || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
          <TextField label="Zip Code" name="zipCode" value={shippingAddress.zipCode || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
          <TextField label="Country" name="country" value={shippingAddress.country || ''} onChange={handleAddressChange} fullWidth required margin="normal" />
          <TextField label="Phone (Optional)" name="phone" value={shippingAddress.phone || ''} onChange={handleAddressChange} fullWidth margin="normal" />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Order Summary</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Subtotal</Typography>
            <Typography fontWeight="bold">${subtotal.toFixed(2)}</Typography>
          </Box>
          <Button variant="contained" color="primary" fullWidth size="large" onClick={handleSaveChanges} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EditOrderPage;