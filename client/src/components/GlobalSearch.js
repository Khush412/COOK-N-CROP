import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import {
  InputBase,
  Box,
  Popper,
  Paper,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  Fade,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import searchService from '../services/searchService';
import Loader from '../custom_components/Loader';

const Search = styled('div', {
  shouldForwardProp: (prop) => prop !== '$fullWidth',
})(({ theme, $fullWidth }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: $fullWidth ? 0 : theme.spacing(1),
  marginLeft: 0,
  width: $fullWidth ? '100%' : 'auto',
  transition: 'width 0.3s ease-in-out',
  [theme.breakpoints.up('sm')]: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.7),
}));

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== '$fullWidth',
})(({ theme, $fullWidth }) => ({
  color: 'inherit',
  fontFamily: theme.typography.fontFamily,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.2, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: $fullWidth ? '100%' : '12ch',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const GlobalSearch = ({ fullWidth = false }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [results, setResults] = useState({ posts: [], products: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const anchorRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm.length < 2) {
      setResults({ posts: [], products: [], users: [] });
      setOpen(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchService.globalSearch(debouncedTerm);
        setResults(data);
        setOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedTerm]);

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleResultClick = (path) => {
    handleClose();
    setSearchTerm('');
    navigate(path);
  };

  const hasResults = results.posts.length > 0 || results.products.length > 0 || results.users.length > 0;

  // Function to get the first image URL for a product
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      // Use the first image from the images array
      return `${process.env.REACT_APP_API_URL}${product.images[0]}`;
    }
    // Fallback to placeholder if no images
    return `${process.env.PUBLIC_URL}/images/placeholder.png`;
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box ref={anchorRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <Search $fullWidth={fullWidth}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            $fullWidth={fullWidth}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => { if (searchTerm.length > 1 && hasResults) setOpen(true); }}
          />
        </Search>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          transition
          sx={{
            zIndex: 1400, // Higher than Drawer's zIndex (1200)
            width: anchorRef.current ? anchorRef.current.getBoundingClientRect().width : 'auto',
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper sx={{
                mt: 1,
                maxHeight: '70vh',
                overflowY: 'auto',
                borderRadius: 2,
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Loader size="small" />
                  </Box>
                ) : hasResults ? (
                  <List dense>
                    {results.products.length > 0 && (
                      <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                          <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Products</Typography>
                          <Chip label={results.products.length} size="small" color="primary" variant="outlined" />
                        </Stack>
                        {results.products.slice(0, 3).map(product => (
                          <ListItemButton 
                            key={`prod-${product._id}`} 
                            onClick={() => handleResultClick(`/product/${product._id}`)}
                            sx={{ 
                              py: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05)
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
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
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
                    {results.posts.length > 0 && (
                      <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                          <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Posts</Typography>
                          <Chip label={results.posts.length} size="small" color="secondary" variant="outlined" />
                        </Stack>
                        {results.posts.slice(0, 3).map(post => (
                          <ListItemButton 
                            key={`post-${post._id}`} 
                            onClick={() => handleResultClick(`/post/${post._id}`)}
                            sx={{ 
                              py: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.secondary.main, 0.05)
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
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
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
                    {results.users.length > 0 && (
                      <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                          <Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Users</Typography>
                          <Chip label={results.users.length} size="small" color="info" variant="outlined" />
                        </Stack>
                        {results.users.slice(0, 3).map(user => (
                          <ListItemButton 
                            key={`user-${user._id}`} 
                            onClick={() => handleResultClick(`/user/${user.username}`)}
                            sx={{ 
                              py: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.info.main, 0.05)
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
                      onClick={() => handleResultClick(`/search?q=${encodeURIComponent(searchTerm.trim())}`)}
                      sx={{ 
                        justifyContent: 'center',
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
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
                            View all {results.posts.length + results.products.length + results.users.length} results
                          </Typography>
                        } 
                      />
                    </ListItemButton>
                  </List>
                ) : (
                  <Typography sx={{ p: 2, color: 'text.secondary', fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>
                    No results found. Try different keywords.
                  </Typography>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;