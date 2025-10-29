import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import postService from '../services/postService'; // Assuming you have a post service

const UserGeneratedContent = ({ productId, title }) => {
  const theme = useTheme();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedItems, setLikedItems] = useState(new Set());

  // Fetch user-generated content related to this product
  useEffect(() => {
    const fetchUserGeneratedContent = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        // Assuming there's an API endpoint to get posts tagged with a specific product
        const data = await postService.getPostsByTaggedProduct(productId);
        setContentItems(data);
      } catch (err) {
        setError('Failed to load customer content');
        console.error('Error fetching user-generated content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGeneratedContent();
  }, [productId]);

  const handleLike = (itemId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // Don't show error to users, just silently fail
    return null;
  }

  if (!contentItems || contentItems.length === 0) {
    return (
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            fontFamily: theme.typography.fontFamily, 
            textAlign: 'center', 
            py: 6 
          }}
        >
          No images or videos available for now
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>
        {title}
      </Typography>
      
      <Grid container spacing={3}>
        {contentItems.map((item) => (
          <Grid key={item._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {item.media && item.media.length > 0 ? (
                item.media[0].mediaType === 'image' ? (
                  <CardMedia
                    component="img"
                    image={item.media[0].url}
                    alt={item.caption || item.title}
                    sx={{
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      height: 200,
                      bgcolor: 'black',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CardMedia
                      component="video"
                      src={item.media[0].url}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Box>
                  </Box>
                )
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No media available
                  </Typography>
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    src={item.user?.profilePic} 
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {item.user?.username?.charAt(0)}
                  </Avatar>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                  >
                    {item.user?.username}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    mb: 2,
                    minHeight: 40,
                  }}
                >
                  {item.caption || item.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleLike(item._id)}
                    >
                      {likedItems.has(item._id) ? (
                        <FavoriteIcon sx={{ color: 'error.main' }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {item.upvoteCount + (likedItems.has(item._id) ? 1 : 0)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small">
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                    <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {item.commentCount}
                    </Typography>
                  </Box>
                  
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </Box>
                
                {item.tags && item.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: theme.typography.fontFamily,
                          height: 20,
                          '& .MuiChip-label': {
                            px: 0.5,
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserGeneratedContent;