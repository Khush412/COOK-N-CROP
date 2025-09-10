import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Button,
  Stack,
  List,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from './CommentForm';
import { useAuth } from '../contexts/AuthContext';
import communityService from '../services/communityService';
import { ThumbUp as ThumbUpIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, Report as ReportIcon } from '@mui/icons-material';

const CommentThreadItem = ({
  comment,
  onReply,
  replyingTo,
  onCancelReply,
  onCommentSubmit,
  isSubmitting,
  onCommentUpvote,
  upvotingComments,
  onCommentUpdate,
  onCommentDelete,
  onReportComment,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isReplying = replyingTo === comment._id;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    onCommentDelete(comment._id);
    handleMenuClose();
  };

  const handleReport = () => {
    onReportComment('comment', comment._id);
    handleMenuClose();
  };

  const handleUpdateSubmit = (commentData) => {
    onCommentUpdate(comment._id, commentData);
    setIsEditing(false);
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/post/' + comment.post);
      return;
    }
    onCommentUpvote(comment._id);
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        display: 'block', // To allow full-width children
        pl: comment.parentComment ? 4 : 0, // Indent replies
        position: 'relative',
        '&:not(:first-of-type)': {
          mt: 2
        }
      }}
    >
      <Stack direction="row" spacing={2}>
        <ListItemAvatar sx={{ minWidth: 'auto', mt: 1 }}>
          <Avatar src={comment.user?.profilePic} alt={comment.user?.username}>
            {!comment.user?.profilePic && comment.user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {isAuthenticated && (user.id === comment.user?._id || user.role === 'admin') && !isEditing && (
            <Box sx={{ position: 'absolute', top: -8, right: -8 }}>
              <IconButton
                aria-label="comment actions"
                size="small"
                onClick={handleMenuOpen}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <MuiListItemText>Edit</MuiListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <MuiListItemText sx={{ color: 'error.main' }}>Delete</MuiListItemText>
                </MenuItem>
                <MenuItem onClick={handleReport}>
                  <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                  <MuiListItemText>Report</MuiListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {isEditing ? (
            <Box sx={{ pr: 4, mt: 1 }}>
              <CommentForm
                onSubmit={handleUpdateSubmit}
                loading={isSubmitting}
                initialContent={comment.content}
                submitLabel="Save"
              />
              <Button size="small" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
            </Box>
          ) : (
            <ListItemText
              primary={
                <Typography
                  component={RouterLink}
                  to={`/user/${comment.user?.username}`}
                  variant="subtitle2"
                  sx={{ fontWeight: 600, textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
                >
                  {comment.user?.username}
                </Typography>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block', whiteSpace: 'pre-wrap' }}
                >
                  {comment.content}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={handleUpvote}
                      disabled={upvotingComments.includes(comment._id)}
                      aria-label="upvote comment"
                    >
                      <ThumbUpIcon
                        sx={{ fontSize: '1rem' }}
                        color={(comment.upvotes || []).includes(user?.id) ? 'primary' : 'action'}
                      />
                    </IconButton>
                    <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: '12px' }}>{comment.upvoteCount > 0 ? comment.upvoteCount : ''}</Typography>
                  </Box>
                  <Button size="small" onClick={() => onReply(comment._id)} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                    Reply
                  </Button>
                </Stack>
                </>
              }
            />
          )}
          {isReplying && (
            <Box sx={{ mt: 2 }}>
              <CommentForm onSubmit={onCommentSubmit} loading={isSubmitting} />
              <Button size="small" onClick={onCancelReply} sx={{ mt: -3, ml: 7, textTransform: 'none' }}>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <List sx={{ pt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider', ml: 2.5 }}>
          {comment.replies.map((reply) => (
            <CommentThreadItem key={reply._id} comment={reply} onReply={onReply} replyingTo={replyingTo} onCancelReply={onCancelReply} onCommentSubmit={onCommentSubmit} isSubmitting={isSubmitting} onCommentUpvote={onCommentUpvote} upvotingComments={upvotingComments} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentDelete} onReportComment={onReportComment} />
          ))}
        </List>
      )}
    </ListItem>
  );
};

export default CommentThreadItem;