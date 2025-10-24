import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  Paper,
  Autocomplete,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import productService from '../services/productService';
import groupService from '../services/groupService';
import RichTextInput from './RichTextInput';

const CreatePostForm = ({ onSubmit, onCancel, loading, forceRecipe, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isRecipe, setIsRecipe] = useState(forceRecipe === true);
  const [recipeDetails, setRecipeDetails] = useState({
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    instructions: [''],
  });
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [productSearchOptions, setProductSearchOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const theme = useTheme();
  const location = useLocation();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [postFlair, setPostFlair] = useState(''); // This was missing
  const [availableFlairs, setAvailableFlairs] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:')) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        setGroupsLoading(true);
        const subs = await groupService.getMySubscriptions();
        setUserGroups(subs);

        // Check if we navigated from a specific group page
        const preselectedGroupId = location.state?.groupId;
        if (preselectedGroupId && subs.some(g => g._id === preselectedGroupId)) {
          setSelectedGroup(preselectedGroupId);
          const selectedGroupData = subs.find(g => g._id === preselectedGroupId);
          if (selectedGroupData?.flairs) {
            setAvailableFlairs(selectedGroupData.flairs);
            if (initialData?.flair && selectedGroupData.flairs.some(f => f.text === initialData.flair)) {
              setPostFlair(initialData.flair);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user's groups", error);
      } finally {
        setGroupsLoading(false);
      }
    };
    fetchUserGroups();
  }, [location.state]);

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroup(groupId);
    const selectedGroupData = userGroups.find(g => g._id === groupId);
    setAvailableFlairs(selectedGroupData?.flairs || []);
    // Reset flair if the new group doesn't have it
    const currentFlairExistsInNewGroup = (selectedGroupData?.flairs || []).some(f => f.text === postFlair);
    if (!currentFlairExistsInNewGroup) setPostFlair('');
  };

  useEffect(() => {
    // If forceRecipe is defined, keep the state in sync.
    if (typeof forceRecipe === 'boolean') {
      setIsRecipe(forceRecipe);
    }

    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(initialData.tags || []);
      setIsRecipe(initialData.isRecipe || false);
      if (initialData.isRecipe && initialData.recipeDetails) {
        setRecipeDetails({
          prepTime: initialData.recipeDetails.prepTime || '',
          cookTime: initialData.recipeDetails.cookTime || '',
          servings: initialData.recipeDetails.servings || '',
          ingredients: initialData.recipeDetails.ingredients?.length ? initialData.recipeDetails.ingredients : [''],
          instructions: initialData.recipeDetails.instructions?.length ? initialData.recipeDetails.instructions : [''],
        });
      }
      if (initialData.group) {
        setSelectedGroup(initialData.group._id || initialData.group);
      }
      // When editing, find the full group object from user's subscriptions to get its flairs
      const groupDataForPost = userGroups.find(g => g._id === (initialData.group?._id || initialData.group));
      if (groupDataForPost?.flairs) {
        setAvailableFlairs(groupDataForPost.flairs);
      }
      if (initialData.flair) {
        setPostFlair(initialData.flair);
      }
      if (initialData.taggedProducts) {
        // The backend populates this, so we get full product objects
        setTaggedProducts(initialData.taggedProducts);
      } 
      setPreviews(initialData.media?.map(m => ({ url: getImageUrl(m.url), type: m.mediaType })) || []);
      setFiles([]);
    }
  }, [forceRecipe, initialData, userGroups]); // Add userGroups to dependency array

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
    if (!title.trim() || !content.trim() || !selectedGroup) return;

    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('group', selectedGroup);
    if (postFlair) postData.append('flair', postFlair); // Pass flair to backend
    postData.append('isRecipe', isRecipe);

    files.forEach(file => {
      postData.append('media', file);
    });

    // When editing, we need to send back the media files that were NOT deleted.
    if (initialData) {
      const existingMedia = previews
        .filter(p => !p.url.startsWith('blob:'))
        // Ensure the 'mediaType' field is sent back, not 'type'
        .map(({ url, type }) => ({ url, mediaType: type }));
      postData.append('existingMedia', JSON.stringify(existingMedia));
    }

    tags.forEach(tag => postData.append('tags', tag));
    taggedProducts.forEach(p => postData.append('taggedProducts', p._id));

    if (isRecipe) {
      const cleanRecipeDetails = {
        ...recipeDetails,
        ingredients: recipeDetails.ingredients.filter(ing => ing.trim() !== ''),
        instructions: recipeDetails.instructions.filter(inst => inst.trim() !== ''),
      };
      postData.append('recipeDetails', JSON.stringify(cleanRecipeDetails));
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

  const handleProductSearch = async (event, newValue) => {
    setProductSearchLoading(true);
    try {
      // An empty query will now fetch all products from the backend
      const products = await productService.searchProductsForTagging(newValue);
      setProductSearchOptions(products);
    } catch (err) {
      console.error("Failed to search products", err);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleTagProductDelete = (productToDelete) => {
    setTaggedProducts((prev) =>
      prev.filter((product) => product._id !== productToDelete._id)
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      name: file.name,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (previewUrl) => {
    const previewToRemove = previews.find(p => p.url === previewUrl);
    setPreviews(previews.filter(p => p.url !== previewUrl));
    setFiles(files.filter(f => f.name !== previewToRemove.name));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <FormControl fullWidth required disabled={loading || groupsLoading}>
          <InputLabel id="group-select-label" sx={{ fontFamily: theme.typography.fontFamily }}>Choose a Group</InputLabel>
          <Select
            labelId="group-select-label"
            id="group-select"
            value={selectedGroup}
            label="Choose a Group"
            onChange={handleGroupChange}
            sx={{ borderRadius: '12px', '& .MuiSelect-select': { fontFamily: theme.typography.fontFamily } }}
          >
            {groupsLoading ? (
              <MenuItem value="" disabled sx={{ fontFamily: theme.typography.fontFamily }}><em>Loading groups...</em></MenuItem>
            ) : userGroups.length === 0 ? (
              <MenuItem value="" disabled sx={{ fontFamily: theme.typography.fontFamily }}><em>You haven't joined any groups yet.</em></MenuItem>
            ) : (
              userGroups.map(group => (
                <MenuItem key={group._id} value={group._id} sx={{ fontFamily: theme.typography.fontFamily }}>{group.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        {availableFlairs.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel id="flair-select-label" sx={{ fontFamily: theme.typography.fontFamily }}>Flair (Optional)</InputLabel>
            <Select
              labelId="flair-select-label"
              value={postFlair}
              label="Flair (Optional)"
              onChange={(e) => setPostFlair(e.target.value)}
              sx={{ borderRadius: '12px', '& .MuiSelect-select': { fontFamily: theme.typography.fontFamily } }}
            >
              <MenuItem value="" sx={{ fontFamily: theme.typography.fontFamily }}><em>None</em></MenuItem>
              {availableFlairs.map(flair => (
                <MenuItem key={flair.text} value={flair.text} sx={{ fontFamily: theme.typography.fontFamily }}>
                  <Chip 
                    label={flair.text} 
                    size="small" 
                    sx={{ 
                      borderRadius: '8px', // More rounded
                      fontFamily: theme.typography.fontFamily,
                      bgcolor: flair.backgroundColor,
                      color: flair.color
                    }} 
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label="Post Title"
          variant="outlined"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
        />
        <RichTextInput
          label="What's on your mind?"
          placeholder="Type @ to mention users, # for hashtags..."
          fullWidth
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        {typeof forceRecipe !== 'boolean' && (
          <FormControlLabel
            control={
              <Switch
                checked={isRecipe}
                onChange={(e) => setIsRecipe(e.target.checked)}
                disabled={loading}
              />
            }
            label={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>This is a Recipe</Typography>}
          />
        )}

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Media</Typography>
          <Box
            component="label"
            htmlFor="media-upload"
            sx={{
              width: '100%',
              minHeight: 150,
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              bgcolor: alpha(theme.palette.action.hover, 0.02),
              overflow: 'hidden',
              mb: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            <Stack alignItems="center" spacing={1} color="text.secondary">
              <PhotoCamera sx={{ fontSize: 40 }} />
              <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily }}>Upload Images or Videos (up to 10)</Typography>
            </Stack>
          </Box>
          <input id="media-upload" type="file" multiple hidden accept="image/*,video/*" onChange={handleFileChange} />

          <Grid container spacing={1}>
            {previews.map((preview, index) => (
              <Grid size={{}} key={index}>
                <Paper sx={{ width: 100, height: 100, position: 'relative' }}>
                  {preview.type === 'image' ? (
                    <Avatar src={preview.url} variant="rounded" sx={{ width: '100%', height: '100%' }} />
                  ) : (
                    <video src={preview.url} width="100" height="100" style={{ objectFit: 'cover' }} />
                  )}
                  <IconButton size="small" onClick={() => removePreview(preview.url)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
                    <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {isRecipe && (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Recipe Details</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}> {/* Use size prop */}
              <TextField label="Prep Time (minutes)" name="prepTime" type="number" value={recipeDetails.prepTime} onChange={handleRecipeDetailChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
              <TextField label="Cook Time (minutes)" name="cookTime" type="number" value={recipeDetails.cookTime} onChange={handleRecipeDetailChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
              <TextField label="Servings" name="servings" type="number" value={recipeDetails.servings} onChange={handleRecipeDetailChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>Ingredients</Typography>
            {recipeDetails.ingredients.map((ingredient, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1.5 }} alignItems="center">
                <TextField
                  label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => handleDynamicListChange(index, e, 'ingredients')}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                <IconButton onClick={() => removeDynamicListItem(index, 'ingredients')} size="small" disabled={recipeDetails.ingredients.length <= 1}>
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addDynamicListItem('ingredients')} startIcon={<AddIcon />} size="small" sx={{ fontFamily: theme.typography.fontFamily }}>
              Add Ingredient
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>Instructions</Typography>
            {recipeDetails.instructions.map((instruction, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1.5 }} alignItems="flex-start">
                <Typography sx={{ pt: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{index + 1}.</Typography>
                <TextField
                  label={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) => handleDynamicListChange(index, e, 'instructions')}
                  fullWidth
                  multiline
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                <IconButton onClick={() => removeDynamicListItem(index, 'instructions')} size="small" disabled={recipeDetails.instructions.length <= 1}>
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addDynamicListItem('instructions')} startIcon={<AddIcon />} size="small" sx={{ fontFamily: theme.typography.fontFamily }}>
              Add Step
            </Button>
          </Paper>
        )}

        {isRecipe && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Tag Products Used</Typography>
            <Autocomplete
              options={productSearchOptions}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onOpen={() => {
                if (productSearchOptions.length === 0) {
                  handleProductSearch(null, ''); // Fetch initial options
                }
              }}
              onInputChange={handleProductSearch}
              onChange={(event, newValue) => {
                if (newValue && !taggedProducts.some(p => p._id === newValue._id)) {
                  setTaggedProducts([...taggedProducts, newValue]);
                }
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ fontFamily: theme.typography.fontFamily }}>
                  {option.name}
                </Box>
              )}
              loading={productSearchLoading}
              renderInput={(params) => (
                <TextField {...params} label="Search for a product to tag..." variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  InputProps={{ ...params.InputProps, endAdornment: (<>{productSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),}}
                />
              )}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {taggedProducts.map((product) => (
                <Chip
                  key={product._id}
                  label={product.name}
                  onDelete={() => handleTagProductDelete(product)}
                  sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
                />
              ))}
            </Box>
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagDelete(tag)}
                disabled={loading}
                sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
              />
            ))}
          </Box>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={loading} sx={{ borderRadius: '50px', px: 3, fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !title.trim() || !content.trim() || !selectedGroup}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ borderRadius: '50px', px: 4, py: 1.2, fontFamily: theme.typography.fontFamily }}
          >
            {loading ? (initialData ? 'Saving...' : 'Posting...') : (initialData ? 'Save Changes' : 'Submit Post')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default CreatePostForm;
