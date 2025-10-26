import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Grid, Box, Avatar, MenuItem, Alert, Stack, Divider, Typography,
  FormControlLabel, Checkbox, FormGroup, Chip, OutlinedInput, InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

const ProductFormDialog = ({ open, onClose, onSave, product, loading }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    salePrice: '',
    description: '',
    category: '',
    countInStock: '',
    unit: '',
    tags: [], // Add tags field
  });
  const [tagInput, setTagInput] = useState(''); // For adding new tags
  const [badges, setBadges] = useState({
    isNew: false,
    isOrganic: false,
    isBestseller: false,
    isOnSale: false,
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
          price: product.price !== undefined ? product.price : '',
          salePrice: product.salePrice !== undefined ? product.salePrice : '',
          description: product.description || '',
          category: product.category || '',
          countInStock: product.countInStock !== undefined ? product.countInStock : '',
          unit: product.unit || '',
          tags: product.tags || [], // Initialize tags
        });
        setBadges({
          isNew: product.badges?.isNew || false,
          isOrganic: product.badges?.isOrganic || false,
          isBestseller: product.badges?.isBestseller || false,
          isOnSale: product.badges?.isOnSale || false,
        });
        setImagePreview(product.image || '');
        setImageFile(null);
      } else {
        setFormData({
          name: '', price: '', salePrice: '', description: '', category: '', countInStock: '', unit: '', tags: [],
        });
        setBadges({
          isNew: false,
          isOrganic: false,
          isBestseller: false,
          isOnSale: false,
        });
        setImageFile(null);
        setImagePreview('');
      }
      setTagInput(''); // Clear tag input
    }
  }, [product, open]);

  const handleBadgeChange = (e) => {
    const { name, checked } = e.target;
    setBadges(prev => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tag input changes
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a new tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  // Remove a tag
  const handleDeleteTag = (tagToDelete) => () => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
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
      // Handle tags specially
      if (key === 'tags') {
        productData.append('tags', JSON.stringify(formData.tags));
      } 
      // Only append fields that have values
      else if (formData[key] !== null && formData[key] !== '') {
        // For FormData, all values must be strings
        productData.append(key, formData[key]);
      }
    }
    // Add badges as JSON string
    productData.append('badges', JSON.stringify(badges));
    
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
          {error && <Alert severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{error}</Alert>}
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
            <Grid item size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                <TextField name="name" label="Product Name" value={formData.name} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                  <TextField name="price" label="Regular Price" type="number" value={formData.price} onChange={handleChange} fullWidth required InputProps={{ inputProps: { min: 0, step: "0.01" } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField name="salePrice" label="Sale Price (Optional)" type="number" value={formData.salePrice} onChange={handleChange} fullWidth InputProps={{ inputProps: { min: 0, step: "0.01" } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                  <TextField name="unit" label="Unit (e.g., kg, lb, piece)" value={formData.unit} onChange={handleChange} fullWidth InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                  <TextField name="countInStock" label="Count In Stock" type="number" value={formData.countInStock} onChange={handleChange} fullWidth required InputProps={{ inputProps: { min: 0 } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                </Stack>
                <TextField name="description" label="Description" multiline rows={4} value={formData.description} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} />
                <Stack direction="row" spacing={2.5}>
                  <TextField name="category" label="Category" select value={formData.category} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiSelect-select': { fontFamily: theme.typography.fontFamily } }}>
                    {categories.map(option => <MenuItem key={option} value={option} sx={{ fontFamily: theme.typography.fontFamily }}>{option}</MenuItem>)}
                  </TextField>
                </Stack>
                
                {/* Tags Input */}
                <TextField
                  label="Tags"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleAddTag}
                  fullWidth
                  placeholder="Type a tag and press Enter"
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Add:</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={handleDeleteTag(tag)}
                      sx={{ fontFamily: theme.typography.fontFamily }}
                    />
                  ))}
                </Box>
                
                {/* Product Badges */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 1 }}>Product Badges</Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox checked={badges.isNew} onChange={handleBadgeChange} name="isNew" color="info" />}
                    label="New Product"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: theme.typography.fontFamily } }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={badges.isOrganic} onChange={handleBadgeChange} name="isOrganic" color="success" />}
                    label="Organic"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: theme.typography.fontFamily } }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={badges.isBestseller} onChange={handleBadgeChange} name="isBestseller" color="warning" />}
                    label="Bestseller"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: theme.typography.fontFamily } }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={badges.isOnSale} onChange={handleBadgeChange} name="isOnSale" color="error" />}
                    label="On Sale"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: theme.typography.fontFamily } }}
                  />
                </FormGroup>
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