import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Chip,
  Divider,
  Button,
  Stack,
  Grid,
  List,
  ListItemIcon,
  ListItemText,
  ListItem,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListSubheader,
  TextField,
  ListItemAvatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ThumbUp as ThumbUpIcon, ArrowBack as ArrowBackIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Delete as DeleteIcon, Report as ReportIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon,
  Timer as TimerIcon, RestaurantMenu as RestaurantMenuIcon, People as PeopleIcon, ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import communityService from '../services/communityService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';
import CommentForm from '../components/CommentForm';
import productService from '../services/productService';
import CommentThreadItem from '../components/CommentThreadItem';
import EditPostForm from '../components/EditPostForm';
import ReportDialog from '../components/ReportDialog';

const RecipeDisplay = ({ recipe, description, shoppableIngredients, onShopClick, isAdding }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="body1" sx={{ my: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        {description}
      </Typography>
      <Stack direction="row" spacing={3} sx={{ my: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1, justifyContent: 'space-around' }}>
        {recipe.prepTime && <Box sx={{ textAlign: 'center' }}><TimerIcon /><Typography variant="caption" display="block">Prep: {recipe.prepTime}</Typography></Box>}
        {recipe.cookTime && <Box sx={{ textAlign: 'center' }}><TimerIcon color="primary" /><Typography variant="caption" display="block">Cook: {recipe.cookTime}</Typography></Box>}
        {recipe.servings && <Box sx={{ textAlign: 'center' }}><PeopleIcon /><Typography variant="caption" display="block">Serves: {recipe.servings}</Typography></Box>}
      </Stack>
      {shoppableIngredients.length > 0 && (
        <Box sx={{ mt: 4, mb: 4, p: 2, bgcolor: 'success.lightest', borderRadius: 2, border: '1px solid', borderColor: 'success.light' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.dark', fontWeight: 'bold' }}>
            Shop the Recipe!
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We found {shoppableIngredients.length} matching ingredients in our store.
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={isAdding ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
            onClick={onShopClick}
            disabled={isAdding}
          >
            {isAdding ? 'Adding to Cart...' : 'Add Ingredients to Cart'}
          </Button>
        </Box>
      )}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>Ingredients</Typography>
          <List dense>
            {recipe.ingredients.map((ing, i) => <ListItem key={i} sx={{ py: 0.2 }}><ListItemText primary={`• ${ing}`} /></ListItem>)}
          </List>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>Instructions</Typography>
          <List dense>
            {recipe.instructions.map((inst, i) => <ListItem key={i} alignItems="flex-start" sx={{ py: 0.2 }}><ListItemText primary={`${i + 1}. ${inst}`} /></ListItem>)}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

const PostPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserSavedPosts } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [upvotingComments, setUpvotingComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingContent, setReportingContent] = useState(null); // { type: 'post' | 'comment', id: string }
  const [isReporting, setIsReporting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleteCommentConfirmOpen, setDeleteCommentConfirmOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [shoppableIngredients, setShoppableIngredients] = useState([]);
  const [isAddingIngredients, setIsAddingIngredients] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [recipeRating, setRecipeRating] = useState(0);
  const [recipeComment, setRecipeComment] = useState('');
  const [recipeReviewLoading, setRecipeReviewLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const data = await communityService.getPostById(id);
      setPost(data);

      // After post loads, fetch shoppable ingredients if it's a recipe
      if (data.isRecipe) {
        try {
          const shoppableData = await communityService.getShoppableIngredients(id);
          setShoppableIngredients(shoppableData);
        } catch (err) {
          console.error("Could not fetch shoppable ingredients", err);
          // Don't block the page, just log the error
        }
      }
    } catch (err) {
      setError('Failed to load the post. It may have been deleted or the link is incorrect.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [id, fetchPost]);

  const handleAddIngredientsToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + id);
      return;
    }
    if (shoppableIngredients.length === 0) return;

    setIsAddingIngredients(true);
    try {
      // Add each product to the cart. We assume quantity 1 for each.
      const addToCartPromises = shoppableIngredients.map(product =>
        productService.addToCart(product._id, 1)
      );
      await Promise.all(addToCartPromises);
      setSnackbar({ open: true, message: `${shoppableIngredients.length} ingredients added to your cart!`, severity: 'success' });
      // Navigate to cart after a short delay
      setTimeout(() => navigate('/cart'), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add ingredients to cart.', severity: 'error' });
    } finally {
      setIsAddingIngredients(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + postId);
      return;
    }
    if (isUpvoting) return;

    setIsUpvoting(true);

    const originalPost = { ...post };
    const hasUpvoted = post.upvotes.includes(user.id);

    // Optimistic UI update
    const updatedPost = {
      ...post,
      upvotes: hasUpvoted
        ? post.upvotes.filter((id) => id !== user.id)
        : [...post.upvotes, user.id],
      upvoteCount: hasUpvoted ? post.upvoteCount - 1 : post.upvoteCount + 1,
    };
    setPost(updatedPost);

    try {
      await communityService.toggleUpvote(postId);
    } catch (err) {
      setPost(originalPost); // Revert on error
      setSnackbar({ open: true, message: 'Failed to update vote.', severity: 'error' });
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCommentSubmit = async (commentData) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + id);
      return;
    }
    setIsCommenting(true);
    const payload = {
      content: commentData.content,
      parentCommentId: replyingTo, // Pass parent ID if it's a reply
    };
    try {
      await communityService.addComment(id, payload);
      setReplyingTo(null); // Close reply form
      await fetchPost(); // Refetch post to show new comment/reply
      setSnackbar({ open: true, message: 'Comment added!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add comment.', severity: 'error' });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCommentUpvote = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + id);
      return;
    }
    if (upvotingComments.includes(commentId)) return;

    setUpvotingComments(prev => [...prev, commentId]);

    const originalPost = JSON.parse(JSON.stringify(post)); // Deep copy for rollback

    // Recursive function to find and update a comment/reply in the state tree
    const updateCommentInTree = (comments) => {
      for (let comment of comments) {
        if (comment._id === commentId) {
          const hasUpvoted = (comment.upvotes || []).includes(user.id);
          comment.upvotes = hasUpvoted
            ? (comment.upvotes || []).filter(uid => uid !== user.id)
            : [...(comment.upvotes || []), user.id];
          comment.upvoteCount = comment.upvotes.length;
          return true;
        }
        if (comment.replies && updateCommentInTree(comment.replies)) {
          return true;
        }
      }
      return false;
    };

    // Create a new post object to avoid direct state mutation
    const newPostState = JSON.parse(JSON.stringify(post));
    updateCommentInTree(newPostState.comments);

    // Optimistically update the UI
    setPost(newPostState);

    try {
      await communityService.toggleCommentUpvote(commentId);
    } catch (err) {
      setPost(originalPost); // Revert on error
      setSnackbar({ open: true, message: 'Failed to update vote.', severity: 'error' });
    } finally {
      setUpvotingComments(prev => prev.filter(cid => cid !== commentId));
    }
  };

  const handleToggleSave = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + postId);
      return;
    }
    setIsSaving(true);
    try {
      const isCurrentlySaved = user?.savedPosts?.includes(postId);
      const res = await userService.toggleSavePost(postId);
      if (res.success) {
        updateUserSavedPosts(res.savedPosts);
        setSnackbar({ open: true, message: isCurrentlySaved ? 'Post unsaved.' : 'Post saved!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save post.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecipeReviewSubmit = async (e) => {
    e.preventDefault();
    if (!recipeRating) {
      setSnackbar({ open: true, message: 'Please select a rating.', severity: 'error' });
      return;
    }
    setRecipeReviewLoading(true);
    try {
      await communityService.addRecipeReview(id, { rating: recipeRating, comment: recipeComment });
      setSnackbar({ open: true, message: 'Recipe review submitted!', severity: 'success' });
      setRecipeRating(0);
      setRecipeComment('');
      fetchPost(); // Re-fetch post to show new review
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit review.', severity: 'error' });
    } finally {
      setRecipeReviewLoading(false);
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setLoading(true);
    try {
      await communityService.deletePost(id);
      setSnackbar({ open: true, message: 'Post deleted successfully.', severity: 'success' });
      navigate('/community');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete post.', severity: 'error' });
      setLoading(false);
    }
  };

  const handleUpdatePost = async (postData) => {
    setLoading(true);
    try {
      const updatedPost = await communityService.updatePost(id, postData);
      setPost(updatedPost);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update post.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportDialog = (type, contentId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + id);
      return;
    }
    setReportingContent({ type, id: contentId });
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportSubmit = async (reason) => {
    if (!reportingContent) return;
    setIsReporting(true);
    try {
      if (reportingContent.type === 'post') {
        await communityService.reportPost(reportingContent.id, reason);
      } else if (reportingContent.type === 'comment') {
        await communityService.reportComment(reportingContent.id, reason);
      }
      setSnackbar({ open: true, message: 'Content reported. Thank you for your feedback.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit report.', severity: 'error' });
    } finally {
      setIsReporting(false);
      setReportDialogOpen(false);
    }
  };

  const handleUpdateComment = async (commentId, commentData) => {
    setIsCommenting(true); // Reuse loading state for spinner
    try {
      await communityService.updateComment(commentId, commentData);
      await fetchPost(); // Refetch to show updated comment
      setSnackbar({ open: true, message: 'Comment updated!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update comment.', severity: 'error' });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsCommenting(true); // Reuse loading state for spinner
    try {
      await communityService.deleteComment(commentToDelete);
      await fetchPost(); // Refetch to show updated comment list
      setSnackbar({ open: true, message: 'Comment deleted.', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete comment.', severity: 'error' });
    } finally {
      setIsCommenting(false);
      setDeleteCommentConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  const openDeleteCommentConfirm = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteCommentConfirmOpen(true);
  };

  const handleReplyClick = (commentId) => {
    if (!isAuthenticated) navigate(`/login?redirect=/post/${id}`);
    setReplyingTo(commentId === replyingTo ? null : commentId); // Toggle reply form
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/community" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to Community
        </Button>
      </Container>
    );
  }

  if (!post) {
    return null; // Should be handled by error state
  }

  const hasUserReviewedRecipe = post.isRecipe && post.recipeReviews.some(review => review.user === user?.id);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        {/* Back Button */}
        <Button component={RouterLink} to="/community" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
          Back to Community
        </Button>

        {/* Post Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, position: 'relative' }}>
          <Avatar
            src={post.user.profilePic}
            alt={post.user.username}
            sx={{ width: 56, height: 56 }}
          >
            {!post.user.profilePic && post.user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
              {post.title}
            </Typography>
            {post.isRecipe && post.numRecipeReviews > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating value={post.recipeRating} readOnly precision={0.5} />
                <Typography sx={{ ml: 1.5 }} color="text.secondary">({post.numRecipeReviews} recipe reviews)</Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Posted by{' '}
              <Typography
                component={RouterLink}
                to={`/user/${post.user.username}`}
                sx={{ fontWeight: 'bold', textDecoration: 'none', color: theme.palette.text.primary, '&:hover': { textDecoration: 'underline' } }}
              >
                {post.user.username}
              </Typography> • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          {isAuthenticated && (user.id === post.user._id || user.role === 'admin') && (
            <Box>
              <IconButton
                aria-label="settings"
                id="post-actions-button"
                aria-controls={anchorEl ? 'post-actions-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
                onClick={handleMenuOpen}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="post-actions-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'post-actions-button',
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setDeleteConfirmOpen(true); handleMenuClose(); }}>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleOpenReportDialog('post', post._id)}>
                  <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Report</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {isEditing ? (
          <EditPostForm
            initialData={post}
            onSubmit={handleUpdatePost}
            onCancel={() => setIsEditing(false)}
            loading={loading}
          />
        ) : (
          <>
            {/* Post Content */}
            {post.isRecipe ? (
              <RecipeDisplay
                recipe={post.recipeDetails}
                description={post.content}
                shoppableIngredients={shoppableIngredients}
                onShopClick={handleAddIngredientsToCart}
                isAdding={isAddingIngredients}
              />
            ) : (
              <Typography variant="body1" sx={{ my: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {post.content}
              </Typography>
            )}

            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {post.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.primary.main + "20",
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ThumbUpIcon color={post.upvotes.includes(user?.id) ? 'primary' : 'action'} />}
                onClick={() => handleUpvote(post._id)}
                disabled={isUpvoting}
              >
                {post.upvoteCount} Upvotes
              </Button>
              <Button
                startIcon={user?.savedPosts?.includes(post._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={() => handleToggleSave(post._id)}
                disabled={isSaving}
              >
                {user?.savedPosts?.includes(post._id) ? 'Saved' : 'Save'}
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Recipe Reviews Section */}
        {post.isRecipe && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Recipe Reviews
            </Typography>
            {isAuthenticated ? (
              hasUserReviewedRecipe ? (
                <Alert severity="success">You have already reviewed this recipe.</Alert>
              ) : (
                <Box component="form" onSubmit={handleRecipeReviewSubmit} sx={{ mb: 4 }}>
                  <Typography component="legend">Leave a Review</Typography>
                  <Rating value={recipeRating} onChange={(newValue) => setRecipeRating(newValue)} />
                  <TextField
                    label="Your Review Comment"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    value={recipeComment}
                    onChange={(e) => setRecipeComment(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={recipeReviewLoading}
                    startIcon={recipeReviewLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {recipeReviewLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )
            ) : (
              <Alert severity="info">
                <RouterLink to={`/login?redirect=/post/${id}`}>Log in</RouterLink> to leave a recipe review.
              </Alert>
            )}

            {post.recipeReviews.length > 0 ? (
              <List>
                {post.recipeReviews.map((review) => (
                  <ListItem key={review._id} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar src={review.user?.profilePic}>{review.user?.username?.charAt(0).toUpperCase() || review.name.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Rating value={review.rating} readOnly />}
                      secondary={<>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', my: 1 }}>{review.comment}</Typography>
                        <Typography component="span" variant="caption" color="text.secondary">by {review.user?.username || review.name} on {new Date(review.createdAt).toLocaleDateString()}</Typography>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            ) : <Typography color="text.secondary" sx={{ mt: 2 }}>No recipe reviews yet.</Typography>}
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Comments Section */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Comments ({post.comments.length})
          </Typography>

          {isAuthenticated && !replyingTo ? ( // Only show main comment form if not replying
            <CommentForm onSubmit={handleCommentSubmit} loading={isCommenting} />
          ) : (
            !isAuthenticated && (
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                <RouterLink to={`/login?redirect=/post/${id}`}>Log in</RouterLink> or <RouterLink to={`/login?redirect=/post/${id}`}>sign up</RouterLink> to leave a comment.
              </Typography>
            )
          )}

          <List>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <CommentThreadItem
                  key={comment._id}
                  comment={comment}
                  replyingTo={replyingTo}
                  onReply={handleReplyClick}
                  onCancelReply={() => setReplyingTo(null)}
                  onCommentSubmit={handleCommentSubmit}
                  isSubmitting={isCommenting}
                  onCommentUpvote={handleCommentUpvote}
                  upvotingComments={upvotingComments}
                  onCommentUpdate={handleUpdateComment}
                  onCommentDelete={openDeleteCommentConfirm}
                  onReportComment={handleOpenReportDialog}
                />
              ))
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No comments yet. Be the first to share your thoughts!
              </Typography>
            )}
          </List>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Post Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteCommentConfirmOpen}
        onClose={() => setDeleteCommentConfirmOpen(false)}
        aria-labelledby="alert-dialog-comment-delete-title"
        aria-describedby="alert-dialog-comment-delete-description"
      >
        <DialogTitle id="alert-dialog-comment-delete-title">
          {"Confirm Comment Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-comment-delete-description">
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteComment} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
        loading={isReporting}
        contentType={reportingContent?.type}
      />
    </Container>
  );
};

export default PostPage;