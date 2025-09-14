import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import {
  InputBase,
  Box,
  Paper,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import searchService from '../services/searchService';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: 'width 0.3s ease-in-out',
  [theme.breakpoints.up('sm')]: {
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

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  fontFamily: theme.typography.fontFamily,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.2, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '12ch',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const GlobalSearch = () => {
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

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => { if (searchTerm.length > 1 && hasResults) setOpen(true); }}
          />
        </Search>
        {open && (
          <Paper sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: '70vh',
            overflowY: 'auto',
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : hasResults ? (
              <List dense>
                {results.products.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ px: 2, fontFamily: theme.typography.fontFamily }}>Products</Typography>
                    {results.products.map(product => (
                      <ListItemButton key={`prod-${product._id}`} onClick={() => handleResultClick(`/product/${product._id}`)}>
                        <ListItemAvatar><Avatar variant="rounded" src={product.image} /></ListItemAvatar>
                        <ListItemText primary={product.name} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                      </ListItemButton>
                    ))}
                    <Divider />
                  </>
                )}
                {results.posts.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ px: 2, pt: 1, fontFamily: theme.typography.fontFamily }}>Posts</Typography>
                    {results.posts.map(post => (
                      <ListItemButton key={`post-${post._id}`} onClick={() => handleResultClick(`/post/${post._id}`)}>
                        <ListItemText primary={post.title} secondary={`by ${post.user.username}`} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                      </ListItemButton>
                    ))}
                    <Divider />
                  </>
                )}
                {results.users.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ px: 2, pt: 1, fontFamily: theme.typography.fontFamily }}>Users</Typography>
                    {results.users.map(user => (
                      <ListItemButton key={`user-${user._id}`} onClick={() => handleResultClick(`/user/${user.username}`)}>
                        <ListItemAvatar><Avatar src={user.profilePic} /></ListItemAvatar>
                        <ListItemText primary={user.username} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                      </ListItemButton>
                    ))}
                    <Divider />
                  </>
                )}
                <ListItemButton onClick={() => handleResultClick(`/search?q=${encodeURIComponent(searchTerm.trim())}`)}>
                  <ListItemText primary={`View all results for "${searchTerm}"`} primaryTypographyProps={{ color: 'primary', fontWeight: 'bold', fontFamily: theme.typography.fontFamily }} />
                </ListItemButton>
              </List>
            ) : (
              <Typography sx={{ p: 2, color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>No results found.</Typography>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;