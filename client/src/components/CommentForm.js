import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Stack, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const CommentForm = ({ onSubmit, loading, initialContent = '', submitLabel = 'Post' }) => {
  const { user } = useAuth();
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar src={user?.profilePic} alt={user?.username}>
          {!user?.profilePic && user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <TextField
          label="Add a comment..."
          variant="outlined"
          fullWidth
          multiline
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !content.trim()}
          sx={{ height: 'fit-content', py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};

export default CommentForm;