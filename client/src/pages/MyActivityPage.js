import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab,
  Grid,
  Link,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Comment as CommentIcon,
  PostAdd as PostAddIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
} from '@mui/icons-material';
import userService from '../services/userService';
import Loader from '../custom_components/Loader';

const ActivityCard = ({ item, type }) => {
  const theme = useTheme();
  
  if (type === 'post') {
    return (
      <Card
        component={RouterLink}
        to={`/post/${item._id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          textDecoration: 'none',
          color: 'inherit',
          transition: '0.3s',
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          '&:hover': {
            boxShadow: theme.shadows[6],
            borderColor: alpha(theme.palette.primary.main, 0.3),
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </Typography>
          
          {item.content && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </Typography>
          )}
          
          <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
            <Chip icon={<ThumbUpIcon />} label={item.upvoteCount || 0} size="small" variant="outlined" />
            <Chip icon={<ChatBubbleOutlineIcon />} label={item.commentCount || 0} size="small" variant="outlined" />
            <Chip icon={<VisibilityIcon />} label={item.views || 0} size="small" variant="outlined" />
          </Stack>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip 
            label={format(new Date(item.createdAt), 'MMM d, yyyy')} 
            size="small" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              height: 20,
              '& .MuiChip-label': { fontSize: '0.7rem' }
            }} 
          />
        </CardActions>
      </Card>
    );
  } else {
    return (
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          transition: '0.3s',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: alpha(theme.palette.secondary.main, 0.3),
          },
        }}
      >
        <CardContent>
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 4,
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
        </CardContent>
      </Card>
    );
  }
};

const MyActivityPage = () => {
  const theme = useTheme();
  const [activityData, setActivityData] = useState({ posts: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

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

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    const items = tabValue === 0 ? activityData.posts : activityData.comments;
    return items.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.post && item.post.title && item.post.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activityData, tabValue, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, page]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Loader size="large" />
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
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder={`Search ${tabValue === 0 ? 'posts' : 'comments'}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '20px' },
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <Chip 
            label={`${filteredItems.length} ${tabValue === 0 ? 'post' : 'comment'}${filteredItems.length !== 1 ? 's' : ''}`} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              height: 32,
            }} 
          />
        </Stack>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="my activity tabs" 
            centered
            sx={{ 
              '& .MuiTab-root': { 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
              }
            }}
          >
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`My Posts (${posts.length})`} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`My Comments (${comments.length})`} />
          </Tabs>
        </Box>
      </Paper>

      {/* Posts Tab */}
      {tabValue === 0 && (
        <Box>
          {paginatedItems.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedItems.map((post) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                    <ActivityCard item={post} type="post" />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ 
                      '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                      '& .Mui-selected': { fontWeight: 'bold' }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: 3 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
                {searchTerm ? 'No posts found matching your search.' : 'You haven\'t made any posts yet.'}
              </Typography>
              {!searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Start sharing your thoughts with the community!
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}

      {/* Comments Tab */}
      {tabValue === 1 && (
        <Box>
          {paginatedItems.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedItems.map((comment) => (
                  <Grid size={{ xs: 12 }} key={comment._id}>
                    <ActivityCard item={comment} type="comment" />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ 
                      '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                      '& .Mui-selected': { fontWeight: 'bold' }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: 3 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
                {searchTerm ? 'No comments found matching your search.' : 'You haven\'t made any comments yet.'}
              </Typography>
              {!searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Join the conversation by commenting on posts!
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}
    </Container>
  );
};

export default MyActivityPage;