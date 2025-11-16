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
          borderRadius: { xs: 2, sm: 3 },
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
        <CardContent sx={{ flexGrow: 1, pb: { xs: 1, sm: 2 } }}>
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
              fontSize: { xs: '1rem', sm: '1.25rem' }
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
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </Typography>
          )}
          
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: 1 }}>
            <Chip icon={<ThumbUpIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} label={item.upvoteCount || 0} size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 24, sm: 32 } }} />
            <Chip icon={<ChatBubbleOutlineIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} label={item.commentCount || 0} size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 24, sm: 32 } }} />
            <Chip icon={<VisibilityIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />} label={item.views || 0} size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 24, sm: 32 } }} />
          </Stack>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip 
            label={format(new Date(item.createdAt), 'MMM d, yyyy')} 
            size="small" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              height: { xs: 20, sm: 24 },
              '& .MuiChip-label': { fontSize: { xs: '0.6rem', sm: '0.7rem' } }
            }} 
          />
        </CardActions>
      </Card>
    );
  } else {
    return (
      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          transition: '0.3s',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: alpha(theme.palette.secondary.main, 0.3),
          },
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            "{item.content}"
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Commented on{' '}
            {item.post ? (
              <Link component={RouterLink} to={`/post/${item.post._id}`} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', '&:hover': { color: 'primary.dark' }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {item.post.title}
              </Link>
            ) : (
              <Typography component="span" sx={{ fontStyle: 'italic', color: 'text.disabled', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', mt: { xs: 6.5, sm: 8.5 } }}>
        <Loader size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 5 }, mt: { xs: 6.5, sm: 8.5 } }}>
      <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  const { posts, comments } = activityData;

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
      <Paper sx={{ p: { xs: 4, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
          My Activity
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
          A log of your posts and comments.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: { xs: 3.5, sm: 4, md: 4.5 }, borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3.5, sm: 4, md: 4.5 } }}>
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="center" sx={{ mb: { xs: 1, sm: 2 } }}>
          <TextField
            placeholder={`Search ${tabValue === 0 ? 'posts' : 'comments'}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '20px', height: { xs: 32, sm: 40 } },
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <Chip 
            label={`${filteredItems.length} ${tabValue === 0 ? 'post' : 'comment'}${filteredItems.length !== 1 ? 's' : ''}`} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              height: { xs: 24, sm: 32 },
              fontSize: { xs: '0.65rem', sm: '0.875rem' },
              minWidth: { xs: 60, sm: 80 }
            }} 
          />
        </Stack>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="my activity tabs" 
            centered
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': { 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 600,
                textTransform: 'none',
                minWidth: { xs: 60, sm: 120 },
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                p: { xs: 0.5, sm: 2 }
              }
            }}
          >
            <Tab icon={<PostAddIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} iconPosition="start" label={`My Posts (${posts.length})`} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }} />
            <Tab icon={<CommentIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} iconPosition="start" label={`My Comments (${comments.length})`} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }} />
          </Tabs>
        </Box>
      </Paper>

      {/* Posts Tab */}
      {tabValue === 0 && (
        <Box>
          {paginatedItems.length > 0 ? (
            <>
              <Grid container spacing={{ xs: 1, sm: 3 }}>
                {paginatedItems.map((post) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                    <ActivityCard item={post} type="post" />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 4 } }}>
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
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', mt: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 } }}>
              <HistoryIcon sx={{ fontSize: { xs: 32, sm: 48 }, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {searchTerm ? 'No posts found matching your search.' : 'You haven\'t made any posts yet.'}
              </Typography>
              {!searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
              <Grid container spacing={{ xs: 1, sm: 3 }}>
                {paginatedItems.map((comment) => (
                  <Grid size={{ xs: 12 }} key={comment._id}>
                    <ActivityCard item={comment} type="comment" />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 4 } }}>
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
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', mt: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 } }}>
              <HistoryIcon sx={{ fontSize: { xs: 32, sm: 48 }, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {searchTerm ? 'No comments found matching your search.' : 'You haven\'t made any comments yet.'}
              </Typography>
              {!searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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