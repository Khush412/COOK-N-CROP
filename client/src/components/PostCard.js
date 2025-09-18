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
import { Link as RouterLink } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbUp as ThumbUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MenuBook as MenuBookIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import communityService from "../services/communityService";

const PostCard = ({
  post,
  user,
  onUpvote,
  upvotingPosts,
  onToggleSave,
  savingPosts,
  displayMode = "full", // Add a prop to control display, 'full' or 'compact'
}) => {
  const theme = useTheme();
  const [isFeatured, setIsFeatured] = useState(post.isFeatured);
  const isSaved = user?.savedPosts?.includes(post._id);

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: isFeatured
          ? `2px solid ${theme.palette.secondary.main}`
          : `1px solid transparent`,
        position: "relative",
        boxSizing: "border-box",
        boxShadow: theme.shadows[3],
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[8],
        },
        width: "100%",
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
      }}
    >
      {post.image && (
        <CardMedia
          component={RouterLink}
          to={`/post/${post._id}`}
          image={post.image}
          title={post.title}
          sx={{
            aspectRatio: '16/9',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)',
            }
          }}
        />
      )}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <Box>

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
        }}
      >
        <Avatar
          src={post.user.profilePic}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            width: 40,
            height: 40,
            fontSize: 20,
          }}
          component={RouterLink}
          to={`/user/${post.user.username}`}
        >
          {!post.user.profilePic && post.user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box minWidth={0} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle2"
              component={RouterLink}
              to={`/user/${post.user.username}`}
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                fontSize: 14,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {post.user.username}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily }}>
              • {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </Typography>
          </Stack>
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
          noWrap
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: 16,
            flexGrow: 1,
            minWidth: 0,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {post.title}
        </Typography>
      </Stack>

      {displayMode === "full" && (
        <>
          {/* Content */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: 13,
              lineHeight: 1.4,
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: post.image ? 2 : 4,
              WebkitBoxOrient: "vertical",
              mb: 1.5,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {post.content}
          </Typography>

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

      <Divider sx={{ my: 1 }} />

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ flexWrap: "wrap", gap: 1, fontFamily: theme.typography.fontFamily }}
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
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            💬 {post.commentCount}
          </Typography>
        </Stack>

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
        </Stack>
      </Stack>
    </Box>
    </Paper>
  );
};

export default PostCard;
