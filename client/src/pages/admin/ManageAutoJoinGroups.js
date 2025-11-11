import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  useTheme, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  Button, 
  Chip,
  Switch,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Autocomplete
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const ManageAutoJoinGroups = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [config, setConfig] = useState({ groups: [], isActive: false });
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAutoJoinGroupsConfig();
      setConfig(response.data);
    } catch (err) {
      setError('Failed to fetch auto-join groups configuration.');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllGroups = useCallback(async () => {
    try {
      const response = await adminService.getAllPublicGroups();
      setAllGroups(response.data);
    } catch (err) {
      setError('Failed to fetch all public groups.');
      console.error('Error fetching groups:', err);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchAllGroups();
  }, [fetchConfig, fetchAllGroups]);

  const handleToggleActive = async (event) => {
    const isActive = event.target.checked;
    try {
      setSaving(true);
      const updatedGroups = config.groups.map(g => g._id || g);
      const response = await adminService.updateAutoJoinGroupsConfig(updatedGroups);
      setConfig({ ...config, isActive });
      setSuccess('Configuration updated successfully.');
    } catch (err) {
      setError('Failed to update configuration.');
      console.error('Error updating config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddGroup = async () => {
    if (!selectedGroup) return;
    
    // Check if group is already in the list
    const isAlreadyAdded = config.groups.some(
      g => (g._id || g) === selectedGroup._id
    );
    
    if (isAlreadyAdded) {
      setError('This group is already in the auto-join list.');
      return;
    }
    
    try {
      setSaving(true);
      const updatedGroups = [...config.groups.map(g => g._id || g), selectedGroup._id];
      const response = await adminService.updateAutoJoinGroupsConfig(updatedGroups);
      setConfig({ 
        ...config, 
        groups: [...config.groups, selectedGroup] 
      });
      setSelectedGroup(null);
      setSuccess('Group added successfully.');
    } catch (err) {
      setError('Failed to add group.');
      console.error('Error adding group:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGroup = async (groupId) => {
    try {
      setSaving(true);
      const updatedGroups = config.groups
        .filter(g => (g._id || g) !== groupId)
        .map(g => g._id || g);
      
      const response = await adminService.updateAutoJoinGroupsConfig(updatedGroups);
      setConfig({ 
        ...config, 
        groups: config.groups.filter(g => (g._id || g) !== groupId) 
      });
      setSuccess('Group removed successfully.');
    } catch (err) {
      setError('Failed to remove group.');
      console.error('Error removing group:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const groupIds = config.groups.map(g => g._id || g);
      const response = await adminService.updateAutoJoinGroupsConfig(groupIds);
      setSuccess('Configuration saved successfully.');
    } catch (err) {
      setError('Failed to save configuration.');
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Loader size="large" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Auto-Join Groups Configuration
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Configure which groups new users should automatically join upon registration
        </Typography>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardHeader
              title="Auto-Join Groups"
              subheader="Groups that new users will automatically join upon registration"
              sx={{ 
                '& .MuiCardHeader-title': { 
                  fontWeight: 700, 
                  fontFamily: theme.typography.fontFamily 
                },
                '& .MuiCardHeader-subheader': { 
                  fontFamily: theme.typography.fontFamily 
                }
              }}
            />
            <CardContent>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.isActive}
                      onChange={handleToggleActive}
                      disabled={saving}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: theme.typography.fontFamily }}>
                      Enable Auto-Join Groups
                    </Typography>
                  }
                />
              </FormGroup>

              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  fontFamily: theme.typography.fontFamily 
                }}
              >
                Selected Groups
              </Typography>

              {config.groups.length === 0 ? (
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    fontStyle: 'italic', 
                    py: 2,
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  No groups selected for auto-join. Add groups below.
                </Typography>
              ) : (
                <List>
                  {config.groups.map((group) => (
                    <React.Fragment key={group._id || group}>
                      <ListItem>
                        <ListItemText
                          primary={group.name || 'Unknown Group'}
                          secondary={
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.primary"
                              sx={{ fontFamily: theme.typography.fontFamily }}
                            >
                              {group.description || 'No description'}
                            </Typography>
                          }
                          primaryTypographyProps={{ 
                            fontWeight: 600, 
                            fontFamily: theme.typography.fontFamily 
                          }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleRemoveGroup(group._id || group)}
                            disabled={saving}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveConfig}
                  disabled={saving}
                  sx={{ 
                    borderRadius: '50px',
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 600
                  }}
                >
                  {saving ? <Loader size="small" /> : 'Save Configuration'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardHeader
              title="Add Group"
              subheader="Select a public group to add to the auto-join list"
              sx={{ 
                '& .MuiCardHeader-title': { 
                  fontWeight: 700, 
                  fontFamily: theme.typography.fontFamily 
                },
                '& .MuiCardHeader-subheader': { 
                  fontFamily: theme.typography.fontFamily 
                }
              }}
            />
            <CardContent>
              <Autocomplete
                options={allGroups}
                getOptionLabel={(option) => option.name || ''}
                value={selectedGroup}
                onChange={(event, newValue) => setSelectedGroup(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Group" 
                    variant="outlined" 
                    fullWidth
                    sx={{ fontFamily: theme.typography.fontFamily }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                        {option.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontFamily: theme.typography.fontFamily }}
                      >
                        {option.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={`${option.memberCount || 0} members`} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                    </Box>
                  </li>
                )}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddGroup}
                disabled={!selectedGroup || saving}
                sx={{ 
                  borderRadius: '50px',
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600
                }}
              >
                Add to Auto-Join List
              </Button>

              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  How It Works
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  When enabled, new users will automatically join all selected groups upon registration.
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  Only public groups can be added to the auto-join list. Private groups are not eligible.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ManageAutoJoinGroups;