import React, { useState } from "react";
import {
  Paper, 
  Box,
  Avatar,
  Typography,
  Chip,
  CardMedia,
  Divider,
  IconButton,
  Button,
  Tooltip,
  Stack,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbUp as ThumbUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MenuBook as MenuBookIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ChatBubbleOutlineOutlined as ChatBubbleOutlineOutlinedIcon,
  PushPin as PushPinIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import communityService from "../services/communityService";
import AddToCollectionDialog from "./AddToCollectionDialog";
import RichTextDisplay from "./RichTextDisplay";

const PostCard = ({
  showSnackbar,
  post,
  user,
  onUpvote = () => {},
  upvotingPosts = [],
  onToggleSave = () => {},
  savingPosts = [],
  displayMode = "full", // 'full', 'compact', or 'feed'
  sx = {},
  selectable = false, // New prop for collection selection
  selected = false, // New prop for selection state
  onSelect = () => {}, // New prop for selection handler
  variant = "card", // New prop for layout variant ('card' or 'list')
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [isFeatured, setIsFeatured] = useState(post.isFeatured);
  const [isPinned, setIsPinned] = useState(post.isPinned);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const isSaved = user && user.savedPosts && user.savedPosts.includes(post._id);

  // Check if the current user is a moderator of the post's group
  const isModerator = user && post.group && (post.group.moderators?.includes(user.id) || post.group.creator?._id === user.id || post.group.creator === user.id);
  // Check if the current view is a specific group page
  const isGroupPage = location.pathname.startsWith('/g/');

  const isAuthenticated = !!user;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: displayMode === 'compact' || variant === 'list' ? 'row' : 'column',
        borderRadius: displayMode === 'compact' || variant === 'list' ? 2 : 4,
        border: displayMode === 'compact' || variant === 'list' ? `1px solid ${theme.palette.divider}` : (
          isFeatured
            ? `2px solid ${theme.palette.secondary.main}`
            : `1px solid ${theme.palette.divider}`
        ),
        position: "relative",
        boxSizing: "border-box",
        boxShadow: displayMode === 'compact' || variant === 'list' ? 'none' : (isFeatured ? 3 : 1),
        transition: "all 0.2s ease",
        "&:hover": displayMode === 'compact' || variant === 'list' ? {
          borderColor: theme.palette.primary.light,
        } : {
          transform: 'translateY(-2px)',
          boxShadow: isFeatured ? 6 : 3,
        },
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
        cursor: selectable ? 'pointer' : 'default',
        height: displayMode === 'compact' || variant === 'list' ? 'auto' : '100%',
        ...sx,
        ...(selectable && selected && {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        }),
      }}
      onClick={(e) => {
        // Handle selection for collection view
        if (selectable) {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
          return;
        }
        
        // Only navigate if not clicking on a link or button
        if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('svg')) {
          window.location.href = `/post/${post._id}`;
        }
      }}
    >
      {/* Selection indicator */}
      {selectable && (
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: selected ? theme.palette.primary.main : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.2s ease',
        }}>
          {selected && (
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: theme.palette.common.white,
            }} />
          )}
        </Box>
      )}
      
      {/* Pinned Post Icon */}
      {isPinned && !selectable && (
        <Tooltip title="Pinned Post">
          <PushPinIcon
            sx={{
              position: "absolute",
              top: displayMode === 'compact' || variant === 'list' ? 8 : 16,
              right: 16,
              color: theme.palette.text.secondary,
              fontSize: displayMode === 'compact' || variant === 'list' ? 16 : 20,
              zIndex: 10,
              bgcolor: 'background.paper',
              borderRadius: '50%',
              p: displayMode === 'compact' || variant === 'list' ? 0.5 : 0.75,
              boxShadow: 2
            }}
          />
        </Tooltip>
      )}
      {/* Featured Star */}
      {isFeatured && !selectable && (
        <Tooltip title="Featured Post">
          <StarIcon
            sx={{
              position: "absolute",
              top: displayMode === 'compact' || variant === 'list' ? 8 : 16,
              right: isPinned ? (displayMode === 'compact' || variant === 'list' ? 36 : 52) : 16,
              color: theme.palette.secondary.main,
              fontSize: displayMode === 'compact' || variant === 'list' ? 16 : 20,
              zIndex: 10,
              bgcolor: 'background.paper',
              borderRadius: '50%',
              p: displayMode === 'compact' || variant === 'list' ? 0.5 : 0.75,
              boxShadow: 2
            }}
          />
        </Tooltip>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flex: '1 1 auto',
        p: displayMode === 'compact' ? 1.5 : 2.5, 
        pb: displayMode === 'compact' ? 1.5 : 1.5,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        justifyContent: 'flex-start',
      }}>
        {/* Header with author info */}
        <Box sx={{ mb: displayMode === 'compact' ? 1 : 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Avatar 
              src={post.user.profilePic ? (post.user.profilePic.startsWith('http') ? post.user.profilePic : `${process.env.REACT_APP_API_URL}${post.user.profilePic}`) : '/images/default-profile.png'}
              sx={{ width: 24, height: 24, fontSize: 12, boxShadow: 1 }}
              component={RouterLink}
              to={`/user/${post.user.username}`}
              onClick={(e) => e.stopPropagation()}
            >
              {post.user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <Typography
                  variant="body2"
                  component={RouterLink}
                  to={`/user/${post.user.username}`}
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                    fontFamily: theme.typography.fontFamily,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.user.username}
                </Typography>
                {post.group?.name && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography
                      variant="caption"
                      component={RouterLink}
                      to={`/g/${post.group.slug}`}
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                        fontFamily: theme.typography.fontFamily,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      g/{post.group.name}
                    </Typography>
                  </>
                )}
                <Typography variant="caption" color="text.secondary">
                  • {formatDate(post.createdAt)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Title */}
        <Box sx={{ mb: displayMode === 'compact' ? 1 : 1.5 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: "wrap" }}
          >
            {post.isRecipe && (
              <MenuBookIcon
                color="action"
                sx={{ fontSize: displayMode === 'compact' ? 16 : 20, verticalAlign: "middle" }}
              />
            )}
            <Typography
              variant={displayMode === 'compact' ? "subtitle1" : "h5"}
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: displayMode === 'compact' ? { xs: '1rem', sm: '1.1rem' } : { xs: '1.25rem', sm: '1.4rem' },
                flexGrow: 1,
                minWidth: 0,
                fontFamily: theme.typography.fontFamily,
                lineHeight: 1.3,
              }}
            >
              {/* Display Flair if available */}
              {post.flair && (
                <Chip
                  label={post.flair}
                  size="small"
                  sx={{
                    mr: 1,
                    borderRadius: 1,
                    fontFamily: theme.typography.fontFamily,
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    height: displayMode === 'compact' ? 20 : 24,
                    '& .MuiChip-label': {
                      fontSize: displayMode === 'compact' ? '0.65rem' : '0.75rem',
                      fontWeight: 700,
                      px: 0.5,
                    }
                  }}
                />
              )}
              {post.title}
            </Typography>
          </Stack>
        </Box>

        {/* Actions for compact view - moved all features from three-dot button */}
        {displayMode === 'compact' && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(post._id);
                }}
                disabled={upvotingPosts.includes(post._id)}
                aria-label="upvote post"
                sx={{
                  color: post.upvotes?.includes(user?.id)
                    ? theme.palette.primary.main
                    : theme.palette.action.active,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  width: 32,
                  height: 32,
                  p: 0.5,
                }}
              >
                <ThumbUpIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.8rem' }}>
                {post.upvoteCount}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/post/${post._id}`;
                }}
                aria-label="comment on post"
                sx={{
                  color: theme.palette.action.active,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  width: 32,
                  height: 32,
                  p: 0.5,
                }}
              >
                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.8rem' }}>
                {post.commentCount}
              </Typography>
            </Stack>
            
            {/* Save button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(post._id);
              }}
              disabled={savingPosts.includes(post._id)}
              aria-label="save post"
              sx={{
                color: isSaved ? theme.palette.secondary.main : theme.palette.action.active,
                "&:hover": {
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                },
                width: 32,
                height: 32,
                p: 0.5,
              }}
            >
              {isSaved ? <BookmarkIcon color="secondary" sx={{ fontSize: 16 }} /> : <BookmarkBorderIcon sx={{ fontSize: 16 }} />}
            </IconButton>
            
            {/* View button */}
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/post/${post._id}`;
              }}
              sx={{
                height: 24,
                minWidth: 'auto',
                fontSize: '0.7rem',
                px: 1,
                py: 0.2,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 3,
                }
              }}
            >
              View
            </Button>
            
            {/* Admin features */}
            {user?.role === "admin" && (
              <IconButton
                size="small"
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await communityService.toggleFeaturePost(post._id);
                  if (res.success) setIsFeatured(res.isFeatured);
                }}
                sx={{
                  color: isFeatured ? theme.palette.secondary.main : theme.palette.action.active,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  },
                  width: 32,
                  height: 32,
                  p: 0.5,
                }}
              >
                {isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            )}
            
            {/* Moderator features */}
            {isModerator && isGroupPage && (
              <IconButton
                size="small"
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await communityService.togglePinPost(post._id);
                  if (res.success) setIsPinned(res.isPinned);
                }}
                sx={{
                  color: isPinned ? theme.palette.primary.main : theme.palette.action.active,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  width: 32,
                  height: 32,
                  p: 0.5,
                }}
              >
                <PushPinIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Stack>
        )}
      </Box>

      {/* Media preview for compact view - fixed to eliminate gaps */}
      {displayMode === 'compact' && (
        <Box
          sx={{
            width: 130,
            minHeight: '100%',
            maxHeight: '100%',
            borderRadius: 1,
            overflow: 'hidden',
            flexShrink: 0,
            ml: 1,
            borderLeft: `1px solid ${theme.palette.divider}`,
            alignSelf: 'stretch',
            position: 'relative',
          }}
        >
          {post.media && post.media.length > 0 ? (
            post.media[0].mediaType === 'image' ? (
              <Box
                component="img"
                src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`}
                alt={post.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
              }}>
                <PlayArrowIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
              </Box>
            )
          ) : (
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
            }}>
              <ImageIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
            </Box>
          )}
        </Box>
      )}

      {/* Media for card view - show media or content preview for posts without images */}
      {displayMode !== 'compact' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: { xs: 200, sm: 250 },
            minHeight: { xs: 200, sm: 250 },
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
            mx: 2.5,
            mb: 2,
            borderRadius: 3,
            boxShadow: 1
          }}
        >
          {post.media && post.media.length > 0 ? (
            post.media[0].mediaType === 'image' ? (
              <img 
                src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`} 
                alt={post.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 250, maxWidth: '100%' }} 
              />
            ) : (
              <video 
                src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: 250, maxWidth: '100%' }} 
                controls 
              />
            )
          ) : (
            // For posts without media, show content preview to fill the space
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              p: 2,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }}>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  lineHeight: 1.5,
                  fontFamily: theme.typography.fontFamily,
                  px: 1,
                  maxHeight: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 8,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.content.replace(/<[^>]*>/g, '').substring(0, 400)}...
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* For compact view, show a simple placeholder when there's no media */}
      {displayMode === 'compact' && !post.media && (
        <Box
          sx={{
            width: 130,
            minHeight: '100%',
            maxHeight: '100%',
            borderRadius: 1,
            overflow: 'hidden',
            flexShrink: 0,
            ml: 1,
            borderLeft: `1px solid ${theme.palette.divider}`,
            alignSelf: 'stretch',
            position: 'relative',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImageIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
        </Box>
      )}

      {/* Recipe info and tags */}
      {displayMode !== 'compact' && (
        <Box sx={{ px: 2.5, pb: 1.5 }}>
          {/* Recipe info */}
          {post.isRecipe && post.recipeDetails && (
            <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
              {(post.recipeDetails.prepTime || post.recipeDetails.cookTime) && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {post.recipeDetails.prepTime ? `${post.recipeDetails.prepTime}m prep` : ''}
                    {post.recipeDetails.prepTime && post.recipeDetails.cookTime ? ', ' : ''}
                    {post.recipeDetails.cookTime ? `${post.recipeDetails.cookTime}m cook` : ''}
                  </Typography>
                </Stack>
              )}
              {post.recipeDetails.servings && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PeopleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {post.recipeDetails.servings} servings
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {post.tags.slice(0, 5).map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    height: 28, 
                    fontSize: 12,
                    borderRadius: '14px',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }} 
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Actions */}
      {displayMode !== 'compact' && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ 
            flexWrap: "wrap", 
            gap: 1, 
            fontFamily: theme.typography.fontFamily, 
            p: 2, 
            pt: 1.5, 
            borderTop: `1px solid ${theme.palette.divider}`,
            width: '100%'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(post._id);
                }}
                disabled={upvotingPosts.includes(post._id)}
                aria-label="upvote post"
                sx={{
                  color: post.upvotes?.includes(user?.id)
                    ? theme.palette.primary.main
                    : theme.palette.action.active,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  width: 36,
                  height: 36
                }}
              >
                <ThumbUpIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {post.upvoteCount}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {post.commentCount}
              </Typography>
            </Stack>
          </Stack>

          <AddToCollectionDialog
            open={collectionDialogOpen}
            onClose={() => setCollectionDialogOpen(false)}
            post={post}
            showSnackbar={showSnackbar}
          />

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(post._id);
              }}
              disabled={savingPosts.includes(post._id)}
              aria-label="save post"
              sx={{
                color: isSaved ? theme.palette.secondary.main : theme.palette.action.active,
                "&:hover": {
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                },
                width: 36,
                height: 36
              }}
            >
              {isSaved ? <BookmarkIcon color="secondary" sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            {isAuthenticated && post.isRecipe && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCollectionDialogOpen(true);
                }}
                aria-label="add to collection"
                sx={{ 
                  "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.1) },
                  width: 36,
                  height: 36
                }}
              >
                <CollectionsBookmarkIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <Button
              component={RouterLink}
              to={`/post/${post._id}`}
              size="small"
              variant="contained"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                fontSize: 13,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 3,
                },
                height: 32,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              View
            </Button>
            {user?.role === "admin" && (
              <Tooltip title={isFeatured ? "Unfeature Post" : "Feature Post"}>
                <IconButton
                  size="small"
                  sx={{ ml: 0.5, width: 36, height: 36 }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await communityService.toggleFeaturePost(post._id);
                    if (res.success) setIsFeatured(res.isFeatured);
                  }}
                >
                  {isFeatured ? <StarIcon color="secondary" sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
            )}
            {isModerator && isGroupPage && (
              <Tooltip title={isPinned ? "Unpin Post" : "Pin Post"}>
                <IconButton
                  size="small"
                  sx={{ ml: 0.5, width: 36, height: 36 }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await communityService.togglePinPost(post._id);
                    if (res.success) setIsPinned(res.isPinned);
                  }}
                >
                  <PushPinIcon color={isPinned ? "primary" : "action"} sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default PostCard;