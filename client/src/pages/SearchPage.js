import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Alert, Grid, Paper, Tabs, Tab, Avatar, Button, Divider, Pagination,
} from '@mui/material';
import searchService from '../services/searchService';
import ProductCard from '../components/ProductCard';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const UserCard = ({ user }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
    <Avatar src={user.profilePic} sx={{ width: 56, height: 56 }} />
    <Box>
      <Typography variant="h6" component={RouterLink} to={`/user/${user.username}`} sx={{ textDecoration: 'none', color: 'text.primary' }}>
        {user.username}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user.followers?.length || 0} Followers
      </Typography>
    </Box>
  </Paper>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth(); // Get current user for PostCard
  const [globalResults, setGlobalResults] = useState({ posts: [], products: [], users: [] });
  const [paginatedResults, setPaginatedResults] = useState({ posts: [], products: [], users: [] });
  const [pagination, setPagination] = useState({
    posts: { page: 1, totalPages: 0 },
    products: { page: 1, totalPages: 0 },
    users: { page: 1, totalPages: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const query = useMemo(() => searchParams.get('q') || '', [searchParams]);

  // Effect for initial global search (for the "All" tab)
  useEffect(() => {
    if (!query) {
      setGlobalResults({ posts: [], products: [], users: [] });
      setPaginatedResults({ posts: [], products: [], users: [] });
      setPagination({
        posts: { page: 1, totalPages: 0 },
        products: { page: 1, totalPages: 0 },
        users: { page: 1, totalPages: 0 },
      });
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchService.globalSearch(query);
        setGlobalResults(data);
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Effect for tab-specific, paginated search
  useEffect(() => {
    if (tab === 'all' || !query) return;

    const fetchPaginatedResults = async () => {
      setTabLoading(true);
      try {
        let data;
        const currentPage = pagination[tab].page;

        if (tab === 'posts') {
          data = await searchService.searchPosts(query, currentPage);
          setPaginatedResults(prev => ({ ...prev, posts: data.posts }));
          setPagination(prev => ({ ...prev, posts: { page: data.page, totalPages: data.pages } }));
        } else if (tab === 'products') {
          data = await searchService.searchProducts(query, currentPage);
          setPaginatedResults(prev => ({ ...prev, products: data.products }));
          setPagination(prev => ({ ...prev, products: { page: data.page, totalPages: data.pages } }));
        } else if (tab === 'users') {
          data = await searchService.searchUsers(query, currentPage);
          setPaginatedResults(prev => ({ ...prev, users: data.users }));
          setPagination(prev => ({ ...prev, users: { page: data.page, totalPages: data.pages } }));
        }
      } catch (err) {
        setError(`Failed to load results for ${tab}.`);
      } finally {
        setTabLoading(false);
      }
    };

    fetchPaginatedResults();
  }, [query, tab, pagination.posts.page, pagination.products.page, pagination.users.page]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    // Reset other tabs' pages to 1 when switching
    setPagination(prev => ({
      posts: { ...prev.posts, page: 1 },
      products: { ...prev.products, page: 1 },
      users: { ...prev.users, page: 1 },
    }));
  };

  const handlePageChange = (type, value) => {
    setPagination(prev => ({ ...prev, [type]: { ...prev[type], page: value } }));
  };

  const renderResults = () => {
    const noResults = globalResults.posts.length === 0 && globalResults.products.length === 0 && globalResults.users.length === 0;

    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (noResults) {
      return <Alert severity="info">No results found for "{query}".</Alert>;
    }

    if (tabLoading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (tab === 'all') {
      return (
        <Box>
          {globalResults.posts.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>Posts</Typography>
              <Grid container spacing={3}>
                {globalResults.posts.map(post => (
                  <Grid item key={`post-${post._id}`} xs={12} sm={6} md={4}>
                    <PostCard post={post} user={user} onUpvote={() => {}} upvotingPosts={[]} onToggleSave={() => {}} savingPosts={[]} />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </Box>
          )}
          {globalResults.products.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>Products</Typography>
              <Grid container spacing={3}>
                {globalResults.products.map(product => (
                  <Grid item key={`product-${product._id}`} xs={12} sm={6} md={4} lg={3}>
                    <ProductCard product={product} showSnackbar={() => {}} />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </Box>
          )}
          {globalResults.users.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>Users</Typography>
              <Grid container spacing={3}>
                {globalResults.users.map(userResult => (
                  <Grid item key={`user-${userResult._id}`} xs={12} sm={6} md={4}>
                    <UserCard user={userResult} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box>
        <Grid container spacing={3}>
          {tab === 'posts' && paginatedResults.posts.map(post => (
            <Grid item key={`post-${post._id}`} xs={12} sm={6} md={4}>
              <PostCard post={post} user={user} onUpvote={() => {}} upvotingPosts={[]} onToggleSave={() => {}} savingPosts={[]} />
            </Grid>
          ))}
          {tab === 'products' && paginatedResults.products.map(product => (
            <Grid item key={`product-${product._id}`} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} showSnackbar={() => {}} />
            </Grid>
          ))}
          {tab === 'users' && paginatedResults.users.map(userResult => (
            <Grid item key={`user-${userResult._id}`} xs={12} sm={6} md={4}>
              <UserCard user={userResult} />
            </Grid>
          ))}
        </Grid>
        {pagination[tab]?.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination[tab].totalPages}
              page={pagination[tab].page}
              onChange={(e, value) => handlePageChange(tab, value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="search results tabs">
            <Tab label="All" value="all" />
            <Tab label={`Posts (${globalResults.posts.length})`} value="posts" disabled={globalResults.posts.length === 0} />
            <Tab label={`Products (${globalResults.products.length})`} value="products" disabled={globalResults.products.length === 0} />
            <Tab label={`Users (${globalResults.users.length})`} value="users" disabled={globalResults.users.length === 0} />
          </Tabs>
        </Box>
      )}

      {query && renderResults()}
    </Container>
  );
};

export default SearchPage;