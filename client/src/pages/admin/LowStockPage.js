import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Avatar, Slider, Container,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import adminService from '../../services/adminService';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [debouncedThreshold, setDebouncedThreshold] = useState(10);
  const theme = useTheme();

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
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.warning.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Low Stock Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Monitor products that are running low on inventory.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ my: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Stock Threshold: {threshold}</Typography>
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
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Stock Left</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product._id} hover>
                        <TableCell><Avatar src={product.image} variant="rounded" /></TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{product.name}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{product.category}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>${product.price.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: product.countInStock < 5 ? 'error.main' : 'warning.main' }}>
                          {product.countInStock}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <WarningAmberIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            No products are below the selected stock threshold.
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
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default LowStockPage;