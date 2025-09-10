import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';

const EditPostForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = currentTag.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
      }
      setCurrentTag('');
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, tags });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <TextField
          label="Post Title"
          variant="outlined"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Post Content"
          variant="outlined"
          fullWidth
          required
          multiline
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Box>
          <TextField
            label="Tags (press Enter to add, max 5)"
            variant="outlined"
            fullWidth
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={loading || tags.length >= 5}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagDelete(tag)}
                disabled={loading}
              />
            ))}
          </Box>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !title.trim() || !content.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default EditPostForm;
