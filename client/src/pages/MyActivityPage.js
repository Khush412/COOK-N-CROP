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
  Grid,
  Link,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import CommentIcon from '@mui/icons-material/Comment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import HistoryIcon from '@mui/icons-material/History';
import userService from '../services/userService';

const ActivityCard = ({ item, type }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': {
          boxShadow: theme.shadows[3],
          borderColor: 'primary.main',
        },
      }}
    >
      {type === 'post' ? (
        <>
          <Typography variant="subtitle1" fontWeight="bold" component={RouterLink} to={`/post/${item._id}`} sx={{ textDecoration: 'none', color: 'text.primary', fontFamily: theme.typography.fontFamily, '&:hover': { color: 'primary.main' }, mb: 0.5, display: 'block' }}>
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        </>
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: theme.typography.fontFamily,
            }}
          >
            "{item.content}"
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Commented on{' '}
            {item.post ? (
              <Link component={RouterLink} to={`/post/${item.post._id}`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', '&:hover': { color: 'primary.dark' } }}>
                {item.post.title}
              </Link>
            ) : (
              <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.disabled', fontFamily: theme.typography.fontFamily }}>
                a deleted post
              </Typography>
            )}
            {' '}{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
        </>
      )}
    </Paper>
  );
};

const MyActivityPage = () => {
  const theme = useTheme();
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
      <Container maxWidth="md" sx={{ py: 4, mt: 12 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { posts, comments } = activityData;

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          My Activity
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          A log of your posts and comments.
        </Typography>
      </Paper>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="my activity tabs" centered>
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`My Posts (${posts.length})`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`My Comments (${comments.length})`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {posts.length > 0 ? (
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                    <ActivityCard item={post} type="post" />
                    {/* Added fontFamily to Typography */}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: 2 }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>You haven't made any posts yet.</Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Comments Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {comments.length > 0 ? (
              <Grid container spacing={2}>
                {comments.map((comment) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={comment._id}>
                    <ActivityCard item={comment} type="comment" />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: 2 }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>You haven't made any comments yet.</Typography>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MyActivityPage;