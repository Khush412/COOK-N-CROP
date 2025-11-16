import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Stack, Avatar, useMediaQuery } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import RichTextInput from './RichTextInput';
import Loader from '../custom_components/Loader';

const CommentForm = ({ onSubmit, loading, initialContent = '', submitLabel = 'Post' }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    // Update content if the initialContent prop changes (e.g., when opening edit for a different comment)
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content });
    setContent('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: isMobile ? 1 : 2, mb: isMobile ? 2 : 4 }}>
      <Stack direction="row" spacing={isMobile ? 1 : 2} alignItems="flex-start">
        <Avatar 
          src={user?.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user?.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined} 
          alt={user?.username}
          sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, fontSize: isMobile ? 14 : 16 }}
        >
          {!user?.profilePic && user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <RichTextInput
            label={isMobile ? "" : "Add a comment..."}
            placeholder=""
            fullWidth
            multiline
            rows={isMobile ? 1 : 2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            sx={{ 
              '& .MuiInputBase-root': { 
                minHeight: isMobile ? 36 : 48,
                fontSize: isMobile ? '0.875rem' : '1rem'
              } 
            }}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !content.trim()}
          sx={{ 
            height: isMobile ? 36 : 'fit-content', 
            py: isMobile ? 0.5 : 1.5, 
            fontFamily: theme.typography.fontFamily,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            minWidth: isMobile ? 'auto' : 80,
            px: isMobile ? 1 : 2
          }}
        >
          {loading ? <Loader size="small" color="inherit" /> : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};

export default CommentForm;