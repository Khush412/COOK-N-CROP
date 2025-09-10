import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import productService from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';

const ProductPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
              <Rating value={product.rating} />
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
            <Button variant="contained" size="large" sx={{ mt: 2 }}>
              Add to Cart
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Grid container spacing={5}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Customer Reviews
            </Typography>
            {product.reviews.length === 0 ? (
              <Alert severity="info">No reviews yet. Be the first to review this product!</Alert>
            ) : (
              <List>
                {product.reviews.map((review) => (
                  <ListItem key={review._id} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar>{review.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
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