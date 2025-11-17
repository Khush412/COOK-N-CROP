import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography, Alert, Table, TableBody, TableCell, Box, Pagination, Container,
  TableHead, TableRow, Paper, Tooltip, Chip, Button, 
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import couponService from '../../services/couponService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Loader from '../../custom_components/Loader';

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
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Button 
          component={RouterLink} 
          to="/admin/coupons" 
          startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />} 
          sx={{ 
            mb: 2, 
            fontFamily: theme.typography.fontFamily,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 0.5, sm: 1 },
            px: { xs: 1, sm: 2 }
          }}
        >
          Back to Manage Coupons
        </Button>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 800, 
            fontFamily: theme.typography.fontFamily,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Orders Using Coupon: 
          <Chip 
            label={code} 
            color="primary" 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.5rem' }, 
              height: 'auto', 
              p: { xs: 0.25, sm: 0.5 },
              mt: { xs: 0.5, sm: 0 }
            }} 
          />
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: { xs: 3, sm: 4 } }}><Loader size="medium" /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 4 }}>
          {orders.length === 0 ? (
            <Typography 
              color="text.secondary" 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                textAlign: 'center', 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              No orders found using this coupon.
            </Typography>
          ) : (
            <>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover sx={{ '& td': { py: { xs: 1, sm: 1.5 } } }}>
                    <TableCell>
                      <Tooltip title={order._id}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: { xs: 80, sm: 100 }, 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {order._id}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {order.user?.username || 'N/A'}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      ₹{order.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={statusColors[order.status] || 'default'} 
                        size="small" 
                        sx={{ 
                          fontSize: { xs: '0.625rem', sm: '0.75rem' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/order/${order._id}`} 
                        size="small" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          borderRadius: '50px',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: { xs: 0.5, sm: 1 },
                          px: { xs: 1, sm: 2 }
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                sx={{ 
                  '& .MuiPaginationItem-root': { 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 }
                  }
                }}
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