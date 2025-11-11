import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import searchService from '../services/searchService';
import Loader from '../custom_components/Loader';

const SearchSuggestions = ({ query, onClose, onSelect }) => {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState({ posts: [], products: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ posts: [], products: [], users: [] });
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchService.globalSearch(query);
        setSuggestions(data);
      } catch (err) {
        setError('Failed to load suggestions');
        console.error('Search suggestions error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    onSelect();
    navigate(path);
    onClose();
  };

  const hasResults = suggestions.posts.length > 0 || suggestions.products.length > 0 || suggestions.users.length > 0;

  // Function to get the first image URL for a product
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      // Use the first image from the images array
      return `${process.env.REACT_APP_API_URL}${product.images[0]}`;
    }
    // Fallback to placeholder if no images
    return `${process.env.PUBLIC_URL}/images/placeholder.png`;
  };

  if (query.length < 2) return null;

  return (
    <Paper
      ref={suggestionsRef}
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        maxHeight: '70vh',
        overflowY: 'auto',
        borderRadius: 2,
        zIndex: 1400,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Loader size="small" />
        </Box>
      ) : error ? (
        <Typography sx={{ p: 2, color: 'error.main', fontFamily: theme.typography.fontFamily }}>
          {error}
        </Typography>
      ) : hasResults ? (
        <List dense>
          {suggestions.products.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Products</Typography>
                <Chip label={suggestions.products.length} size="small" color="primary" variant="outlined" />
              </Stack>
              {suggestions.products.slice(0, 3).map(product => (
                <ListItemButton 
                  key={`prod-${product._id}`} 
                  onClick={() => handleSelect(`/product/${product._id}`)}
                  sx={{ 
                    py: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      variant="rounded" 
                      src={getProductImageUrl(product)} 
                      sx={{ width: 40, height: 40, objectFit: 'cover' }}
                      alt={product.name}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500, 
                          fontFamily: theme.typography.fontFamily,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.name}
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary', 
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        ₹{product.price?.toFixed(2)}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
              <Divider />
            </>
          )}
          {suggestions.posts.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Posts</Typography>
                <Chip label={suggestions.posts.length} size="small" color="secondary" variant="outlined" />
              </Stack>
              {suggestions.posts.slice(0, 3).map(post => (
                <ListItemButton 
                  key={`post-${post._id}`} 
                  onClick={() => handleSelect(`/post/${post._id}`)}
                  sx={{ 
                    py: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500, 
                          fontFamily: theme.typography.fontFamily,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.title}
                      </Typography>
                    } 
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary', 
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        by {post.user?.username}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
              <Divider />
            </>
          )}
          {suggestions.users.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Users</Typography>
                <Chip label={suggestions.users.length} size="small" color="info" variant="outlined" />
              </Stack>
              {suggestions.users.slice(0, 3).map(user => (
                <ListItemButton 
                  key={`user-${user._id}`} 
                  onClick={() => handleSelect(`/user/${user.username}`)}
                  sx={{ 
                    py: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={user.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined} 
                      sx={{ width: 32, height: 32 }}
                      alt={user.username}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500, 
                          fontFamily: theme.typography.fontFamily,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {user.username}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
              <Divider />
            </>
          )}
          <ListItemButton 
            onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
            sx={{ 
              justifyContent: 'center',
              py: 1.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <ListItemText 
              primary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold', 
                    fontFamily: theme.typography.fontFamily,
                    textAlign: 'center'
                  }}
                >
                  View all {suggestions.posts.length + suggestions.products.length + suggestions.users.length} results
                </Typography>
              } 
            />
          </ListItemButton>
        </List>
      ) : (
        <Typography sx={{ p: 2, color: 'text.secondary', fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>
          No suggestions found
        </Typography>
      )}
    </Paper>
  );
};

export default SearchSuggestions;