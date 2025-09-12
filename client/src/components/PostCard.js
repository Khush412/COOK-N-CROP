import React, { useState } from 'react';
import { Paper, Box, Avatar, Typography, Chip, Divider, IconButton, Button, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbUp as ThumbUpIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, MenuBook as MenuBookIcon, Star as StarIcon } from '@mui/icons-material';
import communityService from '../services/communityService';

const PostCard = ({ post, user, onUpvote, upvotingPosts, onToggleSave, savingPosts }) => {
  const theme = useTheme();
  const [isFeatured, setIsFeatured] = useState(post.isFeatured);
  const isSaved = user?.savedPosts?.includes(post._id);

  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: 'flex',
        flexDirection: 'column',
        border: isFeatured ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
        position: 'relative',
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {isFeatured && (
        <Tooltip title="Featured Post">
          <StarIcon sx={{ position: 'absolute', top: 8, right: 8, color: 'secondary.main' }} />
        </Tooltip>
      )}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          src={post.user.profilePic}
          sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, mr: 2, fontWeight: 600 }}
          component={RouterLink}
          to={`/user/${post.user.username}`}
        >
          {!post.user.profilePic && post.user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
            component={RouterLink}
            to={`/user/${post.user.username}`}
          >
            {post.user.username}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {post.isRecipe && (
          <MenuBookIcon color="action" sx={{ fontSize: '1.2rem' }} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          {post.title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          mb: 2,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flexGrow: 1,
        }}
      >
        {post.content}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onUpvote(post._id)}
              disabled={upvotingPosts.includes(post._id)}
              aria-label="upvote post"
            >
              <ThumbUpIcon
                fontSize="small"
                color={(post.upvotes || []).includes(user?.id) ? 'primary' : 'action'}
              />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{post.upvoteCount}</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center' }}>
            💬 {post.commentCount} comments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
                size="small"
                onClick={() => onToggleSave(post._id)}
                disabled={savingPosts.includes(post._id)}
                aria-label="save post"
            >
                {isSaved ? <BookmarkIcon color="secondary" /> : <BookmarkBorderIcon />}
            </IconButton>
            <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to={`/post/${post._id}`}
            >
                Read More
            </Button>
            {user?.role === 'admin' && (
              <Button
                size="small"
                onClick={async () => {
                  const res = await communityService.toggleFeaturePost(post._id);
                  if (res.success) {
                    setIsFeatured(res.isFeatured);
                  }
                }}
                color={isFeatured ? 'secondary' : 'primary'}
              >
                {isFeatured ? 'Unfeature' : 'Feature'}
              </Button>
            )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PostCard;
