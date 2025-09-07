import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import productService from '../services/productService';

const ProductCard = ({ product, showSnackbar }) => {
  const theme = useTheme();
  const [quantityInCart, setQuantityInCart] = useState(0);

  useEffect(() => {
    const fetchInitialQuantity = async () => {
      try {
        const cartData = await productService.getCart();
        const item = cartData.items.find(item => item.product._id === product._id);
        if (item) {
          setQuantityInCart(item.quantity);
        } else {
          setQuantityInCart(0);
        }
      } catch (error) {
        console.error("Error fetching initial cart quantity:", error);
        setQuantityInCart(0);
      }
    };
    fetchInitialQuantity();
  }, [product._id]);

  const handleAddToCart = async () => {
    try {
      await productService.addToCart(product._id, 1);
      const cartData = await productService.getCart();
      const item = cartData.items.find(item => item.product._id === product._id);
      setQuantityInCart(item ? item.quantity : 0);
      showSnackbar('Product added to cart!', 'success');
    } catch (error) {
      showSnackbar('Failed to add product to cart.', 'error');
    }
  };

  const handleIncreaseQuantity = async () => {
    try {
      await productService.addToCart(product._id, 1);
      const cartData = await productService.getCart();
      const item = cartData.items.find(item => item.product._id === product._id);
      setQuantityInCart(item ? item.quantity : 0);
      showSnackbar('Quantity increased!', 'info');
    } catch (error) {
      showSnackbar('Failed to increase quantity.', 'error');
    }
  };

  const handleDecreaseQuantity = async () => {
    try {
      if (quantityInCart > 1) {
        await productService.updateCartItemQuantity(product._id, quantityInCart - 1);
      } else if (quantityInCart === 1) {
        await productService.removeCartItem(product._id);
      }
      const cartData = await productService.getCart();
      const item = cartData.items.find(item => item.product._id === product._id);
      setQuantityInCart(item ? item.quantity : 0);
      showSnackbar('Quantity decreased!', 'info');
    } catch (error) {
      showSnackbar('Failed to update quantity.', 'error');
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 246, // Smaller width
        borderRadius: 3, // More rounded corners
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Softer shadow
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        display: 'flex', // Use flexbox for internal layout
        flexDirection: 'column',
        height: '100%', // Ensure cards in a row have same height
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          height="160" // Adjusted height for better aspect ratio with smaller width
          image={product.image || 'https://via.placeholder.com/250x160?text=No+Image'}
          alt={product.name}
          sx={{ objectFit: 'cover', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
        />
      </Link>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, lineHeight: 1.2, mb: 1 }}
        >
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1.5, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="h6" color="primary.main" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700 }}>
            ${product.price.toFixed(2)}
          </Typography>
          {quantityInCart === 0 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              sx={{ fontFamily: theme.typography.fontFamily, fontSize: 12, px: 1.5, py: 0.5 }}
            >
              Add to Cart
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: theme.palette.primary.main, borderRadius: 1, overflow: 'hidden' }}>
              <IconButton
                size="small"
                onClick={handleDecreaseQuantity}
                sx={{ borderRadius: 0, p: 0.5, color: theme.palette.primary.main }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, mx: 0.5 }}>
                {quantityInCart}
              </Typography>
              <IconButton
                size="small"
                onClick={handleIncreaseQuantity}
                sx={{ borderRadius: 0, p: 0.5, color: theme.palette.primary.main }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
