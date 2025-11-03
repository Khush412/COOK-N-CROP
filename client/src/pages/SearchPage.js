import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Alert, Grid, Paper, Tabs, Tab, Avatar, Button, Divider, Pagination, Chip, Stack, useTheme, alpha
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import searchService from '../services/searchService';
import searchAnalyticsService from '../services/searchAnalyticsService';
import ProductCard from '../components/ProductCard';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const UserCard = ({ user }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        height: '100%',
        borderRadius: 3,
        textAlign: 'center',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: 'primary.main',
        },
      }}
    >
      <Avatar 
        src={user.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined} 
        sx={{ width: 80, height: 80, mb: 1 }}
        alt={user.username}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to={`/user/${user.username}`} 
          sx={{ 
            textDecoration: 'none', 
            color: 'text.primary', 
            fontWeight: 'bold', 
            fontFamily: theme.typography.fontFamily, 
            '&:hover': { color: 'primary.main' } 
          }}
        >
          {user.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          {user.followers?.length || 0} Followers
        </Typography>
      </Box>
      <Button 
        component={RouterLink} 
        to={`/user/${user.username}`} 
        variant="outlined" 
        size="small" 
        sx={{ mt: 'auto', borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
      >
        View Profile
      </Button>
    </Paper>
  );
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
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
  const theme = useTheme();

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
        
        // Track the search
        const totalResults = data.posts.length + data.products.length + data.users.length;
        searchAnalyticsService.trackSearch(query, totalResults);
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Effect for tab-specific, paginated search
  const currentPage = pagination[tab]?.page;
  useEffect(() => {
    if (tab === 'all' || !query) return;

    const fetchPaginatedResults = async () => {
      setTabLoading(true);
      try {
        let data;

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
  }, [query, tab, currentPage]);

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
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={60} /></Box>;
    }
    if (error) {
      return <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>;
    }
    if (noResults) {
      return (
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 2, borderRadius: 2 }}>
          <SearchOffIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            No results found for "{query}"
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
            Try searching for something else.
          </Typography>
        </Paper>
      );
    }

    if (tabLoading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (tab === 'all') {
      return (
        <Box>
          {globalResults.posts.length > 0 && (
            <Box mb={4}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Posts</Typography>
                <Chip label={`${globalResults.posts.length} results`} size="small" color="secondary" />
              </Stack>
              <Grid container spacing={3}>
                {globalResults.posts.map(post => (
                  <Grid key={`post-${post._id}`} size={{ xs: 12, sm: 6 }}>
                    <PostCard 
                      post={post} 
                      user={user} 
                      onUpvote={() => {}} 
                      upvotingPosts={[]} 
                      onToggleSave={() => {}} 
                      savingPosts={[]} 
                      showSnackbar={() => {}}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </Box>
          )}
          {globalResults.products.length > 0 && (
            <Box mb={4}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Products</Typography>
                <Chip label={`${globalResults.products.length} results`} size="small" color="primary" />
              </Stack>
              <Grid container spacing={3}>
                {globalResults.products.map(product => (
                  <Grid key={`product-${product._id}`} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ProductCard product={product} showSnackbar={() => {}} />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </Box>
          )}
          {globalResults.users.length > 0 && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Users</Typography>
                <Chip label={`${globalResults.users.length} results`} size="small" color="info" />
              </Stack>
              <Grid container spacing={3}>
                {globalResults.users.map(userResult => (
                  <Grid key={`user-${userResult._id}`} size={{ xs: 12, sm: 6, md: 4 }}>
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
            <Grid key={`post-${post._id}`} size={{ xs: 12, sm: 6 }}>
              <PostCard 
                post={post} 
                user={user} 
                onUpvote={() => {}} 
                upvotingPosts={[]} 
                onToggleSave={() => {}} 
                savingPosts={[]} 
                showSnackbar={() => {}}
              />
            </Grid>
          ))}
          {tab === 'products' && paginatedResults.products.map(product => (
            <Grid key={`product-${product._id}`} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProductCard product={product} showSnackbar={() => {}} />
            </Grid>
          ))}
          {tab === 'users' && paginatedResults.users.map(userResult => (
            <Grid key={`user-${userResult._id}`} size={{ xs: 12, sm: 6, md: 4 }}>
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
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '50%',
                  fontWeight: 600,
                  fontFamily: theme.typography.fontFamily,
                }
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Search Results
        </Typography>
        {query ? (
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Showing results for: <strong>"{query}"</strong>
          </Typography>
        ) : (
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Please enter a search term in the navigation bar.
          </Typography>
        )}
      </Paper>

      {query && (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tab} 
              onChange={handleTabChange} 
              aria-label="search results tabs" 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: 100,
                }
              }}
            >
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>All</span>
                    <Chip 
                      label={globalResults.posts.length + globalResults.products.length + globalResults.users.length} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        minWidth: 18, 
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: theme.palette.primary.contrastText,
                        backgroundColor: theme.palette.primary.main
                      }} 
                    />
                  </Stack>
                } 
                value="all" 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Posts</span>
                    <Chip 
                      label={globalResults.posts.length} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        minWidth: 18, 
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: theme.palette.secondary.contrastText,
                        backgroundColor: theme.palette.secondary.main
                      }} 
                    />
                  </Stack>
                } 
                value="posts" 
                disabled={globalResults.posts.length === 0} 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Products</span>
                    <Chip 
                      label={globalResults.products.length} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        minWidth: 18, 
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: theme.palette.primary.contrastText,
                        backgroundColor: theme.palette.primary.main
                      }} 
                    />
                  </Stack>
                } 
                value="products" 
                disabled={globalResults.products.length === 0} 
              />
              <Tab 
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Users</span>
                    <Chip 
                      label={globalResults.users.length} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        minWidth: 18, 
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: theme.palette.info.contrastText,
                        backgroundColor: theme.palette.info.main
                      }} 
                    />
                  </Stack>
                } 
                value="users" 
                disabled={globalResults.users.length === 0} 
              />
            </Tabs>
          </Box>
          {renderResults()}
        </Paper>
      )}
    </Container>
  );
};

export default SearchPage;