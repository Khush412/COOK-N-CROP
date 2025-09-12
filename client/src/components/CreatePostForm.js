import React, { useState, Fragment } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CreatePostForm = ({ onSubmit, onCancel, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isRecipe, setIsRecipe] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState({
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    instructions: [''],
  });

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
    const postData = { title, content, tags, isRecipe };
    if (isRecipe) {
      postData.recipeDetails = {
        ...recipeDetails,
        ingredients: recipeDetails.ingredients.filter(ing => ing.trim() !== ''),
        instructions: recipeDetails.instructions.filter(inst => inst.trim() !== ''),
      };
    }
    onSubmit(postData);
  };

  const handleRecipeDetailChange = (e) => {
    setRecipeDetails({ ...recipeDetails, [e.target.name]: e.target.value });
  };

  const handleDynamicListChange = (index, event, field) => {
    const newList = [...recipeDetails[field]];
    newList[index] = event.target.value;
    setRecipeDetails({ ...recipeDetails, [field]: newList });
  };

  const addDynamicListItem = (field) => {
    setRecipeDetails({ ...recipeDetails, [field]: [...recipeDetails[field], ''] });
  };

  const removeDynamicListItem = (index, field) => {
    const newList = [...recipeDetails[field]];
    if (newList.length > 1) {
      newList.splice(index, 1);
      setRecipeDetails({ ...recipeDetails, [field]: newList });
    }
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
          label="What's on your mind?"
          variant="outlined"
          fullWidth
          required
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isRecipe}
              onChange={(e) => setIsRecipe(e.target.checked)}
              disabled={loading}
            />
          }
          label="This is a Recipe"
        />

        {isRecipe && (
          <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Recipe Details</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField label="Prep Time (minutes)" name="prepTime" type="number" value={recipeDetails.prepTime} onChange={handleRecipeDetailChange} fullWidth />
              <TextField label="Cook Time (minutes)" name="cookTime" type="number" value={recipeDetails.cookTime} onChange={handleRecipeDetailChange} fullWidth />
              <TextField label="Servings" name="servings" type="number" value={recipeDetails.servings} onChange={handleRecipeDetailChange} fullWidth />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>Ingredients</Typography>
            {recipeDetails.ingredients.map((ingredient, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }} alignItems="center">
                <TextField
                  label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => handleDynamicListChange(index, e, 'ingredients')}
                  fullWidth
                  size="small"
                />
                <IconButton onClick={() => removeDynamicListItem(index, 'ingredients')} size="small" disabled={recipeDetails.ingredients.length <= 1}>
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addDynamicListItem('ingredients')} startIcon={<AddIcon />} size="small">
              Add Ingredient
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>Instructions</Typography>
            {recipeDetails.instructions.map((instruction, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }} alignItems="flex-start">
                <Typography sx={{ pt: 1, fontWeight: 'bold' }}>{index + 1}.</Typography>
                <TextField
                  label={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) => handleDynamicListChange(index, e, 'instructions')}
                  fullWidth
                  multiline
                  size="small"
                />
                <IconButton onClick={() => removeDynamicListItem(index, 'instructions')} size="small" disabled={recipeDetails.instructions.length <= 1}>
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addDynamicListItem('instructions')} startIcon={<AddIcon />} size="small">
              Add Step
            </Button>
          </Box>
        )}

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
            {loading ? 'Posting...' : 'Submit Post'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default CreatePostForm;
