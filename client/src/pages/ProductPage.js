import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  Snackbar,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import userService from '../services/userService';
import productService from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantityInCart, setQuantityInCart] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [upvotingReviewId, setUpvotingReviewId] = useState(null);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [filterRating, setFilterRating] = useState(0); // 0 for all
  const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'helpful'

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);

      // After product loads, check cart status if user is logged in
      if (isAuthenticated) {
        try {
          const cartData = await productService.getCart();
          const itemInCart = cartData.items.find(item => item.product._id === id);
          setQuantityInCart(itemInCart ? itemInCart.quantity : 0);
        } catch (cartError) {
          console.error("Failed to fetch cart status:", cartError);
          // Don't block product page from rendering if cart fails
        }
      }
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchProduct();
  }, [id, fetchProduct]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setReviewError('Please select a rating.');
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    try {
      await productService.createProductReview(id, { rating, comment });
      setSnackbar({ open: true, message: 'Review submitted successfully!' });
      setRating(0);
      setComment('');
      fetchProduct(); // Re-fetch product to show new review
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewUpvote = async (reviewId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    if (upvotingReviewId) return;

    setUpvotingReviewId(reviewId);

    const originalProduct = JSON.parse(JSON.stringify(product));
    const reviewIndex = product.reviews.findIndex(r => r._id === reviewId);
    if (reviewIndex === -1) return;

    const reviewToUpdate = { ...product.reviews[reviewIndex] };
    const hasUpvoted = (reviewToUpdate.upvotes || []).includes(user.id);

    // Optimistic UI update
    reviewToUpdate.upvotes = hasUpvoted
      ? (reviewToUpdate.upvotes || []).filter(uid => uid !== user.id)
      : [...(reviewToUpdate.upvotes || []), user.id];

    // Create a new reviews array to ensure React detects the change
    const newReviews = [...product.reviews];
    newReviews[reviewIndex] = reviewToUpdate;

    const newProductState = { ...product, reviews: newReviews };
    setProduct(newProductState);
    try {
      await productService.toggleReviewUpvote(id, reviewId);
    } catch (err) {
      setProduct(originalProduct); // Revert on error
      setSnackbar({ open: true, message: 'Failed to update vote.', severity: 'error' });
    } finally {
      setUpvotingReviewId(null);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    setIsFavoriting(true);
    try {
      const res = await userService.toggleWishlist(product._id);
      if (res.success) {
        updateUserWishlist(res.wishlist);
        setSnackbar({ open: true, message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update wishlist.', severity: 'error' });
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/product/${id}`);
    setCartLoading(true);
    try {
      await productService.addToCart(product._id, 1);
      setQuantityInCart(1);
      setSnackbar({ open: true, message: 'Product added to cart!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to add product to cart.', severity: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/product/${id}`);
    if (quantityInCart >= product.countInStock) {
      setSnackbar({ open: true, message: 'Cannot add more than available stock.', severity: 'warning' });
      return;
    }
    setCartLoading(true);
    try {
      await productService.addToCart(product._id, 1); // Backend handles incrementing
      setQuantityInCart(prev => prev + 1);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to increase quantity.', severity: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleDecreaseQuantity = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/product/${id}`);
    setCartLoading(true);
    try {
      if (quantityInCart > 1) {
        await productService.updateCartItemQuantity(product._id, quantityInCart - 1);
        setQuantityInCart(prev => prev - 1);
      } else {
        await productService.removeCartItem(product._id);
        setQuantityInCart(0);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update cart.', severity: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const filteredAndSortedReviews = useMemo(() => {
    if (!product?.reviews) return [];

    let reviews = [...product.reviews];

    // Filter by rating
    if (filterRating > 0) {
      reviews = reviews.filter(review => review.rating === filterRating);
    }

    // Sort reviews
    if (sortOption === 'helpful') {
      reviews.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    } else { // 'newest' is default
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return reviews;
  }, [product?.reviews, filterRating, sortOption]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const hasUserReviewed = product.reviews.some(review => review.user === user?.id);
  const isWishlisted = user?.wishlist?.includes(product._id);

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{ width: '100%', display: 'block' }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {product.category}
            </Typography>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} readOnly />
              <Typography sx={{ ml: 1.5, fontFamily: theme.typography.fontFamily }} color="text.secondary">
                ({product.numReviews} reviews)
              </Typography>
            </Box>
            <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontFamily: theme.typography.fontFamily }}>
              {product.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
              Status: {product.countInStock > 0 ? (
                <Chip label="In Stock" color="success" />
              ) : (
                <Chip label="Out of Stock" color="error" />
              )}
              {product.countInStock > 0 && product.countInStock <= 10 && (
                <Typography variant="caption" color="warning.main" sx={{ ml: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                  (Only {product.countInStock} left!)
                </Typography>
              )}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 4 }}>
              {quantityInCart === 0 ? (
                <Button variant="contained" size="large" onClick={handleAddToCart} disabled={cartLoading || product.countInStock === 0} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', px: 4, py: 1.5, borderRadius: '50px' }}>
                  {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: '50px', p: 0.5 }}>
                  <IconButton size="small" onClick={handleDecreaseQuantity} disabled={cartLoading}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ px: 2, minWidth: '30px', textAlign: 'center', fontFamily: theme.typography.fontFamily }}>{quantityInCart}</Typography>
                  <IconButton size="small" onClick={handleIncreaseQuantity} disabled={cartLoading || quantityInCart >= product.countInStock}>
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
              {isAuthenticated && (
                <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                  <IconButton onClick={handleToggleWishlist} disabled={isFavoriting} size="large" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                Customer Reviews ({filteredAndSortedReviews.length})
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Filter by Rating</InputLabel>
                  <Select
                    value={filterRating}
                    label="Filter by Rating"
                    onChange={(e) => setFilterRating(e.target.value)}
                    sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
                  >
                    <MenuItem value={0} sx={{ fontFamily: theme.typography.fontFamily }}>All Ratings</MenuItem>
                    <MenuItem value={5} sx={{ fontFamily: theme.typography.fontFamily }}>5 Stars</MenuItem>
                    <MenuItem value={4} sx={{ fontFamily: theme.typography.fontFamily }}>4 Stars</MenuItem>
                    <MenuItem value={3} sx={{ fontFamily: theme.typography.fontFamily }}>3 Stars</MenuItem>
                    <MenuItem value={2} sx={{ fontFamily: theme.typography.fontFamily }}>2 Stars</MenuItem>
                    <MenuItem value={1} sx={{ fontFamily: theme.typography.fontFamily }}>1 Star</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort by</InputLabel>
                  <Select value={sortOption} label="Sort by" onChange={(e) => setSortOption(e.target.value)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>
                    <MenuItem value="newest" sx={{ fontFamily: theme.typography.fontFamily }}>Newest</MenuItem>
                    <MenuItem value="helpful" sx={{ fontFamily: theme.typography.fontFamily }}>Most Helpful</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
            {product.reviews.length === 0 && (
              <Alert severity="info" sx={{ fontFamily: theme.typography.fontFamily }}>No reviews yet. Be the first to review this product!</Alert>
            )}
            {product.reviews.length > 0 && filteredAndSortedReviews.length === 0 && (
              <Alert severity="info" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>No reviews match your current filters.</Alert>
            )}
            {filteredAndSortedReviews.length > 0 && (
              <List>
                {filteredAndSortedReviews.map((review) => (
                  <Paper key={review._id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={review.user?.profilePic}>{review.user?.username?.charAt(0) || review.name.charAt(0)}</Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{review.user?.username || review.name}</Typography>
                        <Rating value={review.rating} readOnly />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleReviewUpvote(review._id)} disabled={upvotingReviewId === review._id}>
                          <ThumbUpIcon fontSize="small" color={(review.upvotes || []).includes(user?.id) ? 'primary' : 'action'} />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                          {(review.upvotes || []).length}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1.5, pl: { xs: 0, sm: 7 }, fontFamily: theme.typography.fontFamily }}>{review.comment}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1, fontFamily: theme.typography.fontFamily }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))}
              </List>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
              Write a Review
            </Typography>
            {isAuthenticated ? (
              hasUserReviewed ? (
                <Alert severity="success" sx={{ fontFamily: theme.typography.fontFamily }}>You have already reviewed this product.</Alert>
              ) : (
                <Box component="form" onSubmit={handleReviewSubmit}>
                  <Typography component="legend" sx={{ fontFamily: theme.typography.fontFamily }}>Your Rating</Typography>
                  <Rating value={rating} onChange={(newValue) => setRating(newValue)} />
                  <TextField
                    label="Your Comment"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  />
                  {reviewError && <Alert severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>{reviewError}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={reviewLoading}
                    startIcon={reviewLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ mt: 1, borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )
            ) : (
              <Alert severity="warning" sx={{ fontFamily: theme.typography.fontFamily }}>
                Please <RouterLink to="/login" style={{ fontFamily: theme.typography.fontFamily }}>log in</RouterLink> to write a review.
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity || 'success'} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductPage;