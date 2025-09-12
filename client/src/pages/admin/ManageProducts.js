import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Dialog, DialogTitle, Pagination, Checkbox,
  DialogContent, DialogActions, TextField, MenuItem, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import productService from '../../services/productService';
import adminService from '../../services/adminService';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

// Product Form Dialog Component
const ProductFormDialog = ({ open, onClose, onSave, product, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    countInStock: '',
    origin: '',
    freshness: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        countInStock: product.countInStock || 0,
        origin: product.origin || '',
        freshness: product.freshness || '',
        image: null, // Don't pre-fill file input
      });
      setImagePreview(product.image || '');
    } else {
      // Reset form for new product
      setFormData({
        name: '', price: '', description: '', category: '', countInStock: '', origin: '', freshness: '', image: null,
      });
      setImagePreview('');
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        productData.append(key, formData[key]);
      }
    }
    onSave(productData, product?._id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="product-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField name="name" label="Product Name" value={formData.name} onChange={handleChange} fullWidth required margin="normal" />
          <TextField name="price" label="Price" type="number" value={formData.price} onChange={handleChange} fullWidth required margin="normal" />
          <TextField name="countInStock" label="Count In Stock" type="number" value={formData.countInStock} onChange={handleChange} fullWidth required margin="normal" />
          <TextField name="description" label="Description" multiline rows={4} value={formData.description} onChange={handleChange} fullWidth required margin="normal" />
          <TextField name="category" label="Category" select value={formData.category} onChange={handleChange} fullWidth required margin="normal">
            {categories.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          <TextField name="origin" label="Origin (e.g., Local Farm)" value={formData.origin} onChange={handleChange} fullWidth margin="normal" />
          <TextField name="freshness" label="Freshness (e.g., Harvested daily)" value={formData.freshness} onChange={handleChange} fullWidth margin="normal" />
          <Button variant="contained" component="label" sx={{ mt: 1 }}>
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
          {imagePreview && <Avatar src={imagePreview} sx={{ width: 100, height: 100, mt: 2 }} variant="rounded" />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" form="product-form" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// Main ManageProducts Component
const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts({ page, search: debouncedSearchTerm });
      setProducts(data.products);
      setPage(data.page);
      setTotalPages(data.pages);
      setSelectedProducts([]); // Clear selection on data refresh
    } catch (err) {
      setError('Failed to fetch products.');
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenDialog = (product = null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (formLoading) return;
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData, productId) => {
    setFormLoading(true);
    try {
      if (productId) {
        await productService.updateProduct(productId, productData);
      } else {
        await productService.createProduct(productData);
      }
      handleCloseDialog();
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Check console for details.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
      try {
        await adminService.deleteMultipleProducts(selectedProducts);
        fetchProducts(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete selected products:', err);
        alert('Failed to delete selected products.');
      }
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = products.map((n) => n._id);
      setSelectedProducts(newSelecteds);
      return;
    }
    setSelectedProducts([]);
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedProducts.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedProducts, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedProducts.slice(1));
    } else if (selectedIndex === selectedProducts.length - 1) {
      newSelected = newSelected.concat(selectedProducts.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedProducts.slice(0, selectedIndex),
        selectedProducts.slice(selectedIndex + 1),
      );
    }
    setSelectedProducts(newSelected);
  };

  const isSelected = (id) => selectedProducts.indexOf(id) !== -1;
  const numSelected = selectedProducts.length;
  const rowCount = products.length;

  return (
    <Paper sx={{ p: 3, m: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom>Manage Products</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Name or Category"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          {numSelected > 0 && (
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected}>
              Delete ({numSelected})
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Product
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={numSelected > 0 && numSelected < rowCount}
                      checked={rowCount > 0 && numSelected === rowCount}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all products' }}
                    />
                  </TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const isItemSelected = isSelected(product._id);
                    return (
                      <TableRow key={product._id} hover onClick={(event) => handleSelectClick(event, product._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': `product-checkbox-${product._id}` }}
                          />
                        </TableCell>
                        <TableCell><Avatar src={product.image} variant="rounded" /></TableCell>
                        <TableCell id={`product-checkbox-${product._id}`}>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.countInStock}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Product">
                            <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(product); }}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No products found matching your criteria.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveProduct}
        product={editingProduct}
        loading={formLoading}
      />
    </Paper>
  );
};

export default ManageProducts;