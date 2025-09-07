import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import productService from '../services/productService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CartModal = ({ open, handleClose }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const fetchCart = async () => {
        try {
          setLoading(true);
          const data = await productService.getCart();
          setCart(data);
        } catch (err) {
          setError('Failed to load cart.');
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    }
  }, [open]);

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="cart-modal-title"
      aria-describedby="cart-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="cart-modal-title" variant="h6" component="h2">
          Your Cart
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 4 }}>{error}</Typography>
        ) : !cart || cart.items.length === 0 ? (
          <Typography sx={{ my: 4 }}>Your cart is empty.</Typography>
        ) : (
          <List>
            {cart.items.map((item) => (
              <React.Fragment key={item.product._id}>
                <ListItem>
                  <ListItemText
                    primary={`${item.product.name} x ${item.quantity}`}
                    secondary={`$${(item.product.price * item.quantity).toFixed(2)}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            <ListItem>
              <ListItemText primary="Total" />
              <Typography variant="subtitle1" fontWeight="bold">${calculateTotal()}</Typography>
            </ListItem>
          </List>
        )}
        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
          Proceed to Checkout
        </Button>
      </Box>
    </Modal>
  );
};

export default CartModal;
