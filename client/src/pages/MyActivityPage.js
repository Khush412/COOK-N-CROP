import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import CommentIcon from '@mui/icons-material/Comment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import userService from '../services/userService';

const MyActivityPage = () => {
  const [activityData, setActivityData] = useState({ posts: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchActivity = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getMyActivity();
        setActivityData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load your activity.');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { posts, comments } = activityData;

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        My Activity
      </Typography>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="my activity tabs">
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`My Posts (${posts.length})`} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`My Comments (${comments.length})`} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {posts.length > 0 ? (
              <List>
                {posts.map((post) => (
                  <ListItem key={post._id} button component={RouterLink} to={`/post/${post._id}`} divider>
                    <ListItemText primary={post.title} secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>You haven't made any posts yet.</Typography>
            )}
          </Box>
        )}

        {/* Comments Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {comments.length > 0 ? (
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment._id} button component={RouterLink} to={`/post/${comment.post._id}`} divider>
                    <ListItemText
                      primary={<Typography sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comment.content}</Typography>}
                      secondary={`Commented on "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>You haven't made any comments yet.</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MyActivityPage;