import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Alert, Table, TableBody, TableCell,
  DialogContentText,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Dialog, DialogTitle, Pagination, Container, Stack, Grid,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Checkbox, FormControlLabel, FormControl, FormLabel, FormGroup, Select, InputLabel
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { format, isBefore } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DiscountIcon from '@mui/icons-material/Discount';
import SearchIcon from '@mui/icons-material/Search';
import couponService from '../../services/couponService';
import { Link as RouterLink } from 'react-router-dom';
import Loader from '../../custom_components/Loader';

// Coupon Form Dialog Component
const CouponFormDialog = ({ open, onClose, onSave, coupon, loading }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiresAt: '',
    minPurchase: '',
    usageLimit: '',
    tierRestrictions: ['bronze', 'silver', 'gold'],
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
        tierRestrictions: coupon.tierRestrictions || ['bronze', 'silver', 'gold'],
      });
    } else {
      setFormData({
        code: '', discountType: 'percentage', discountValue: '', expiresAt: '', minPurchase: '', usageLimit: '',
        tierRestrictions: ['bronze', 'silver', 'gold'],
      });
    }
  }, [coupon, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tier restriction changes
  const handleTierChange = (tier) => {
    setFormData(prev => {
      const tiers = [...prev.tierRestrictions];
      if (tiers.includes(tier)) {
        return { ...prev, tierRestrictions: tiers.filter(t => t !== tier) };
      } else {
        return { ...prev, tierRestrictions: [...tiers, tier] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.usageLimit === '') dataToSave.usageLimit = null; // Send null for unlimited
    onSave(dataToSave, coupon?._id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, pb: 1 }}>
        {coupon ? 'Edit Coupon' : 'Add New Coupon'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" id="coupon-form" onSubmit={handleSubmit}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField 
              name="code" 
              label="Coupon Code" 
              value={formData.code} 
              onChange={handleChange} 
              fullWidth 
              required 
              helperText="Must be unique. Will be uppercased." 
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
              sx={{ 
                '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }} 
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Discount Type</InputLabel>
                  <Select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    label="Discount Type"
                    sx={{ 
                      borderRadius: 2, 
                      fontFamily: theme.typography.fontFamily,
                      '& .MuiSelect-select': { fontFamily: theme.typography.fontFamily }
                    }}
                  >
                    <MenuItem value="percentage" sx={{ fontFamily: theme.typography.fontFamily }}>Percentage (%)</MenuItem>
                    <MenuItem value="fixed" sx={{ fontFamily: theme.typography.fontFamily }}>Fixed Amount (₹)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="discountValue" 
                  label="Discount Value" 
                  type="number" 
                  value={formData.discountValue} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
                  sx={{ 
                    '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }} 
                />
              </Grid>
            </Grid>
            <TextField 
              name="expiresAt" 
              label="Expires At" 
              type="datetime-local" 
              value={formData.expiresAt} 
              onChange={handleChange} 
              fullWidth 
              required 
              InputLabelProps={{ shrink: true, sx: { fontFamily: theme.typography.fontFamily } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="minPurchase" 
                  label="Minimum Purchase (₹)" 
                  type="number" 
                  value={formData.minPurchase} 
                  onChange={handleChange} 
                  fullWidth 
                  helperText="Leave blank for no minimum." 
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  sx={{ 
                    '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  name="usageLimit" 
                  label="Usage Limit" 
                  type="number" 
                  value={formData.usageLimit} 
                  onChange={handleChange} 
                  fullWidth 
                  helperText="Leave blank for unlimited uses." 
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  sx={{ 
                    '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily },
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Tier Restrictions */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontFamily: theme.typography.fontFamily, mb: 1, fontWeight: 'bold' }}>Available to Tiers</FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tierRestrictions.includes('bronze')}
                      onChange={() => handleTierChange('bronze')}
                      name="bronze"
                      sx={{ 
                        color: '#CD7F32',
                        '&.Mui-checked': { color: '#CD7F32' }
                      }}
                    />
                  }
                  label={<Chip label="Bronze" sx={{ bgcolor: '#CD7F32', color: 'white', fontWeight: 'bold', borderRadius: 1 }} />}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tierRestrictions.includes('silver')}
                      onChange={() => handleTierChange('silver')}
                      name="silver"
                      sx={{ 
                        color: '#C0C0C0',
                        '&.Mui-checked': { color: '#C0C0C0' }
                      }}
                    />
                  }
                  label={<Chip label="Silver" sx={{ bgcolor: '#C0C0C0', color: 'white', fontWeight: 'bold', borderRadius: 1 }} />}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tierRestrictions.includes('gold')}
                      onChange={() => handleTierChange('gold')}
                      name="gold"
                      sx={{ 
                        color: '#FFD700',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label={<Chip label="Gold" sx={{ bgcolor: '#FFD700', color: 'black', fontWeight: 'bold', borderRadius: 1 }} />}
                />
              </FormGroup>
            </FormControl>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading} 
          sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="coupon-form" 
          variant="contained" 
          disabled={loading} 
          sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
        >
          {loading ? <Loader size="small" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main ManageCoupons Component
const ManageCoupons = () => {
  const theme = useTheme();
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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

  const openConfirmDialog = (type, payload, title, message) => {
    setConfirmAction({ type, payload, title, message });
    setConfirmDialogOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, payload } = confirmAction;
    try {
      if (type === 'deleteCoupon') {
        await couponService.deleteCoupon(payload);
        fetchCoupons();
      }
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handleSaveCoupon = async (couponData, couponId) => {
    setFormLoading(true);
    try {
      // Ensure tierRestrictions is always an array
      if (!Array.isArray(couponData.tierRestrictions)) {
        couponData.tierRestrictions = ['bronze', 'silver', 'gold'];
      }
      
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

  const handleDeleteCoupon = (couponId) => {
    openConfirmDialog('deleteCoupon', couponId, 'Confirm Coupon Deletion', 'Are you sure you want to delete this coupon? This action cannot be undone.');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Coupons
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Create and manage discount codes for your store.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
            <TextField
              label="Search by Code"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} 
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily 
                },
                '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()} 
            sx={{ 
              borderRadius: 2, 
              fontFamily: theme.typography.fontFamily,
              px: 3
            }}
          >
            Add Coupon
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}><Loader size="large" /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Discount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Expires</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Usage</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Tiers</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coupons.length > 0 ? (
                    coupons.map((coupon) => {
                      const isExpired = isBefore(new Date(coupon.expiresAt), new Date());
                      const status = coupon.isActive && !isExpired ? 'Active' : 'Inactive';
                      return (
                        <TableRow 
                          key={coupon._id} 
                          hover
                          sx={{
                            '& td': { py: 1.5 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02)
                            }
                          }}
                        >
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Chip 
                              label={coupon.code} 
                              color="primary" 
                              variant="outlined" 
                              sx={{ 
                                fontWeight: 'bold',
                                borderRadius: 1,
                                fontFamily: theme.typography.fontFamily
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: theme.typography.fontFamily }}>
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                            </Typography>
                            {coupon.minPurchase > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'block' }}>
                                Min: ₹{coupon.minPurchase}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                              {format(new Date(coupon.expiresAt), 'PP')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              {format(new Date(coupon.expiresAt), 'p')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={status} 
                              color={status === 'Active' ? 'success' : 'error'} 
                              size="small" 
                              sx={{ borderRadius: 1, fontFamily: theme.typography.fontFamily }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                                {coupon.timesUsed}
                              </Typography>
                              {coupon.usageLimit && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                  / {coupon.usageLimit}
                                </Typography>
                              )}
                              {!coupon.usageLimit && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                  / ∞
                                </Typography>
                              )}
                            </Box>
                            {coupon.usageLimit && (
                              <Box sx={{ width: 80, height: 6, bgcolor: 'grey.200', borderRadius: 3, mt: 0.5, overflow: 'hidden' }}>
                                <Box 
                                  sx={{ 
                                    width: `${Math.min(100, (coupon.timesUsed / coupon.usageLimit) * 100)}%`, 
                                    height: '100%', 
                                    bgcolor: coupon.timesUsed >= coupon.usageLimit ? 'error.main' : 'success.main' 
                                  }} 
                                />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Stack direction="row" spacing={0.5}>
                              {coupon.tierRestrictions.includes('bronze') && <Chip label="B" size="small" sx={{ bgcolor: '#CD7F32', color: 'white', width: 24, height: 24, borderRadius: 1 }} />}
                              {coupon.tierRestrictions.includes('silver') && <Chip label="S" size="small" sx={{ bgcolor: '#C0C0C0', color: 'white', width: 24, height: 24, borderRadius: 1 }} />}
                              {coupon.tierRestrictions.includes('gold') && <Chip label="G" size="small" sx={{ bgcolor: '#FFD700', color: 'black', width: 24, height: 24, borderRadius: 1 }} />}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View Orders">
                                <IconButton 
                                  component={RouterLink} 
                                  to={`/admin/coupons/${coupon.code}/orders`}
                                  size="small"
                                  sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Coupon">
                                <IconButton 
                                  onClick={() => handleOpenDialog(coupon)}
                                  size="small"
                                  sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Coupon">
                                <IconButton 
                                  onClick={() => handleDeleteCoupon(coupon._id)} 
                                  color="error"
                                  size="small"
                                  sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
                                >
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
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                          <DiscountIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                            No coupons found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            Try adjusting your search criteria or add a new coupon
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
      <CouponFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveCoupon}
        coupon={editingCoupon}
        loading={formLoading}
      />
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: theme.typography.fontFamily, pb: 1 }}>
          <WarningAmberIcon color="warning" />
          {confirmAction?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
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
            color="error" 
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

export default ManageCoupons;