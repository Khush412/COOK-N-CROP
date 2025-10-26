import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Rating,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductComparison = ({ open, onClose, productIds }) => {
  const theme = useTheme();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && productIds && productIds.length > 0) {
      fetchProducts();
    }
  }, [open, productIds]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch each product individually
      const productPromises = productIds.map(id => productService.getProductById(id));
      const productResults = await Promise.all(productPromises);
      setProducts(productResults);
    } catch (err) {
      setError('Failed to load products for comparison');
      console.error('Error fetching products for comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    try {
      await addToCart(productId, 1);
      // Show success message
    } catch (err) {
      // Handle error
      console.error('Error adding to cart:', err);
    }
  };

  const formatPrice = (price) => {
    return `₹${price?.toFixed(2) || 'N/A'}`;
  };

  const getEffectivePrice = (product) => {
    return product.salePrice || product.price;
  };

  const getDiscountPercent = (product) => {
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: theme.typography.fontFamily,
        fontWeight: 700,
        pb: 1
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            Product Comparison
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1, pb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
              Loading products...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" sx={{ fontFamily: theme.typography.fontFamily }}>
              {error}
            </Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
              No products to compare
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="product comparison table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 600, 
                    width: '25%',
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }}>
                    Features
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      align="center" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 600,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        p: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`}
                          alt={product.name}
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            objectFit: 'cover', 
                            borderRadius: 2,
                            mb: 1
                          }}
                        />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily, 
                            fontWeight: 600,
                            textAlign: 'center',
                            mb: 1
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Rating value={product.rating} readOnly size="small" />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            color: 'text.secondary'
                          }}
                        >
                          ({product.numReviews} reviews)
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Price
                  </TableCell>
                  {products.map((product) => {
                    const effectivePrice = getEffectivePrice(product);
                    const discountPercent = getDiscountPercent(product);
                    return (
                      <TableCell 
                        key={product._id} 
                        align="center" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily, 
                              fontWeight: 600,
                              color: discountPercent > 0 ? 'error.main' : 'primary.main'
                            }}
                          >
                            {formatPrice(effectivePrice)}
                          </Typography>
                          {discountPercent > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: theme.typography.fontFamily,
                                  textDecoration: 'line-through',
                                  color: 'text.secondary'
                                }}
                              >
                                {formatPrice(product.price)}
                              </Typography>
                              <Chip 
                                label={`-${discountPercent}%`} 
                                color="error" 
                                size="small" 
                                sx={{ 
                                  fontFamily: theme.typography.fontFamily,
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Category
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      align="center" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          bgcolor: 'background.default'
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Brand
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      align="center" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      {product.brand || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Availability
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      align="center" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Chip 
                        label={product.countInStock > 0 ? 'In Stock' : 'Out of Stock'} 
                        color={product.countInStock > 0 ? 'success' : 'error'} 
                        size="small" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Description
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          color: 'text.secondary'
                        }}
                      >
                        {product.description?.substring(0, 100)}...
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    Tags
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              variant="outlined" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                height: 20
                              }}
                            />
                          ))
                        ) : (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              color: 'text.secondary'
                            }}
                          >
                            No tags
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      borderBottom: 'none'
                    }}
                  >
                    Actions
                  </TableCell>
                  {products.map((product) => (
                    <TableCell 
                      key={product._id} 
                      align="center" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: 'none'
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.countInStock === 0}
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          borderRadius: '50px',
                          textTransform: 'none'
                        }}
                      >
                        Add to Cart
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            borderRadius: '50px',
            textTransform: 'none'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductComparison;