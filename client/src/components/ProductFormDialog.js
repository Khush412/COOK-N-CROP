import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, Box, Avatar, MenuItem, Alert, Stack, Divider, Typography,
  FormControlLabel, Checkbox, FormGroup, Chip, OutlinedInput, InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../custom_components/Loader';

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
  const [imageFiles, setImageFiles] = useState([]); // Updated to handle multiple files
  const [imagePreviews, setImagePreviews] = useState([]); // Updated to handle multiple previews
  const [existingImages, setExistingImages] = useState([]); // Track existing images for editing
  const [imagesToRemove, setImagesToRemove] = useState([]); // Track images to remove
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
        // Initialize existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
          setImagePreviews(product.images);
        } else if (product.image) {
          // Fallback for single image
          setExistingImages([product.image]);
          setImagePreviews([product.image]);
        } else {
          setExistingImages([]);
          setImagePreviews([]);
        }
        setImageFiles([]);
        setImagesToRemove([]);
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
        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);
        setImagesToRemove([]);
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 images total
      const totalImages = imagePreviews.length + files.length;
      if (totalImages > 5) {
        setError(`You can upload a maximum of 5 images. You currently have ${imagePreviews.length} images.`);
        return;
      }
      
      const newFiles = files.slice(0, 5 - imagePreviews.length);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove an image
  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      // For existing images, mark for removal
      const imagePath = existingImages[index];
      setImagesToRemove(prev => [...prev, imagePath]);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // For newly added images, remove from previews and files
      const newIndex = index - existingImages.length;
      if (newIndex >= 0) {
        setImageFiles(prev => prev.filter((_, i) => i !== newIndex));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.price || !formData.category || formData.countInStock === '') {
        setError('Please fill in all required fields: Name, Price, Category, and Stock.');
        return;
    }

    // Check if we have at least one image
    if (imagePreviews.length === 0 && existingImages.length === 0) {
      setError('Please upload at least one image.');
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
    
    // Add new image files
    imageFiles.forEach(file => {
      productData.append('images', file);
    });
    
    // Add images to remove
    if (imagesToRemove.length > 0) {
      productData.append('removeImages', JSON.stringify(imagesToRemove));
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
                <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  Product Images
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>
                  Upload up to 5 images. First image will be used as the main image.
                </Typography>
                
                {/* Image previews */}
                <Box sx={{ width: '100%', maxHeight: 300, overflowY: 'auto' }}>
                  <Grid container spacing={2}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={getImageUrl(preview)}
                            alt={`Product Image ${index + 1}`}
                            variant="rounded"
                            sx={{ width: '100%', height: 100, objectFit: 'cover' }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleRemoveImage(index, index < existingImages.length)}
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              minWidth: 'auto', 
                              p: 0.5,
                              borderRadius: '50%',
                              minWidth: 24,
                              height: 24
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </Button>
                          {index === 0 && (
                            <Chip 
                              label="Main" 
                              size="small" 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 4, 
                                left: 4,
                                bgcolor: 'primary.main',
                                color: 'white'
                              }} 
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {/* Upload button */}
                <Box
                  component="label"
                  htmlFor="product-images-upload"
                  sx={{
                    width: '100%',
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: alpha(theme.palette.action.hover, 0.02),
                    py: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <Stack alignItems="center" spacing={1} color="text.secondary">
                    <PhotoCamera sx={{ fontSize: 40 }} />
                    <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </Typography>
                  </Stack>
                  <input
                    id="product-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {imagePreviews.length}/5 images uploaded
                </Typography>
              </Stack>
            </Grid>
            
            <Grid item size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                <TextField
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Sale Price"
                      name="salePrice"
                      type="number"
                      value={formData.salePrice}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category} sx={{ fontFamily: theme.typography.fontFamily }}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="e.g., 500g, 1kg"
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  label="Stock Quantity"
                  name="countInStock"
                  type="number"
                  value={formData.countInStock}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                
                {/* Tags input */}
                <Box>
                  <TextField
                    label="Tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleAddTag}
                    placeholder="Press Enter to add tags"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                    InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={handleDeleteTag(tag)}
                        sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Badges checkboxes */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>Badges</Typography>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox checked={badges.isNew} onChange={handleBadgeChange} name="isNew" />}
                      label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>New</Typography>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={badges.isOrganic} onChange={handleBadgeChange} name="isOrganic" />}
                      label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Organic</Typography>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={badges.isBestseller} onChange={handleBadgeChange} name="isBestseller" />}
                      label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Bestseller</Typography>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={badges.isOnSale} onChange={handleBadgeChange} name="isOnSale" />}
                      label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>On Sale</Typography>}
                    />
                  </FormGroup>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2, px: 3 }}
          >
            {loading ? <Loader size="small" /> : product ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;