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

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: "column",
        borderRadius: 2,
        border: isFeatured
          ? `2px solid ${theme.palette.secondary.main}`
          : `1px solid ${theme.palette.divider}`,
        position: "relative",
        boxSizing: "border-box",
        boxShadow: 'none',
        transition: "border-color 0.2s ease",
        "&:hover": {
          borderColor: theme.palette.primary.light,
        },
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
        pointerEvents: 'auto',
        '& a': {
          pointerEvents: 'auto !important',
        },
      }}
    >
      {/* Pinned Post Icon */}
      {isPinned && (
        <Tooltip title="Pinned Post">
          <PushPinIcon
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.text.secondary,
              fontSize: 16,
              zIndex: 10,
            }}
          />
        </Tooltip>
      )}
      {/* Featured Star */}
      {isFeatured && (
        <Tooltip title="Featured Post">
          <StarIcon
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.secondary.main,
              fontSize: 16,
              zIndex: 10,
            }}
          />
        </Tooltip>
      )}

      <Box sx={{ p: 2, pb: 1, '& a': { pointerEvents: 'auto !important' } }}>
        {/* Group Name, Posted By, Time */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
          {/* Show Group Name if available on the post object */}
          {post.group?.name && (
            <Typography
              variant="body2"
              component={RouterLink}
              to={`/g/${post.group.slug}`}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                fontFamily: theme.typography.fontFamily,
              }}
            >
              g/{post.group.name}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily }}>
            • Posted by
          </Typography>
          
          <Typography
            variant="body2"
            component={RouterLink}
            to={`/user/${post.user.username}`}
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              fontFamily: theme.typography.fontFamily,
              pr: 1  // Added padding to the right of the username
            }}
          >
            {post.user.username}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary, 
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        </Stack>

        {/* Title */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: "wrap", mb: 1.5, fontFamily: theme.typography.fontFamily }}
        >
          {post.isRecipe && (
            <MenuBookIcon
              color="action"
              sx={{ fontSize: 16, verticalAlign: "middle" }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              flexGrow: 1,
              minWidth: 0,
              fontFamily: theme.typography.fontFamily,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              // Only navigate if not clicking on a link
              if (!e.target.closest('a')) {
                window.location.href = `/post/${post._id}`;
              }
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  height: 20,
                  '& .MuiChip-label': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }
                }}
              />
            )}
            {post.title}
          </Typography>
        </Stack>
      </Box>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: { xs: 300, sm: 400 },
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            // Only navigate if not clicking on a link
            if (!e.target.closest('a')) {
              window.location.href = `/post/${post._id}`;
            }
          }}
        >
          {post.media[0].mediaType === 'image' ? (
            <img 
              src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`} 
              alt={post.title} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 400 }} 
            />
          ) : (
            <video 
              src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 400 }} 
              controls 
            />
          )}
        </Box>
      )}

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ flexWrap: "wrap", gap: 1, fontFamily: theme.typography.fontFamily, p: 2, pt: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onUpvote(post._id)}
              disabled={upvotingPosts.includes(post._id)}
              aria-label="upvote post"
              sx={{
                color: post.upvotes?.includes(user?.id)
                  ? theme.palette.primary.main
                  : theme.palette.action.active,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ThumbUpIcon fontSize="small" />
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
            onClick={() => onToggleSave(post._id)}
            disabled={savingPosts.includes(post._id)}
            aria-label="save post"
            sx={{
              color: isSaved ? theme.palette.secondary.main : theme.palette.action.active,
              "&:hover": {
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
              },
            }}
          >
            {isSaved ? <BookmarkIcon color="secondary" /> : <BookmarkBorderIcon />}
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
              sx={{ "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.1) } }}
            >
              <CollectionsBookmarkIcon />
            </IconButton>
          )}
          <Button
            component={RouterLink}
            to={`/post/${post._id}`}
            size="small"
            variant="text"
            sx={{
              fontWeight: 600,
              textTransform: "none",
              fontSize: 13,
              borderRadius: 1,
              px: 1,
              py: 0.5,
              color: theme.palette.text.secondary,
              minWidth: 'auto',
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.active, 0.1),
              },
            }}
          >
            Read More
          </Button>
          {user?.role === "admin" && (
            <Tooltip title={isFeatured ? "Unfeature Post" : "Feature Post"}>
              <IconButton
                size="small"
                sx={{ ml: 0.5 }}
                onClick={async () => {
                  const res = await communityService.toggleFeaturePost(post._id);
                  if (res.success) setIsFeatured(res.isFeatured);
                }}
              >
                {isFeatured ? <StarIcon color="secondary" /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          {isModerator && isGroupPage && (
            <Tooltip title={isPinned ? "Unpin Post" : "Pin Post"}>
              <IconButton
                size="small"
                sx={{ ml: 0.5 }}
                onClick={async () => {
                  const res = await communityService.togglePinPost(post._id);
                  if (res.success) setIsPinned(res.isPinned);
                }}
              >
                <PushPinIcon color={isPinned ? "primary" : "action"} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PostCard;
