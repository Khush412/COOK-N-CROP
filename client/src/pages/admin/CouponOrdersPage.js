import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Tooltip, Chip, Button
} from '@mui/material';
import couponService from '../../services/couponService';

const CouponOrdersPage = () => {
  const { code } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders Using Coupon: <Chip label={code} color="primary" />
      </Typography>
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
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>
                        <Tooltip title={order._id}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                            {order._id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{order.user?.username || 'N/A'}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell><Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" /></TableCell>
                      <TableCell align="right">
                        <Button component={RouterLink} to={`/order/${order._id}`} size="small">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No orders found using this coupon.</Typography>
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

export default CouponOrdersPage;