import React, { useState, useEffect } from 'react';
import {Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Grid, Box, Avatar, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Alert
} from '@mui/material';
import adminService from '../services/adminService';

const categories = ['Fruits', 'Vegetables', 'Exotic Produce', 'Seasonal Picks', 'Organic / Specials'];

const ProductFormDialog = ({ open, onClose, onSubmitSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    inStock: true,
    origin: '',
    freshness: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
        origin: product.origin || '',
        freshness: product.freshness || '',
      });
      setImagePreview(product.image || '');
    } else {
      // Reset form for creation
      setFormData({
        name: '', price: '', description: '', category: '', inStock: true, origin: '', freshness: '',
      });
      setImage(null);
      setImagePreview('');
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }

    try {
      if (product) {
        await adminService.updateProduct(product._id, data);
      } else {
        await adminService.createProduct(data);
      }
      onSubmitSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={imagePreview}
                  alt="Product Image"
                  variant="rounded"
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Button variant="outlined" component="label">
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.inStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    name="inStock"
                  />
                }
                label="In Stock"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (product ? 'Save Changes' : 'Create Product')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;