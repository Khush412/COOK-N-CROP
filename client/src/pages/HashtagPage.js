import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Chip,
  Paper,
  Pagination,
} from '@mui/material';
import { Tag as TagIcon, TrendingUp } from '@mui/icons-material';
import PostCard from '../components/PostCard';
import searchService from '../services/searchService';

const HashtagPage = () => {
  const { hashtag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchTrendingHashtags();
  }, [hashtag, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await searchService.searchByHashtag(hashtag, page);
      setPosts(data.posts || []);
      setTotalPages(data.pages || 1);
      setTotalPosts(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch hashtag posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      const data = await searchService.getTrendingHashtags(10);
      setTrendingHashtags(data || []);
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleHashtagClick = (tag) => {
    navigate(`/search/hashtag/${tag}`);
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TagIcon fontSize="large" color="secondary" />
          <Typography variant="h3" component="h1" fontWeight="bold">
            #{hashtag}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} with this hashtag
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No posts found with #{hashtag}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Be the first to use this hashtag!
              </Typography>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2}>
                {posts.map((post) => (
                  <Grid item xs={12} key={post._id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Trending Hashtags
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {trendingHashtags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag.hashtag} (${tag.count})`}
                  onClick={() => handleHashtagClick(tag.hashtag)}
                  color={tag.hashtag === hashtag ? 'secondary' : 'default'}
                  variant={tag.hashtag === hashtag ? 'filled' : 'outlined'}
                  sx={{ justifyContent: 'flex-start', cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HashtagPage;
