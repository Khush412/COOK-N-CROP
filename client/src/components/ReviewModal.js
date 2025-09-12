import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Typography, CircularProgress, Alert
} from '@mui/material';
import Rating from './Rating';
import productService from '../services/productService';

const ReviewModal = ({ open, onClose, product, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    // Reset state on close
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await productService.createProductReview(product._id, { rating, comment });
      onReviewSubmitted(product._id);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Write a Review for {product.name}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate>
          <Typography component="legend">Your Rating</Typography>
          <Rating value={rating} onChange={(newValue) => setRating(newValue)} />
          <TextField
            label="Your Comment (Optional)"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;