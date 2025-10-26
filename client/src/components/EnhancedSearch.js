import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import searchService from '../services/searchService';

const EnhancedSearch = ({ searchTerm, setSearchTerm, onSearchSubmit }) => {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
    popularSearches: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Fetch suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions({
        products: [],
        categories: [],
        popularSearches: []
      });
    }
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await searchService.getProductSuggestions(searchTerm, 5);
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({
        products: [],
        categories: [],
        popularSearches: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    if (onSearchSubmit) {
      onSearchSubmit(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (onSearchSubmit) {
        onSearchSubmit(searchTerm);
      }
    }
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search products, categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          flexGrow: 1,
          minWidth: { xs: '100%', sm: 250 },
          '& .MuiOutlinedInput-root': { 
            borderRadius: '20px',
            bgcolor: 'background.paper'
          },
          '& .MuiInputBase-input': { 
            fontFamily: theme.typography.fontFamily,
            py: 1.5
          }
        }}
        InputLabelProps={{ 
          sx: { 
            fontFamily: theme.typography.fontFamily 
          } 
        }}
      />

      {showSuggestions && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            borderRadius: 2,
            maxHeight: 400,
            overflowY: 'auto'
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                Loading suggestions...
              </Typography>
            </Box>
          ) : (
            <>
              {suggestions.products.length > 0 && (
                <>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SearchIcon fontSize="small" color="primary" />
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      Products
                    </Typography>
                  </Box>
                  <List dense>
                    {suggestions.products.map((product, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSuggestionClick(product)}
                        sx={{
                          py: 0.5,
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                fontWeight: 500
                              }}
                            >
                              {product}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                </>
              )}

              {suggestions.categories.length > 0 && (
                <>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" color="primary" />
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      Categories
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {suggestions.categories.map((category, index) => (
                      <Chip
                        key={index}
                        label={category}
                        size="small"
                        onClick={() => handleSuggestionClick(category)}
                        sx={{
                          fontFamily: theme.typography.fontFamily,
                          borderRadius: '16px',
                          bgcolor: 'background.default',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      />
                    ))}
                  </Box>
                  <Divider />
                </>
              )}

              {suggestions.popularSearches.length > 0 && (
                <>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" color="primary" />
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      Popular Searches
                    </Typography>
                  </Box>
                  <List dense>
                    {suggestions.popularSearches.map((search, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSuggestionClick(search)}
                        sx={{
                          py: 0.5,
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                fontWeight: 500
                              }}
                            >
                              {search}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {suggestions.products.length === 0 && 
               suggestions.categories.length === 0 && 
               suggestions.popularSearches.length === 0 && 
               searchTerm.length > 1 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      color: 'text.secondary'
                    }}
                  >
                    No suggestions found
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedSearch;