import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  useTheme, 
  alpha,
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
  Tooltip,
  CircularProgress,
  Stack,
  InputAdornment,
  Avatar
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const ManageAutoJoinGroups = () => {
  const theme = useMuiTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [config, setConfig] = useState({ groups: [], isActive: false });
  const [allGroups, setAllGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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

  // Filter groups based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = allGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(filtered);
    }
  }, [searchTerm, allGroups]);

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

  const handleAddGroup = async (group) => {
    // Check if group is already in the list
    const isAlreadyAdded = config.groups.some(
      g => (g._id || g) === group._id
    );
    
    if (isAlreadyAdded) {
      setError('This group is already in the auto-join list.');
      return;
    }
    
    try {
      setSaving(true);
      const updatedGroups = [...config.groups.map(g => g._id || g), group._id];
      const response = await adminService.updateAutoJoinGroupsConfig(updatedGroups);
      setConfig({ 
        ...config, 
        groups: [...config.groups, group] 
      });
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

  // Check if a group is already selected
  const isGroupSelected = (groupId) => {
    return config.groups.some(g => (g._id || g) === groupId);
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '1.75rem', sm: '2rem', md: '3rem' } }}>
          Auto-Join Groups Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Configure which groups new users should automatically join upon registration
        </Typography>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <CardHeader
          title="Auto-Join Configuration"
          subheader="Manage groups that new users will automatically join upon registration"
          sx={{ 
            '& .MuiCardHeader-title': { 
              fontWeight: 700, 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            },
            '& .MuiCardHeader-subheader': { 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            },
            background: alpha(theme.palette.background.default, 0.5)
          }}
        />
        <CardContent>
          <FormGroup sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.isActive}
                  onChange={handleToggleActive}
                  disabled={saving}
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.success.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Enable Auto-Join Groups
                </Typography>
              }
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              When enabled, new users will automatically join all selected groups upon registration.
            </Typography>
          </FormGroup>

          {/* Stats Overview */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 4 }}>
            <Grid item size={{ xs: 6, sm: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  background: alpha(theme.palette.background.default, 0.7)
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  {config.groups.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Groups
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item size={{ xs: 6, sm: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  background: alpha(theme.palette.background.default, 0.7)
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ color: theme.palette.secondary.main, fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  {config.groups.reduce((total, group) => total + (group.memberCount || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Members
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item size={{ xs: 6, sm: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  background: alpha(theme.palette.background.default, 0.7)
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CheckCircleIcon 
                    sx={{ 
                      color: config.isActive ? theme.palette.success.main : theme.palette.warning.main,
                      fontSize: { xs: 20, sm: 24 }
                    }} 
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Status
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item size={{ xs: 6, sm: 3 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  background: alpha(theme.palette.background.default, 0.7)
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <GroupIcon sx={{ color: theme.palette.info.main, fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  {allGroups.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Public Groups
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              mb: 2, 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            Selected Groups ({config.groups.length})
          </Typography>

          {config.groups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GroupIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'grey.400', mb: 2 }} />
              <Typography 
                color="text.secondary" 
                sx={{ 
                  fontStyle: 'italic', 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                No groups selected for auto-join. Search and add groups below.
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              border: `1px solid ${theme.palette.divider}`, 
              borderRadius: 2, 
              overflow: 'hidden' 
            }}>
              {config.groups.map((group) => (
                <React.Fragment key={group._id || group}>
                  <ListItem 
                    sx={{ 
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                      cursor: 'pointer',
                      py: { xs: 1, sm: 1.5 }
                    }}
                    component={RouterLink}
                    to={`/g/${group.slug || group._id}`}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {group.name || 'Unknown Group'}
                        </Typography>
                      }
                      secondary={
                        <Box component="div" sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip 
                              icon={<PeopleIcon sx={{ fontSize: { xs: 12, sm: 16 } }} />} 
                              label={`${group.memberCount || 0} members`} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: { xs: 20, sm: 24 }, 
                                fontFamily: theme.typography.fontFamily,
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }} 
                            />
                            <Chip 
                              label={group.description || 'No description'} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: { xs: 20, sm: 24 }, 
                                fontFamily: theme.typography.fontFamily,
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }} 
                            />
                          </Stack>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove from auto-join">
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveGroup(group._id || group);
                          }}
                          disabled={saving}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.error.main, 0.1) 
                            },
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}

          {/* Divider between sections */}
          <Divider sx={{ my: 4 }} />

          {/* Search and Add Groups Section */}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2, 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              Search & Add Groups
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Search Results ({searchResults.length})
            </Typography>
            
            {searchResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <GroupIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'grey.400', mb: 2 }} />
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    fontStyle: 'italic', 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {searchTerm ? 'No groups found matching your search.' : 'Start typing to search for groups.'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2, 
                overflow: 'hidden'
              }}>
                {searchResults.map((group) => (
                  <React.Fragment key={group._id}>
                    <ListItem 
                      sx={{ 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                        alignItems: 'flex-start',
                        py: { xs: 1, sm: 1.5 }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1), 
                          color: theme.palette.primary.main,
                          mr: 2,
                          mt: 0.5,
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 }
                        }}
                      >
                        <GroupIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {group.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="div" sx={{ mt: 0.5 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              component="div"
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                            >
                              {group.description || 'No description available'}
                            </Typography>
                            <Chip 
                              icon={<PeopleIcon sx={{ fontSize: { xs: 12, sm: 16 } }} />} 
                              label={`${group.memberCount || 0} members`} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: { xs: 20, sm: 24 }, 
                                fontFamily: theme.typography.fontFamily,
                                fontSize: { xs: '0.625rem', sm: '0.75rem' }
                              }} 
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction sx={{ top: '50%', transform: 'translateY(-50%)' }}>
                        {isGroupSelected(group._id) ? (
                          <Chip 
                            label="Added" 
                            size="small" 
                            color="success" 
                            sx={{ 
                              height: { xs: 20, sm: 24 }, 
                              fontFamily: theme.typography.fontFamily,
                              fontSize: { xs: '0.625rem', sm: '0.75rem' }
                            }} 
                          />
                        ) : (
                          <Tooltip title="Add to auto-join">
                            <IconButton 
                              edge="end" 
                              aria-label="add"
                              onClick={() => handleAddGroup(group)}
                              disabled={saving}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.success.main, 0.1) 
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 }
                              }}
                            >
                              <AddIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={handleSaveConfig}
              disabled={saving}
              sx={{ 
                borderRadius: '50px',
                fontFamily: theme.typography.fontFamily,
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ManageAutoJoinGroups;