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
        borderRadius: 3,
        border: isFeatured
          ? `2px solid ${theme.palette.secondary.main}`
          : `1px solid transparent`,
        position: "relative",
        boxSizing: "border-box",
        boxShadow: theme.shadows[3],
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.light,
        },
        width: "100%",
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
        pointerEvents: 'auto',
        '& a': {
          pointerEvents: 'auto !important',
        },
      }}
    >
      {post.media && post.media.length > 0 && (
        <CardMedia
          title={post.title}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: displayMode === 'feed' ? { xs: 300, sm: 400 } : { xs: 350, sm: 400 }, // Use a slightly larger height for feeds
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'black' : '#f0f2f5',
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
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <video 
              src={`${process.env.REACT_APP_API_URL}${post.media[0].url}`} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              controls 
            />
          )}
        </CardMedia>
      )}
      <Box sx={{ p: 2, pb: 0, '& a': { pointerEvents: 'auto !important' } }}>

      {/* Pinned Post Icon */}
      {isPinned && (
        <Tooltip title="Pinned Post">
          <PushPinIcon
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              color: theme.palette.text.secondary,
              fontSize: 22,
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
              top: 12,
              right: 12,
              color: theme.palette.secondary.main,
              fontSize: 24,
              zIndex: 10,
            }}
          />
        </Tooltip>
      )}

      {/* User Info */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          flexWrap: "wrap",
          mb: 1.5,
          fontFamily: theme.typography.fontFamily,
          position: 'relative',
        }}
      >
        <Avatar
          src={post.user.profilePic && post.user.profilePic.startsWith('http') ? post.user.profilePic : post.user.profilePic ? `${process.env.REACT_APP_API_URL}${post.user.profilePic}` : undefined}
          sx={{
            width: 40,
            height: 40,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/user/${post.user.username}`;
          }}
        >
          {!post.user.profilePic && post.user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box minWidth={0} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {/* Show Group Name if available on the post object */}
            {post.group?.name && (
              <Typography
                variant="subtitle2"
                component={RouterLink}
                to={`/g/${post.group.slug}`}
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  fontSize: 14,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                g/{post.group.name}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily }}>
              • Posted by
            </Typography>
            <Typography
              variant="caption"
              component={RouterLink}
              to={`/user/${post.user.username}`}
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {post.user.username}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily, display: 'block' }}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </Stack>

      {/* Title */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexWrap: "wrap", mb: 1, fontFamily: theme.typography.fontFamily }}
      >
        {post.isRecipe && (
          <MenuBookIcon
            color="action"
            sx={{ fontSize: 18, verticalAlign: "middle", mb: -0.5 }}
          />
        )}
        <Typography
          variant="subtitle1"
          noWrap={displayMode === 'compact'}
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: 16,
            flexGrow: 1,
            minWidth: 0,
            fontFamily: theme.typography.fontFamily,
            pointerEvents: 'none',
          }}
        >
          {/* Display Flair if available */}
          {post.flair && (
            <Chip
              label={post.flair}
              size="small"
              sx={{
                mr: 1,
                // In a more advanced version, you'd pass flair color/bg from the group settings
                bgcolor: alpha(theme.palette.secondary.main, 0.2),
              }}
            />
          )}
          {post.title}
        </Typography>
      </Stack>

      {displayMode === "full" && post.content && (
        <>
          {/* Content */}
          <Box
            sx={{
              whiteSpace: 'pre-wrap',
              color: theme.palette.text.secondary,
              fontSize: 13,
              lineHeight: 1.4,
              mb: 1.5,
              fontFamily: theme.typography.fontFamily,
              maxHeight: (post.media && post.media.length > 0) ? '3em' : (displayMode === 'feed' ? '9em' : '6em'),
              overflow: 'hidden',
              position: 'relative',
              '& a': {
                pointerEvents: 'auto',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 100,
              }
            }}
          >
            <RichTextDisplay text={post.content} />
          </Box>

          {/* Tags */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
            {(post.tags || []).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontSize: 12,
                  fontFamily: theme.typography.fontFamily,
                }}
              />
            ))}
          </Box>
        </>
      )}
      </Box>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ flexWrap: "wrap", gap: 1, fontFamily: theme.typography.fontFamily, p: 2, pt: 1 }}
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
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <ThumbUpIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              {post.upvoteCount}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
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
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
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
              sx={{ "&:hover": { bgcolor: alpha(theme.palette.secondary.main, 0.12) } }}
            >
              <CollectionsBookmarkIcon />
            </IconButton>
          )}
          <Button
            component={RouterLink}
            to={`/post/${post._id}`}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: "none",
              fontSize: 13,
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              "&:hover": {
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
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
