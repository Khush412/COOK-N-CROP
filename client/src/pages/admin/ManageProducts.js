import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TextField, Avatar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Pagination, Checkbox, Container, Stack, Chip, Grid,
  Input, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Menu, ListItemIcon, ListItemText
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvImportLoading, setCsvImportLoading] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockThreshold] = useState(10); // Define low stock threshold
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleActionsClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

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
      const data = await productService.getAllProducts({ 
        page, 
        search: debouncedSearchTerm,
        category: categoryFilter === 'All' ? undefined : categoryFilter
      });
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
  }, [page, debouncedSearchTerm, categoryFilter]);

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

  // CSV Import Functions
  const handleOpenCsvImportDialog = () => {
    setCsvImportDialogOpen(true);
  };

  const handleCloseCsvImportDialog = () => {
    setCsvImportDialogOpen(false);
    setCsvFile(null);
    setCsvImportResult(null);
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first.');
      return;
    }

    setCsvImportLoading(true);
    setCsvImportResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      
      const response = await adminService.importProductsFromCsv(formData);
      setCsvImportResult(response.data);
      fetchProducts(); // Refresh the product list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to import products.';
      setCsvImportResult({ success: false, message: errorMessage });
    } finally {
      setCsvImportLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Add, edit, and organize all products in your store.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search by Name or Description"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontFamily: theme.typography.fontFamily,
                      },
                    },
                  },
                }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {numSelected > 0 && (
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}>
                Delete Selected ({numSelected})
              </Button>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleOpenCsvImportDialog} sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}>
              Import CSV
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}>
              Add Product
            </Button>
          </Stack>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}><CircularProgress size={48} /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{error}</Alert>
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
                          '& td': { py: 1.5 },
                          '&:hover': {
                            backgroundColor: product.countInStock <= lowStockThreshold 
                              ? alpha(theme.palette.warning.main, 0.15) 
                              : alpha(theme.palette.primary.main, 0.02)
                          }
                        }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `product-checkbox-${product._id}` }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Avatar 
                              src={product.images && product.images.length > 0 ? `${process.env.REACT_APP_API_URL}${product.images[0]}` : (product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} 
                              variant="rounded" 
                              sx={{ width: 50, height: 50, borderRadius: 2 }} 
                            />
                          </TableCell>
                          <TableCell id={`product-checkbox-${product._id}`} sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: theme.typography.fontFamily, mb: 0.5 }}>
                              {product.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1, fontFamily: theme.typography.fontFamily }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: theme.typography.fontFamily }}>
                              ₹{product.price.toFixed(2)}
                            </Typography>
                            {product.salePrice && product.salePrice < product.price && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                                  ₹{product.price.toFixed(2)}
                                </Typography>
                                <Chip 
                                  icon={<LocalOfferIcon sx={{ fontSize: 12 }} />}
                                  label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`}
                                  size="small"
                                  color="error"
                                  sx={{ height: 20, '& .MuiChip-icon': { fontSize: 10, mr: 0.2 }, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem', fontWeight: 500 } }}
                                />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                                {product.countInStock}
                              </Typography>
                              {product.countInStock <= lowStockThreshold && (
                                <Tooltip title="Low Stock">
                                  <WarningAmberIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                              {product.isFeatured && <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />}
                              {product.badges?.isNew && <Chip label="New" size="small" color="info" sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem', fontWeight: 500 } }} />}
                              {product.badges?.isOrganic && <Chip label="Organic" size="small" color="success" sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem', fontWeight: 500 } }} />}
                              {product.badges?.isBestseller && <Chip label="Best" size="small" color="primary" sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem', fontWeight: 500 } }} />}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(event) => handleActionsClick(event, product)}
                              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                          <Inventory2Icon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                            No products found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            Try adjusting your search criteria or add a new product
                          </Typography>
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
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      borderRadius: 2,
                      fontFamily: theme.typography.fontFamily
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
        sx={{ '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } }}
      >
        <MenuItem onClick={() => {
          handleFeatureToggle(selectedProduct?._id);
          handleActionsClose();
        }}>
          <ListItemIcon>
            {selectedProduct?.isFeatured ? <StarBorderIcon fontSize="small" /> : <StarIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{selectedProduct?.isFeatured ? "Unfeature Product" : "Feature Product"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleOpenDialog(selectedProduct);
          handleActionsClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Product</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteProduct(selectedProduct?._id);
          handleActionsClose();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        product={editingProduct}
        onSave={handleSaveProduct}
        loading={formLoading}
      />

      {/* CSV Import Dialog */}
      <Dialog open={csvImportDialogOpen} onClose={handleCloseCsvImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, pb: 1 }}>
          Import Products from CSV
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Upload a CSV file to bulk import products. Make sure your file follows the required format.
          </DialogContentText>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, mb: 2 }}
            >
              Download Template
              <Input
                type="file"
                sx={{ display: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  // In a real implementation, this would download a template file
                  alert('Template download would be implemented here');
                }}
              />
            </Button>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
            >
              Choose CSV File
              <Input
                type="file"
                accept=".csv"
                sx={{ display: 'none' }}
                onChange={handleCsvFileChange}
              />
            </Button>
            {csvFile && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
                Selected: {csvFile.name}
              </Typography>
            )}
          </Box>
          
          {csvImportResult && (
            <Alert 
              severity={csvImportResult.success ? "success" : "error"} 
              sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
            >
              {csvImportResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseCsvImportDialog} 
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCsvImport} 
            variant="contained" 
            disabled={!csvFile || csvImportLoading}
            startIcon={csvImportLoading ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
          >
            {csvImportLoading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: theme.typography.fontFamily, pb: 1 }}>
          {confirmAction?.title}
        </DialogTitle>
        <DialogContent sx={{ fontFamily: theme.typography.fontFamily }}>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: theme.typography.fontFamily }}>
            {confirmAction?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
          >
            Cancel
          </Button>
          <Button 
            onClick={executeConfirmAction} 
            variant="contained" 
            autoFocus
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageProducts;