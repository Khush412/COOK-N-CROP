import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Chip, Button
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaidIcon from '@mui/icons-material/Paid';
import { Link as RouterLink } from 'react-router-dom';
import adminService from '../../services/adminService';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleMarkAsPaid = async (orderId) => {
    if (window.confirm('Mark this order as paid?')) {
      try {
        const updatedOrder = await adminService.updateOrderToPaid(orderId);
        setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
      } catch (err) {
        alert('Failed to mark as paid.');
      }
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    if (window.confirm('Mark this order as delivered?')) {
      try {
        const updatedOrder = await adminService.updateOrderToDelivered(orderId);
        setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
      } catch (err) {
        alert('Failed to mark as delivered.');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage Orders</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Delivered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
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
                <TableCell>
                  {order.isPaid ? (
                    <Chip icon={<CheckIcon />} label="Paid" color="success" size="small" />
                  ) : (
                    <Chip icon={<CloseIcon />} label="Not Paid" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered ? (
                    <Chip icon={<CheckIcon />} label="Delivered" color="success" size="small" />
                  ) : (
                    <Chip icon={<CloseIcon />} label="Not Delivered" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Mark as Paid">
                    <span>
                      <IconButton onClick={() => handleMarkAsPaid(order._id)} disabled={order.isPaid}>
                        <PaidIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Mark as Delivered">
                    <span>
                      <IconButton onClick={() => handleMarkAsDelivered(order._id)} disabled={order.isDelivered}>
                        <LocalShippingIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Button component={RouterLink} to={`/order/${order._id}`} size="small">
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ManageOrders;