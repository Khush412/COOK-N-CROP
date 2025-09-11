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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import productService from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();

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

    const newProductState = { ...product };
    newProductState.reviews[reviewIndex] = reviewToUpdate;
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/product/${id}`);
    setCartLoading(true);
    try {
      await productService.addToCart(product._id, 1);
      setQuantityInCart(1);
      setSnackbar({ open: true, message: 'Product added to cart!' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add product to cart.', severity: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/product/${id}`);
    setCartLoading(true);
    try {
      await productService.addToCart(product._id, 1); // Backend handles incrementing
      setQuantityInCart(prev => prev + 1);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to increase quantity.', severity: 'error' });
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

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{ width: '100%', borderRadius: 2, boxShadow: theme.shadows[4] }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} readOnly />
              <Typography sx={{ ml: 1.5 }} color="text.secondary">
                ({product.numReviews} reviews)
              </Typography>
            </Box>
            <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {quantityInCart === 0 ? (
                <Button variant="contained" size="large" onClick={handleAddToCart} disabled={cartLoading || !product.inStock}>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5, maxWidth: 'fit-content' }}>
                  <IconButton size="small" onClick={handleDecreaseQuantity} disabled={cartLoading}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ px: 2, minWidth: '30px', textAlign: 'center' }}>{quantityInCart}</Typography>
                  <IconButton size="small" onClick={handleIncreaseQuantity} disabled={cartLoading}>
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Grid container spacing={5}>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Customer Reviews ({filteredAndSortedReviews.length})
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Filter by Rating</InputLabel>
                  <Select
                    value={filterRating}
                    label="Filter by Rating"
                    onChange={(e) => setFilterRating(e.target.value)}
                  >
                    <MenuItem value={0}>All Ratings</MenuItem>
                    <MenuItem value={5}>5 Stars</MenuItem>
                    <MenuItem value={4}>4 Stars</MenuItem>
                    <MenuItem value={3}>3 Stars</MenuItem>
                    <MenuItem value={2}>2 Stars</MenuItem>
                    <MenuItem value={1}>1 Star</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select value={sortOption} label="Sort by" onChange={(e) => setSortOption(e.target.value)}>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="helpful">Most Helpful</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
            {product.reviews.length === 0 && (
              <Alert severity="info">No reviews yet. Be the first to review this product!</Alert>
            )}
            {product.reviews.length > 0 && filteredAndSortedReviews.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>No reviews match your current filters.</Alert>
            )}
            {filteredAndSortedReviews.length > 0 && (
              <List>
                {filteredAndSortedReviews.map((review) => (
                  <ListItem key={review._id} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar>{review.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText
                        primary={<Rating value={review.rating} readOnly />}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', my: 1 }}>
                              {review.comment}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              by {review.name} on {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2 }}>
                      <IconButton onClick={() => handleReviewUpvote(review._id)} disabled={upvotingReviewId === review._id}>
                        <ThumbUpIcon color={(review.upvotes || []).includes(user?.id) ? 'primary' : 'action'} />
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {(review.upvotes || []).length}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Write a Review
            </Typography>
            {isAuthenticated ? (
              hasUserReviewed ? (
                <Alert severity="success">You have already reviewed this product.</Alert>
              ) : (
                <Box component="form" onSubmit={handleReviewSubmit}>
                  <Typography component="legend">Your Rating</Typography>
                  <Rating value={rating} onChange={(newValue) => setRating(newValue)} />
                  <TextField
                    label="Your Comment"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={reviewLoading}
                    startIcon={reviewLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )
            ) : (
              <Alert severity="warning">
                Please <RouterLink to="/login">log in</RouterLink> to write a review.
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ProductPage;