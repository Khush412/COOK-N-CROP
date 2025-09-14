import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell,TextField,Avatar,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Pagination, Checkbox, Container, Stack,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import productService from '../../services/productService';
import adminService from '../../services/adminService';
import ProductFormDialog from '../../components/ProductFormDialog';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

// Main ManageProducts Component
const ManageProducts = () => {
  const theme = useTheme();
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

  const handleSaveProduct = async (productData, productId, setErrorCallback) => {
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
      const errorMessage = err.response?.data?.message || 'Failed to save product. Check console for details.';
      setErrorCallback(errorMessage);
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

  const handleFeatureToggle = async (productId) => {
    try {
      const res = await adminService.toggleFeatureProduct(productId);
      // Optimistically update the UI
      setProducts(products.map(p => p._id === productId ? { ...p, isFeatured: res.isFeatured } : p));
    } catch (err) {
      alert('Failed to update feature status.');
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
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Add, edit, and organize all products in your store.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search by Name or Category"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            {numSelected > 0 && (
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>
                Delete ({numSelected})
              </Button>
            )}
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            Add Product
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
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
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Stock</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
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
                          <TableCell id={`product-checkbox-${product._id}`} sx={{ fontFamily: theme.typography.fontFamily }}>{product.name}</TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{product.category}</TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>${product.price.toFixed(2)}</TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{product.countInStock}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={product.isFeatured ? "Unfeature Product" : "Feature Product"}>
                              <IconButton onClick={(e) => { e.stopPropagation(); handleFeatureToggle(product._id); }}>
                                <StarIcon color={product.isFeatured ? "secondary" : "action"} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Product">
                              <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(product); }}><EditIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product">
                              <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }} color="error"><DeleteIcon /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Inventory2Icon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No products found matching your criteria.</Typography>
                        </Box>
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
      </Paper>
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveProduct}
        product={editingProduct}
        loading={formLoading}
      />
    </Container>
  );
};

export default ManageProducts;