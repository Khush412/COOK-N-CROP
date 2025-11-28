import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
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
  alpha,
  Collapse,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from './CommentForm';
import { useAuth } from '../contexts/AuthContext';
import {
  ThumbUp as ThumbUpIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, Report as ReportIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import RichTextDisplay from './RichTextDisplay';

const CommentThreadItem = ({
  comment,
  onReplyClick,
  replyingTo,
  onCancelReply,
  onCommentSubmit,
  isSubmitting,
  onUpvote,
  upvotingComments,
  onCommentUpdate,
  onCommentDelete,
  onReportComment,
  depth = 0,
  postGroup, // Pass the post's group object to check moderator status
}) => {
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [repliesExpanded, setRepliesExpanded] = useState(depth < 1); // Expand first level of replies by default
  const isReplying = replyingTo === comment._id;

  // Check if current user is the comment author, an admin, or a moderator of the post's group
  const isCommentAuthor = comment.user?._id === user?.id;
  const isGroupModerator = postGroup && ((postGroup.moderators && postGroup.moderators.some(mod => mod._id === user?.id)) || postGroup.creator?._id === user?.id);

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
    onUpvote(comment._id);
  };

  const handleReplySubmit = async (commentData) => {
    // Pass the parent comment ID when submitting a reply
    const replyData = {
      ...commentData,
      parentCommentId: comment._id
    };
    await onCommentSubmit(replyData);
  };

  return (
    <ListItem
      sx={{
        display: 'block',
        position: 'relative',
        p: isMobile ? 1.5 : 2,
        mb: isMobile ? 1.5 : 2,
        borderRadius: isMobile ? 1.5 : 2,
        bgcolor: 'background.paper',
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={isMobile ? 1.5 : 2}>
        <ListItemAvatar sx={{ minWidth: 'auto', mt: 1 }}>
          <Avatar 
            src={comment.user?.profilePic && comment.user.profilePic.startsWith('http') ? comment.user.profilePic : comment.user?.profilePic ? `${process.env.REACT_APP_API_URL}${comment.user.profilePic}` : undefined} 
            alt={comment.user?.username}
            sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, fontSize: isMobile ? 14 : 16 }}
          >
            {!comment.user?.profilePic && comment.user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {isAuthenticated && (user.id === comment.user?._id || user.role === 'admin') && !isEditing && (
            <Box sx={{ position: 'absolute', top: isMobile ? -6 : -8, right: isMobile ? -6 : -8 }}>
              <IconButton
                aria-label="comment actions"
                size={isMobile ? "small" : "medium"}
                onClick={handleMenuOpen}
              >
                <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {isCommentAuthor && ( // Only author can edit
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <MuiListItemText primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontSize: isMobile ? '0.875rem' : '1rem' }}>Edit</MuiListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={handleDelete}>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <MuiListItemText primaryTypographyProps={{ color: 'error.main', fontFamily: theme.typography.fontFamily, fontSize: isMobile ? '0.875rem' : '1rem' }}>Delete</MuiListItemText>
                </MenuItem>
                <MenuItem onClick={handleReport}>
                  <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                  <MuiListItemText primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontSize: isMobile ? '0.875rem' : '1rem' }}>Report</MuiListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {isEditing ? (
            <Box sx={{ pr: isMobile ? 3 : 4, mt: 1 }}>
              <CommentForm
                onSubmit={handleUpdateSubmit}
                loading={isSubmitting}
                initialContent={comment.content}
                submitLabel="Save"
              />
              <Button 
                size="small" 
                onClick={() => setIsEditing(false)} 
                disabled={isSubmitting} 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <ListItemText
              primary={
                <Typography
                  component={RouterLink}
                  to={`/user/${comment.user?.username}`}
                  variant="subtitle2"
                  sx={{ 
                    fontWeight: 600, 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    '&:hover': { textDecoration: 'underline' }, 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }}
                >
                  {comment.user?.username}
                </Typography>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <>
                  <Box
                    component="span"
                    sx={{ 
                      display: 'block', 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: theme.typography.fontFamily,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      position: 'relative',
                      '& a': {
                        pointerEvents: 'auto !important',
                        position: 'relative',
                        zIndex: 10,
                        cursor: 'pointer',
                      }
                    }}
                  >
                    <RichTextDisplay text={comment.content} />
                  </Box>
                  <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: isMobile ? '0.65rem' : '0.75rem'
                      }}
                    >
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={handleUpvote}
                        disabled={upvotingComments.includes(comment._id)}
                        aria-label="upvote comment"
                        sx={{ p: isMobile ? 0.5 : 1 }}
                      >
                        <ThumbUpIcon
                          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                          color={(comment.upvotes || []).includes(user?.id) ? 'primary' : 'action'}
                        />
                      </IconButton>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary', 
                          minWidth: '12px', 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: isMobile ? '0.65rem' : '0.75rem'
                        }}
                      >
                        {comment.upvoteCount > 0 ? comment.upvoteCount : ''}
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      onClick={() => onReplyClick(comment._id)}
                      sx={{ 
                        fontSize: isMobile ? '0.75rem' : '0.875rem', 
                        textTransform: 'none', 
                        fontFamily: theme.typography.fontFamily,
                        minWidth: 'auto',
                        p: isMobile ? '4px 8px' : '6px 12px'
                      }}
                    >
                      Reply
                    </Button>
                  </Stack>
                  {comment.replies && comment.replies.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => setRepliesExpanded(!repliesExpanded)}
                      startIcon={repliesExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
                      sx={{
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        textTransform: 'none',
                        fontFamily: theme.typography.fontFamily,
                        color: 'text.secondary',
                        mt: 1,
                        ml: -1,
                        p: isMobile ? 0.5 : 1
                      }}
                    >
                      {repliesExpanded ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length > 1 ? 'replies' : 'reply'}
                    </Button>
                  )}
                </>
              }
            />
          )}
          {isReplying && (
            <Box sx={{ mt: isMobile ? 1 : 2 }}>
              <CommentForm onSubmit={handleReplySubmit} loading={isSubmitting} />
              <Button 
                size="small" 
                onClick={onCancelReply} 
                sx={{ 
                  mt: isMobile ? -2 : -3, 
                  ml: isMobile ? 5 : 7, 
                  textTransform: 'none', 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Collapse in={repliesExpanded} timeout="auto" unmountOnExit>
          <List sx={{ pt: isMobile ? 1 : 2, pl: isMobile ? 1 : { xs: 2, sm: 4 }, borderLeft: '2px solid', borderColor: 'divider', ml: isMobile ? 1 : 2.5, mt: isMobile ? 1 : 2 }}>
            {comment.replies.map((reply) => ( // Pass postGroup to nested comments
              <CommentThreadItem 
                key={reply._id} 
                comment={reply} 
                onReplyClick={onReplyClick} 
                replyingTo={replyingTo} 
                onCancelReply={onCancelReply} 
                onCommentSubmit={onCommentSubmit} 
                isSubmitting={isSubmitting} 
                onUpvote={onUpvote} 
                upvotingComments={upvotingComments} 
                onCommentUpdate={onCommentUpdate} 
                onCommentDelete={onCommentDelete} 
                onReportComment={onReportComment} 
                depth={depth + 1} 
                postGroup={postGroup} 
              />
            ))}
          </List>
        </Collapse>
      )}
    </ListItem>
  );
};

export default CommentThreadItem;