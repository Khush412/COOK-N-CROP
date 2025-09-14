import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination, Container,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Chip, Button, Stack
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import couponService from '../../services/couponService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CouponOrdersPage = () => {
  const { code } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const theme = useTheme();

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Canceled: 'error',
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await couponService.getOrdersByCoupon(code, page);
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError(`Failed to fetch orders for coupon ${code}.`);
    } finally {
      setLoading(false);
    }
  }, [code, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Button component={RouterLink} to="/admin/coupons" startIcon={<ArrowBackIcon />} sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
          Back to Manage Coupons
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
          Orders Using Coupon: <Chip label={code} color="primary" sx={{ fontSize: '1.5rem', height: 'auto', p: 0.5 }} />
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
          {orders.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center', fontFamily: theme.typography.fontFamily }}>No orders found using this coupon.</Typography>
          ) : (
            <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Tooltip title={order._id}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 100, fontFamily: theme.typography.fontFamily }}>
                          {order._id}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{order.user?.username || 'N/A'}</TableCell>
                    <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell><Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" /></TableCell>
                    <TableCell align="right">
                      <Button component={RouterLink} to={`/order/${order._id}`} size="small" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      )}
    </Container>
  );
};

export default CouponOrdersPage;