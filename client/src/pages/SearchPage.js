import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import postService from '../services/postService';

const PostItem = ({ post }) => (
  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={post.user.profilePic} sx={{ width: 32, height: 32, mr: 1.5 }} />
        <Box>
          <Typography variant="subtitle2">{post.user.username}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" component={RouterLink} to={`/post/${post._id}`} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
        {post.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.content}
      </Typography>
    </CardContent>
    <Divider />
    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button size="small" startIcon={<ThumbUpIcon />} disabled>
          {post.upvoteCount}
        </Button>
        <Button size="small" startIcon={<CommentIcon />} disabled>
          {post.commentCount}
        </Button>
      </Box>
      <Button component={RouterLink} to={`/post/${post._id}`} size="small">
        View
      </Button>
    </CardActions>
  </Card>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState({ posts: [], pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);
  const page = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);
  const sort = useMemo(() => searchParams.get('sort') || 'relevance', [searchParams]);

  useEffect(() => {
    if (!query) {
      setResults({ posts: [], pages: 0 });
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await postService.searchPosts({ search: query, page, sort, limit: 12 });
        setResults(data);
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, sort]);

  const handlePageChange = (event, value) => {
    setSearchParams({ q: query, sort, page: value });
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSearchParams({ q: query, sort: newSort, page: 1 });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Results
        </Typography>
        {query ? (
          <Typography color="text.secondary">
            Showing results for: <strong>"{query}"</strong>
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Please enter a search term in the navigation bar.
          </Typography>
        )}
      </Paper>

      {query && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <ToggleButtonGroup
            value={sort}
            exclusive
            onChange={handleSortChange}
            aria-label="sort results"
          >
            <ToggleButton value="relevance" aria-label="sort by relevance">
              Relevance
            </ToggleButton>
            <ToggleButton value="new" aria-label="sort by new">
              Newest
            </ToggleButton>
            <ToggleButton value="top" aria-label="sort by top">
              Top
            </ToggleButton>
            <ToggleButton value="discussed" aria-label="sort by most discussed">
              Discussed
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : results.posts.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {results.posts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <PostItem post={post} />
              </Grid>
            ))}
          </Grid>
          {results.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination
                count={results.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        query && <Alert severity="info">No posts found matching your search criteria.</Alert>
      )}
    </Container>
  );
};

export default SearchPage;