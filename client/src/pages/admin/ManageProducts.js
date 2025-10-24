import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TextField, Avatar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Pagination, Checkbox, Container, Stack, Chip, Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [lowStockThreshold] = useState(10); // Define low stock threshold

  // Calculate low stock count
  const lowStockCount = products.filter(p => p.countInStock <= lowStockThreshold).length;

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
    console.log('ManageProducts useEffect triggered');
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

  const openConfirmDialog = (type, payload, title, message) => {
    setConfirmAction({ type, payload, title, message });
    setConfirmDialogOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, payload } = confirmAction;
    try {
      if (type === 'deleteProduct') {
        await productService.deleteProduct(payload);
      } else if (type === 'deleteSelected') {
        await adminService.deleteMultipleProducts(selectedProducts);
      }
      fetchProducts();
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
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

  const handleDeleteProduct = (productId) => {
    openConfirmDialog('deleteProduct', productId, 'Confirm Product Deletion', 'Are you sure you want to delete this product? This action cannot be undone.');
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

  const handleDeleteSelected = () => {
    openConfirmDialog('deleteSelected', null, 'Confirm Bulk Deletion', `Are you sure you want to delete ${selectedProducts.length} selected products?`);
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
    <Container maxWidth="xl" sx={{ mt: 12, py: 4, zoom: 0.9 }}>
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
          <Stack direction="row" spacing={1}>
            {lowStockCount > 0 && (
              <Chip 
                icon={<WarningAmberIcon />}
                label={`${lowStockCount} Low Stock`}
                color="warning"
                size="small"
                onClick={() => alert('Low stock items highlighted in table below')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              />
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
              Add Product
            </Button>
          </Stack>
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
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Sales</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => {
                      const isItemSelected = isSelected(product._id);
                      return (
                        <TableRow key={product._id} hover onClick={(event) => handleSelectClick(event, product._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected} sx={{
                          backgroundColor: product.countInStock <= lowStockThreshold ? alpha(theme.palette.warning.main, 0.1) : 'inherit',
                          '& td': { py: 1 }
                        }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `product-checkbox-${product._id}` }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}><Avatar src={product.image} variant="rounded" sx={{ width: 40, height: 40 }} /></TableCell>
                          <TableCell id={`product-checkbox-${product._id}`} sx={{ fontFamily: theme.typography.fontFamily, fontSize: '0.875rem' }}>{product.name}</TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: '0.875rem' }}>{product.category}</TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily, py: 1, fontSize: '0.875rem' }}>
                            ₹{product.price.toFixed(2)}
                            {product.salePrice && product.salePrice < product.price && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.75rem' }}>
                                  ₹{product.price.toFixed(2)}
                                </Typography>
                                <Chip 
                                  icon={<LocalOfferIcon sx={{ fontSize: 12 }} />}
                                  label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`}
                                  size="small"
                                  color="error"
                                  sx={{ height: 16, '& .MuiChip-icon': { fontSize: 10, mr: 0.2 }, '& .MuiChip-label': { px: 0.3, fontSize: '0.6rem' } }}
                                />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily, py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontFamily: theme.typography.fontFamily, fontSize: '0.875rem' }}>{product.countInStock}</Typography>
                              {product.countInStock <= lowStockThreshold && (
                                <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily, py: 1, fontSize: '0.875rem' }}>
                            {product.totalSales || 0}
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                              {product.isFeatured && <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />}
                              {product.badges?.isNew && <Chip label="New" size="small" color="info" sx={{ height: 16, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }} />}
                              {product.badges?.isOrganic && <Chip label="Organic" size="small" color="success" sx={{ height: 16, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }} />}
                              {product.badges?.isBestseller && <Chip label="Best" size="small" color="primary" sx={{ height: 16, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }} />}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1 }}>
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                              <Tooltip title={product.isFeatured ? "Unfeature Product" : "Feature Product"}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleFeatureToggle(product._id); }}>
                                  {product.isFeatured ? <StarIcon color="secondary" fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Product">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(product); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Product">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }} color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
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
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: theme.typography.fontFamily }}>
          <WarningAmberIcon color="warning" />
          {confirmAction?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            {confirmAction?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button onClick={executeConfirmAction} color="error" variant="contained" autoFocus sx={{ fontFamily: theme.typography.fontFamily }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageProducts;