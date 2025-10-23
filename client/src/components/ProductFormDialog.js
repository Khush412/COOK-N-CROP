import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Grid, Box, Avatar, MenuItem, Alert, Stack, Divider, Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

const ProductFormDialog = ({ open, onClose, onSave, product, loading }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    countInStock: '',
    origin: '',
    freshness: '',
    unit: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:')) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  useEffect(() => {
    if (open) {
      setError(''); // Clear errors when dialog opens
      if (product) {
        setFormData({
          name: product.name || '',
          price: product.price || '',
          description: product.description || '',
          category: product.category || '',
          countInStock: product.countInStock || 0,
          origin: product.origin || '',
          freshness: product.freshness || '',
          unit: product.unit || '',
        });
        setImagePreview(product.image || '');
        setImageFile(null);
      } else {
        setFormData({
          name: '', price: '', description: '', category: '', countInStock: '', origin: '', freshness: '', unit: '',
        });
        setImageFile(null);
        setImagePreview('');
      }
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.price || !formData.category || formData.countInStock === '') {
        setError('Please fill in all required fields: Name, Price, Category, and Stock.');
        return;
    }

    const productData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        productData.append(key, formData[key]);
      }
    }
    if (imageFile) {
      productData.append('image', imageFile);
    }
    onSave(productData, product?._id, setError);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit} id="product-form">
        <DialogContent sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{error}</Alert>} {/* Use size prop */}
          <Grid container spacing={4}>
            <Grid item size={{ xs: 12, md: 4 }}>
              <Stack spacing={2} alignItems="center">
                <Box
                  component="label"
                  htmlFor="product-image-upload"
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxWidth: 250,
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: imagePreview ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  {imagePreview ? (
                    <Avatar
                      src={getImageUrl(imagePreview)}
                      alt="Product Image"
                      variant="rounded"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Stack alignItems="center" spacing={1} color="text.secondary">
                      <PhotoCamera sx={{ fontSize: 40 }} />
                      <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>Upload Image</Typography>
                    </Stack>
                  )}
                </Box>
                <input id="product-image-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Stack>
            </Grid>
            <Grid item size={{ xs: 12, md: 8 }}> {/* Use size prop */}
              <Stack spacing={2.5}>
                <TextField name="name" label="Product Name" value={formData.name} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                  <TextField name="price" label="Price" type="number" value={formData.price} onChange={handleChange} fullWidth required InputProps={{ inputProps: { min: 0, step: "0.01" } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField name="unit" label="Unit (e.g., kg, lb, piece)" value={formData.unit} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField name="countInStock" label="Count In Stock" type="number" value={formData.countInStock} onChange={handleChange} fullWidth required InputProps={{ inputProps: { min: 0 } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                </Stack>
                <TextField name="description" label="Description" multiline rows={4} value={formData.description} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                <Stack direction="row" spacing={2.5}>
                  <TextField name="category" label="Category" select value={formData.category} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiSelect-select': { fontFamily: theme.typography.fontFamily } }}>
                    {categories.map(option => <MenuItem key={option} value={option} sx={{ fontFamily: theme.typography.fontFamily }}>{option}</MenuItem>)}
                  </TextField>
                  <TextField name="origin" label="Origin (e.g., Local Farm)" value={formData.origin} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                </Stack>
                <TextField name="freshness" label="Freshness (e.g., Harvested daily)" value={formData.freshness} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Cancel</Button> 
          <Button type="submit" form="product-form" variant="contained" disabled={loading} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px', px: 3 }}>
            {loading ? <CircularProgress size={24} /> : (product ? 'Save Changes' : 'Create Product')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;