import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
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
  Card,
  TextField,
  ListItemAvatar,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ThumbUp as ThumbUpIcon, ArrowBack as ArrowBackIcon, MoreVert as MoreVertIcon, Edit as EditIcon,
  Delete as DeleteIcon, Report as ReportIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon,
  Timer as TimerIcon, People as PeopleIcon, ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import communityService from '../services/communityService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';
import CommentForm from '../components/CommentForm';
import productService from '../services/productService';
import CommentThreadItem from '../components/CommentThreadItem';
import CreatePostForm from '../components/CreatePostForm';
import ReportDialog from '../components/ReportDialog';

const RecipeDisplay = ({ recipe, description, shoppableIngredients, onShopClick, isAdding }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="body1" sx={{ my: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: theme.typography.fontFamily }}>
        {description}
      </Typography>
      <Paper elevation={0} sx={{ my: 3, p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'space-around', textAlign: 'center' }}>
          {recipe.prepTime && <Box><TimerIcon sx={{ color: 'primary.main' }} /><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{recipe.prepTime} mins</Typography><Typography variant="caption" display="block" sx={{ fontFamily: theme.typography.fontFamily }}>Prep Time</Typography></Box>}
          {recipe.cookTime && <Box><TimerIcon sx={{ color: 'primary.main' }} /><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{recipe.cookTime} mins</Typography><Typography variant="caption" display="block" sx={{ fontFamily: theme.typography.fontFamily }}>Cook Time</Typography></Box>}
          {recipe.servings && <Box><PeopleIcon sx={{ color: 'primary.main' }} /><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{recipe.servings}</Typography><Typography variant="caption" display="block" sx={{ fontFamily: theme.typography.fontFamily }}>Servings</Typography></Box>}
        </Stack>
      </Paper>
      {shoppableIngredients.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, mb: 4, p: 3, borderRadius: 3, background: `linear-gradient(45deg, ${theme.palette.secondary.light}, ${theme.palette.primary.light})` }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.contrastText, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
            Shop the Recipe!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: alpha(theme.palette.primary.contrastText, 0.9), fontFamily: theme.typography.fontFamily }}>
            We found {shoppableIngredients.length} matching ingredients in our store.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={isAdding ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
            onClick={onShopClick}
            disabled={isAdding}
            sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
          >
            {isAdding ? 'Adding to Cart...' : 'Add Ingredients to Cart'}
          </Button>
        </Paper>
      )}
      <Grid container spacing={5} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Ingredients</Typography>
          <List sx={{ listStyleType: 'disc', pl: 2, '& .MuiListItem-root': { display: 'list-item' } }}>
            {recipe.ingredients.map((ing, i) => <ListItem key={i} sx={{ py: 0.5, pl: 1 }}><ListItemText primary={ing} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} /></ListItem>)}
          </List>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Instructions</Typography>
          <List sx={{ listStyleType: 'decimal', pl: 2, '& .MuiListItem-root': { display: 'list-item' } }}>
            {recipe.instructions.map((inst, i) => <ListItem key={i} alignItems="flex-start" sx={{ py: 0.5, pl: 1 }}><ListItemText primary={inst} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} /></ListItem>)}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

const TaggedProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const theme = useTheme();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
      setSnackbar({ open: true, message: `${product.name} added to cart!` });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  // Add a guard clause in case a product was deleted and populates as null
  if (!product) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderRadius: 2, transition: 'box-shadow .2s', '&:hover': { boxShadow: theme.shadows[3] } }}>
      <Avatar src={product.image} variant="rounded" sx={{ width: 60, height: 60, mr: 2 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{product.name}</Typography>
        <Typography variant="body2" color="primary" sx={{ fontFamily: theme.typography.fontFamily }}>
          {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'Price not available'}
        </Typography>
      </Box>
      <Button variant="contained" size="small" onClick={handleAddToCart} disabled={isAdding || product.countInStock === 0} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
        {product.countInStock > 0 ? (isAdding ? <CircularProgress size={20} /> : 'Add') : 'Out of Stock'}
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Paper>
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
      if (post.isRecipe) {
        navigate('/recipes');
      } else {
        navigate('/community');
      }
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
        {/* Back Button - uses navigate(-1) to go to the previous page */}
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
          Back
        </Button>

        {/* Post Header */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          {isAuthenticated && (user.id === post.user._id || user.role === 'admin') && (
            <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
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
                disableScrollLock={true}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                  }
                }}
                MenuListProps={{
                  'aria-labelledby': 'post-actions-button',
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setDeleteConfirmOpen(true); handleMenuClose(); }}>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ color: 'error.main', fontFamily: theme.typography.fontFamily }}>Delete</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleOpenReportDialog('post', post._id)}>
                  <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}>Report</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={post.user.profilePic} alt={post.user.username} sx={{ width: 56, height: 56 }}
              component={RouterLink} to={`/user/${post.user.username}`}
            >
              {!post.user.profilePic && post.user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
                {post.title}
              </Typography>
              {post.isRecipe && post.numRecipeReviews > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={post.recipeRating} readOnly precision={0.5} />
                  <Typography sx={{ ml: 1.5, fontFamily: theme.typography.fontFamily }} color="text.secondary">({post.numRecipeReviews} recipe reviews)</Typography>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                Posted by{' '}
                <Typography component={RouterLink} to={`/user/${post.user.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' }, fontFamily: theme.typography.fontFamily }}>
                  {post.user.username}
                </Typography> • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt={post.title}
            sx={{
              width: '100%',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: 2,
              mb: 3,
            }}
          />
        )}
        {isEditing ? (
          <CreatePostForm
            initialData={post}
            onSubmit={handleUpdatePost}
            onCancel={() => setIsEditing(false)}
            loading={loading}
            forceRecipe={post.isRecipe}
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
              <Typography variant="body1" sx={{ my: 3, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: theme.typography.fontFamily }}>
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
                  sx={{ borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.dark, fontWeight: 600, fontFamily: theme.typography.fontFamily }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ThumbUpIcon color={post.upvotes.includes(user?.id) ? 'primary' : 'action'} />}
                onClick={() => handleUpvote(post._id)}
                disabled={isUpvoting}
                sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
              >
                {post.upvoteCount} Upvotes
              </Button>
              <Button
                variant="outlined"
                startIcon={user?.savedPosts?.includes(post._id) ? <BookmarkIcon color="secondary" /> : <BookmarkBorderIcon />}
                onClick={() => handleToggleSave(post._id)}
                disabled={isSaving}
                sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
              >
                {user?.savedPosts?.includes(post._id) ? 'Saved' : 'Save'}
              </Button>
            </Stack>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Tagged Products Section */}
        {!isEditing && post.isRecipe && post.taggedProducts && post.taggedProducts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Products Used in this Recipe
            </Typography>
            <Grid container spacing={2}>
              {post.taggedProducts.filter(p => p).map(product => (
                <Grid size={{ xs: 12, sm: 6 }} key={product._id}>
                  <TaggedProductCard product={product} />
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Recipe Reviews Section */}
        {!isEditing && post.isRecipe && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
              Recipe Reviews
            </Typography>
            {isAuthenticated ? (
              hasUserReviewedRecipe ? (
                <Alert severity="success">You have already reviewed this recipe.</Alert>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontFamily: theme.typography.fontFamily }}>Leave a Review</Typography>
                  <Box component="form" onSubmit={handleRecipeReviewSubmit}>
                    <Typography component="legend" sx={{ fontFamily: theme.typography.fontFamily }}>Your Rating</Typography>
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={recipeReviewLoading}
                      startIcon={recipeReviewLoading ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{ mt: 1, borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}
                    >
                      {recipeReviewLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Box>
                </Paper>
              )
            ) : (
              <Alert severity="info">
                <RouterLink to={`/login?redirect=/post/${id}`} style={{ fontFamily: theme.typography.fontFamily }}>Log in</RouterLink> to leave a recipe review.
              </Alert>
            )}

            {post.recipeReviews.length > 0 ? (
              <List>
                {post.recipeReviews.map((review) => (
                  <Paper key={review._id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={review.user?.profilePic}>{review.user?.username?.charAt(0).toUpperCase() || review.name.charAt(0).toUpperCase()}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{review.user?.username || review.name}</Typography>
                        <Rating value={review.rating} readOnly />
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1.5, pl: 7, fontFamily: theme.typography.fontFamily }}>{review.comment}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1, fontFamily: theme.typography.fontFamily }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))}
              </List>
            ) : <Typography color="text.secondary" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>No recipe reviews yet.</Typography>}
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Comments Section */}
        <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily }}>
            Comments ({post.comments.length})
          </Typography>

          {isAuthenticated && !replyingTo ? ( // Only show main comment form if not replying
            <CommentForm onSubmit={handleCommentSubmit} loading={isCommenting} />
          ) : (
            !isAuthenticated && (
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                <RouterLink to={`/login?redirect=/post/${id}`} style={{ fontFamily: theme.typography.fontFamily }}>Log in</RouterLink> or <RouterLink to={`/login?redirect=/post/${id}`} style={{ fontFamily: theme.typography.fontFamily }}>sign up</RouterLink> to leave a comment.
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
                  depth={0}
                />
              ))
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
                No comments yet. Be the first to share your thoughts!
              </Typography>
            )}
          </List>
        </Paper>
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
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: theme.typography.fontFamily }}>
          {"Confirm Post Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus sx={{ fontFamily: theme.typography.fontFamily }}>
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
        <DialogTitle id="alert-dialog-comment-delete-title" sx={{ fontFamily: theme.typography.fontFamily }}>
          {"Confirm Comment Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-comment-delete-description" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentConfirmOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>Cancel</Button>
          <Button onClick={handleDeleteComment} color="error" autoFocus sx={{ fontFamily: theme.typography.fontFamily }}>
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