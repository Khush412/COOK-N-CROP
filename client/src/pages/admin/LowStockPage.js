import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Avatar, Slider,
} from '@mui/material';
import adminService from '../../services/adminService';

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [debouncedThreshold, setDebouncedThreshold] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedThreshold(threshold);
    }, 500);
    return () => clearTimeout(timer);
  }, [threshold]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getLowStockProducts({ page, threshold: debouncedThreshold });
      setProducts(data.products);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to fetch low stock products.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedThreshold]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Low Stock Products</Typography>
      <Box sx={{ my: 2, maxWidth: 400 }}>
        <Typography gutterBottom>Stock Threshold: {threshold}</Typography>
        <Slider
          value={threshold}
          onChange={(e, newValue) => setThreshold(newValue)}
          aria-labelledby="stock-threshold-slider"
          valueLabelDisplay="auto"
          step={5}
          marks
          min={0}
          max={50}
        />
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
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock Left</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell><Avatar src={product.image} variant="rounded" /></TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: product.countInStock < 5 ? 'error.main' : 'warning.main' }}>
                        {product.countInStock}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No products are below the selected stock threshold.</Typography>
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
  );
};

export default LowStockPage;