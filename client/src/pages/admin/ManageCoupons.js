import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Dialog, DialogTitle, Pagination,
  DialogContent, DialogActions, TextField, MenuItem, Chip
} from '@mui/material';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import couponService from '../../services/couponService';
import { Link as RouterLink } from 'react-router-dom';

// Coupon Form Dialog Component
const CouponFormDialog = ({ open, onClose, onSave, coupon, loading }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiresAt: '',
    minPurchase: '',
    usageLimit: '',
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        expiresAt: coupon.expiresAt ? format(new Date(coupon.expiresAt), "yyyy-MM-dd'T'HH:mm") : '',
        minPurchase: coupon.minPurchase || '',
        usageLimit: coupon.usageLimit === null ? '' : coupon.usageLimit,
      });
    } else {
      setFormData({
        code: '', discountType: 'percentage', discountValue: '', expiresAt: '', minPurchase: '', usageLimit: '',
      });
    }
  }, [coupon, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.usageLimit === '') dataToSave.usageLimit = null; // Send null for unlimited
    onSave(dataToSave, coupon?._id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{coupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="coupon-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField name="code" label="Coupon Code" value={formData.code} onChange={handleChange} fullWidth required margin="normal" helperText="Must be unique. Will be uppercased." />
          <TextField name="discountType" label="Discount Type" select value={formData.discountType} onChange={handleChange} fullWidth required margin="normal">
            <MenuItem value="percentage">Percentage (%)</MenuItem>
            <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
          </TextField>
          <TextField name="discountValue" label="Discount Value" type="number" value={formData.discountValue} onChange={handleChange} fullWidth required margin="normal" />
          <TextField name="expiresAt" label="Expires At" type="datetime-local" value={formData.expiresAt} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField name="minPurchase" label="Minimum Purchase ($)" type="number" value={formData.minPurchase} onChange={handleChange} fullWidth margin="normal" helperText="Leave blank for no minimum." />
          <TextField name="usageLimit" label="Usage Limit" type="number" value={formData.usageLimit} onChange={handleChange} fullWidth margin="normal" helperText="Leave blank for unlimited uses." />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" form="coupon-form" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main ManageCoupons Component
const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons({ page, search: debouncedSearchTerm });
      setCoupons(data.coupons);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to fetch coupons.');
      setCoupons([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleOpenDialog = (coupon = null) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (formLoading) return;
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (couponData, couponId) => {
    setFormLoading(true);
    try {
      if (couponId) {
        await couponService.updateCoupon(couponId, couponData);
      } else {
        await couponService.createCoupon(couponData);
      }
      handleCloseDialog();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(couponId);
        fetchCoupons();
      } catch (err) {
        alert('Failed to delete coupon.');
      }
    }
  };

  return (
    <Paper sx={{ p: 3, m: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom>Manage Coupons</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Code"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Coupon
          </Button>
        </Box>
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
                  <TableCell>Code</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.length > 0 ? (
                  coupons.map((coupon) => {
                    const isExpired = new Date(coupon.expiresAt) < new Date();
                    const status = coupon.isActive && !isExpired ? 'Active' : 'Inactive';
                    return (
                      <TableRow key={coupon._id} hover>
                        <TableCell><Chip label={coupon.code} color="primary" variant="outlined" /></TableCell>
                        <TableCell>{coupon.discountType}</TableCell>
                        <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}</TableCell>
                        <TableCell>{format(new Date(coupon.expiresAt), 'PPp')}</TableCell>
                        <TableCell>
                          <Chip label={status} color={status === 'Active' ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell>{coupon.timesUsed} / {coupon.usageLimit || '∞'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Coupon">
                        <IconButton component={RouterLink} to={`/admin/coupons/${coupon.code}/orders`}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Coupon">
                            <IconButton onClick={() => handleOpenDialog(coupon)}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Coupon">
                            <IconButton onClick={() => handleDeleteCoupon(coupon._id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No coupons found matching your criteria.</Typography>
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
      <CouponFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveCoupon}
        coupon={editingCoupon}
        loading={formLoading}
      />
    </Paper>
  );
};

export default ManageCoupons;