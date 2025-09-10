import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Button, Avatar, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import ProductFormDialog from '../../components/ProductFormDialog';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenForm = (product = null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleFormSubmit = () => {
    handleCloseForm();
    fetchProducts(); // Refresh the list
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Manage Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Create Product
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>In Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Avatar src={product.image} alt={product.name} variant="rounded" />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={product.inStock ? 'Yes' : 'No'}
                    color={product.inStock ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Product">
                    <IconButton onClick={() => handleOpenForm(product)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Product">
                    <IconButton onClick={() => handleDeleteProduct(product._id)} color="error"><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isFormOpen && (
        <ProductFormDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmitSuccess={handleFormSubmit}
          product={editingProduct}
        />
      )}
    </Paper>
  );
};

export default ManageProducts;