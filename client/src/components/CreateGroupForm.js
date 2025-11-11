import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Stack, Avatar, FormControlLabel, Switch, IconButton, Paper, Typography, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../custom_components/Loader';

const CreateGroupForm = ({ onSubmit, onCancel, loading, initialData }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState([{ title: '', description: '' }]);
  const [flairs, setFlairs] = useState([]); // New state for flairs
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:')) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIsPrivate(initialData.isPrivate || false);
      setRules(initialData.rules?.length > 0 ? initialData.rules : [{ title: '', description: '' }]);
      setFlairs(initialData.flairs || []); // Initialize flairs
      setImagePreview(initialData.coverImage || '');
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const addRule = () => setRules([...rules, { title: '', description: '' }]);

  const removeRule = (index) => {
    if (rules.length > 1) {
      const newRules = [...rules];
      newRules.splice(index, 1);
      setRules(newRules);
    }
  };

  const handleFlairChange = (index, field, value) => {
    const newFlairs = [...flairs];
    newFlairs[index][field] = value;
    setFlairs(newFlairs);
  };

  const addFlair = () => setFlairs([...flairs, { text: '', color: '#808080', backgroundColor: '#e0e0e0' }]);

  const removeFlair = (index) => {
    setFlairs(flairs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Name is only appended if it's not an edit, as it's immutable
    if (!initialData) {
      formData.append('name', name);
    }
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);
    formData.append('flairs', JSON.stringify(flairs.filter(f => f.text.trim() !== ''))); // Pass flairs to backend
    formData.append('rules', JSON.stringify(rules.filter(r => r.title.trim() !== '')));
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="Group Name"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading || !!initialData} // Disable if editing
          helperText={initialData ? "Group name cannot be changed." : "Max 30 characters. This cannot be changed later."}
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
        />
        <TextField
          label="Group Description"
          fullWidth
          required
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          helperText="Explain what your group is about."
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
        />
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Cover Image</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={getImageUrl(imagePreview)} variant="rounded" sx={{ width: 100, height: 100 }} />
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ fontFamily: theme.typography.fontFamily }}>
              Upload Image
            </Button>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Group Settings</Typography>
          <FormControlLabel
            control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
            label={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>Private Group</Typography>}
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            If private, users must be approved to join and see content.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Group Rules</Typography>
          <Stack spacing={2}>
            {rules.map((rule, index) => (
              <Stack key={index} spacing={1} direction="row" alignItems="flex-start">
                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                  <TextField
                    label={`Rule ${index + 1} Title`}
                    value={rule.title}
                    onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    label="Description (optional)"
                    value={rule.description}
                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                    fullWidth
                    multiline
                    size="small"
                    InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
                <IconButton onClick={() => removeRule(index)} disabled={rules.length <= 1}><DeleteIcon /></IconButton>
              </Stack>
            ))}
          </Stack>
          <Button startIcon={<AddIcon />} onClick={addRule} sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Add Rule</Button>
        </Paper>
        {/* Flair Management Section */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Post Flairs (Optional)</Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Define custom tags users can apply to posts in this group.
          </Typography>
          <Stack spacing={2}>
            {flairs.map((flair, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  label={`Flair ${index + 1} Text`}
                  value={flair.text}
                  onChange={(e) => handleFlairChange(index, 'text', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                {/* Add color pickers here if you want to allow custom colors */}
                <Chip
                  label={flair.text || 'Preview'}
                  size="small"
                  sx={{
                    borderRadius: '8px', // More rounded
                    bgcolor: flair.backgroundColor,
                    color: flair.color,
                    fontFamily: theme.typography.fontFamily
                  }}
                />
                <IconButton onClick={() => removeFlair(index)}><DeleteIcon /></IconButton>
              </Stack>
            ))}
          </Stack>
          <Button startIcon={<AddIcon />} onClick={addFlair} sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Add Flair</Button>
        </Paper>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={loading} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Cancel</Button>
          <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <Loader size="small" /> : null} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Group')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default CreateGroupForm;