import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  Stack,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InventoryIcon from '@mui/icons-material/Inventory';
import productNotificationService from '../services/productNotificationService';
import { useAuth } from '../contexts/AuthContext';

const ProductAlerts = ({ product, showSnackbar }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [alertSnackbar, setAlertSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSettingAlert, setIsSettingAlert] = useState(false);

  const handleAlertSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertSnackbar({ ...alertSnackbar, open: false });
  };

  const setUpPriceDropAlert = async () => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to set up alerts', 'warning');
      return;
    }

    setIsSettingAlert(true);
    try {
      await productNotificationService.setUpPriceDropAlert(product._id);
      setAlertSnackbar({
        open: true,
        message: `You'll be notified when ${product.name} goes on sale!`,
        severity: 'success'
      });
    } catch (error) {
      setAlertSnackbar({
        open: true,
        message: 'Failed to set up price drop alert. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSettingAlert(false);
    }
  };

  const setUpRestockAlert = async () => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to set up alerts', 'warning');
      return;
    }

    setIsSettingAlert(true);
    try {
      await productNotificationService.setUpRestockAlert(product._id);
      setAlertSnackbar({
        open: true,
        message: `You'll be notified when ${product.name} is back in stock!`,
        severity: 'success'
      });
    } catch (error) {
      setAlertSnackbar({
        open: true,
        message: 'Failed to set up restock alert. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSettingAlert(false);
    }
  };

  return (
    <>
      <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: 'background.default' }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ fontFamily: theme.typography.fontFamily }}
        >
          <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Get Notified
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}
        >
          Be the first to know when this product goes on sale or comes back in stock.
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            startIcon={<TrendingDownIcon />}
            onClick={setUpPriceDropAlert}
            disabled={isSettingAlert || product.countInStock === 0}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              fontFamily: theme.typography.fontFamily,
              flex: 1
            }}
          >
            {isSettingAlert ? 'Setting Alert...' : 'Price Drop Alert'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<InventoryIcon />}
            onClick={setUpRestockAlert}
            disabled={isSettingAlert || product.countInStock > 0}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              fontFamily: theme.typography.fontFamily,
              flex: 1
            }}
          >
            {isSettingAlert ? 'Setting Alert...' : 'Restock Alert'}
          </Button>
        </Stack>
      </Box>

      <Snackbar 
        open={alertSnackbar.open} 
        autoHideDuration={6000} 
        onClose={handleAlertSnackbarClose}
      >
        <Alert 
          onClose={handleAlertSnackbarClose} 
          severity={alertSnackbar.severity}
          sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}
        >
          {alertSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductAlerts;