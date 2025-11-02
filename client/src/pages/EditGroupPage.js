import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Snackbar, Alert, alpha, CircularProgress, Tabs, Tab, Chip, TextField, Divider,
  List, ListItemIcon, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Menu, MenuItem, Stack, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import CreateGroupForm from '../components/CreateGroupForm';
import groupService from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

const JoinRequestsManager = ({ group }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // Add theme hook

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupService.getJoinRequests(group._id);
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch join requests", error);
    } finally {
      setLoading(false);
    }
  }, [group._id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequest = async (userId, action) => {
    try {
      await groupService.handleJoinRequest(group._id, userId, action);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    }
  };

  if (loading) return <CircularProgress />;
  if (requests.length === 0) return <Typography sx={{ fontFamily: theme.typography.fontFamily }}>No pending join requests.</Typography>;

  return (
    <List>
      {requests.map(request => (
        <ListItem key={request._id}>
          <ListItemAvatar><Avatar src={request.profilePic} /></ListItemAvatar>
          <ListItemText 
            primary={<Typography sx={{ fontFamily: theme.typography.fontFamily }}>{request.username}</Typography>} 
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" size="small" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }} onClick={() => handleRequest(request._id, 'approve')}>Approve</Button>
            <Button variant="outlined" size="small" color="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }} onClick={() => handleRequest(request._id, 'deny')}>Deny</Button>
          </Stack>
        </ListItem>
      ))}
    </List>
  );
};

const RulesManager = ({ group, onSave }) => {
  const [rules, setRules] = useState(group.rules || []);
  const theme = useTheme(); // Add theme hook

  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleAddRule = () => {
    setRules([...rules, { title: '', description: '' }]);
  };

  const handleRemoveRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const handleSave = () => {
    // Filter out empty rules before saving
    const validRules = rules.filter(rule => rule.title.trim() !== '');
    const formData = new FormData();
    formData.append('rules', JSON.stringify(validRules));
    onSave(formData);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Manage Group Rules</Typography>
      {rules.map((rule, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <TextField
              label={`Rule ${index + 1} Title`}
              value={rule.title}
              onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
              fullWidth size="small"
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
            <Button size="small" color="error" onClick={() => handleRemoveRule(index)} sx={{ alignSelf: 'flex-end', fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Remove</Button>
          </Stack>
        </Paper>
      ))}
      <Button onClick={handleAddRule} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Add Rule</Button>
      <Button onClick={handleSave} variant="contained" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Save Rules</Button>
    </Stack>
  );
};

const FlairManager = ({ group, onSave }) => {
  const [flairs, setFlairs] = useState(group.flairs || []);
  const [newFlairText, setNewFlairText] = useState('');
  const theme = useTheme(); // Add theme hook

  const handleAddFlair = () => {
    if (newFlairText.trim() && !flairs.some(f => f.text === newFlairText.trim())) {
      const newFlairs = [...flairs, { text: newFlairText.trim(), color: '#808080', backgroundColor: '#e0e0e0' }];
      const formData = new FormData();
      formData.append('flairs', JSON.stringify(newFlairs));
      onSave(formData);
      setNewFlairText('');
    }
  };

  const handleRemoveFlair = (text) => {
    const newFlairs = flairs.filter(f => f.text !== text);
    setFlairs(newFlairs);
    const formData = new FormData();
    formData.append('flairs', JSON.stringify(newFlairs));
    onSave(formData);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Manage Flairs</Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          label="New Flair Text"
          value={newFlairText}
          onChange={(e) => setNewFlairText(e.target.value)}
          size="small"
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          sx={{ '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <Button onClick={handleAddFlair} variant="contained" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Add</Button>
      </Stack>
      <List>
        {flairs.map(flair => (
          <ListItem key={flair.text} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveFlair(flair.text)}><DeleteIcon /></IconButton>}>
            <Chip 
              label={flair.text} 
              sx={{ 
                borderRadius: '8px', // More rounded
                fontFamily: theme.typography.fontFamily,
                bgcolor: flair.backgroundColor,
                color: flair.color
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

const MemberManager = ({ group }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'promote', 'demote', 'remove'
  const theme = useTheme(); // Add theme hook

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroupMembers(group._id);
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  }, [group._id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleActionClick = (type) => { // 'promote', 'demote', 'ban'
    setActionType(type);
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'promote') {
        await groupService.updateMemberRole(group._id, selectedMember._id, 'moderator');
      } else if (actionType === 'demote') {
        await groupService.updateMemberRole(group._id, selectedMember._id, 'member');
      } else if (actionType === 'ban') {
        await groupService.removeMember(group._id, selectedMember._id);
      }
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${actionType} member`, error);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const isCreator = (memberId) => group.creator._id === memberId;
  const isModerator = (memberId) => group.moderators && group.moderators.some(mod => mod._id === memberId);

  if (loading) return <CircularProgress />;
  return (
    <>
      <List>
        {members.map(member => (
          <ListItem key={member._id} secondaryAction={
            !isCreator(member._id) && (user.id === group.creator._id || user.role === 'admin') && (
              <IconButton edge="end" onClick={(e) => handleMenuOpen(e, member)}><MoreVertIcon /></IconButton>
            )
          }> {/* Added profilePic check */}
            <ListItemAvatar><Avatar src={member.profilePic && member.profilePic.startsWith('http') ? member.profilePic : member.profilePic ? `${process.env.REACT_APP_API_URL}${member.profilePic}` : undefined} /></ListItemAvatar>
            <ListItemText
              primary={<Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>{member.username}</Typography>}
              secondary={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>{isCreator(member._id) ? 'Creator' : isModerator(member._id) ? 'Moderator' : 'Member'}</Typography>}
            />
          </ListItem>
        ))}
      </List>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily } }}
      >
        {selectedMember && !isModerator(selectedMember._id) && (
          <MenuItem onClick={() => handleActionClick('promote')}>
            <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
            <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Promote to Moderator</Typography>
          </MenuItem>
        )}
        {selectedMember && isModerator(selectedMember._id) && (
          <MenuItem onClick={() => handleActionClick('demote')}>
            <ListItemIcon><RemoveCircleOutlineIcon fontSize="small" /></ListItemIcon>
            <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Demote to Member</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleActionClick('ban')} sx={{ color: 'error.main' }}>
          <ListItemIcon><NoAccountsIcon fontSize="small" color="error" /></ListItemIcon>
          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Ban from Group</Typography>
        </MenuItem>
      </Menu>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily }}>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to {actionType} <strong>{selectedMember?.username}</strong>? 
            {actionType === 'ban' && ' This will permanently remove them and prevent them from rejoining.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Cancel</Button>
          <Button onClick={handleConfirmAction} color={actionType === 'remove' ? 'error' : 'primary'} autoFocus sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const EditGroupPage = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const groupData = await groupService.getGroupDetails(slug);
      setGroup(groupData);
    } catch (err) {
      setError('Failed to load group details. You may not have permission to edit this group.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const handleEditGroupSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const updatedGroup = await groupService.updateGroup(group._id, formData);
      setSnackbar({ open: true, message: 'Group updated successfully!', severity: 'success' });
      setTimeout(() => navigate(`/g/${updatedGroup.slug}`), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update group.', severity: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsSubmitting(true);
    try {
      await groupService.deleteGroup(group._id);
      setSnackbar({ open: true, message: 'Group deleted successfully.', severity: 'success' });
      navigate('/community/explore');
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete group.', severity: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md" sx={{ mt: 12, py: 4 }}><Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert></Container>;
  if (!group) return null; // Don't render the form until group data is loaded

  return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Edit Group: {group.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Update your community's details and rules.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={handleTabChange} 
            aria-label="edit group tabs"
            sx={{ 
              '& .MuiTab-root': { fontFamily: theme.typography.fontFamily },
              '& .Mui-selected': { fontFamily: theme.typography.fontFamily }
            }}
          >
            <Tab label="Details" sx={{ fontFamily: theme.typography.fontFamily }} />
            <Tab label="Rules" sx={{ fontFamily: theme.typography.fontFamily }} />
            <Tab label="Flairs" sx={{ fontFamily: theme.typography.fontFamily }} /> {/* Moved Flairs to be the third tab */}
            <Tab label="Manage Members" sx={{ fontFamily: theme.typography.fontFamily }} />
            {group.isPrivate && <Tab label="Join Requests" sx={{ fontFamily: theme.typography.fontFamily }} />} {/* This will now be the 5th tab if private */}
          </Tabs>
        </Box>
        {tab === 0 && (
          <CreateGroupForm
            onSubmit={handleEditGroupSubmit}
            onCancel={() => navigate(`/g/${slug}`)}
            loading={isSubmitting}
            initialData={group}
          />
        )}
        {tab === 1 && <RulesManager group={group} onSave={handleEditGroupSubmit} />}
        {tab === 2 && <FlairManager group={group} onSave={handleEditGroupSubmit} />}
        {tab === 3 && <MemberManager group={group} />}
        {tab === 4 && group.isPrivate && <JoinRequestsManager group={group} />}
      </Paper>
      
      {/* Delete Group Section - only for creator or admin */}
      {(user?.id === group?.creator?._id || user?.role === 'admin') && (
        <>
          <Divider sx={{ my: 4 }}><Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>Danger Zone</Typography></Divider>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main', borderRadius: 3 }}>
            <Typography variant="h6" color="error.main" gutterBottom sx={{ fontFamily: theme.typography.fontFamily }}>Delete This Group</Typography>
            <Typography variant="body2" sx={{ mb: 2, fontFamily: theme.typography.fontFamily }}>
              Once you delete a group, there is no going back. All posts and member associations will be permanently removed. Please be certain.
            </Typography>
            <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} disabled={isSubmitting} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
              Delete Group
            </Button>
          </Paper>
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: theme.typography.fontFamily }}>{"Confirm Group Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you absolutely sure you want to delete the group "{group?.name}"? This action is irreversible and will delete all posts within the group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>Cancel</Button>
          <Button onClick={handleDeleteGroup} color="error" autoFocus disabled={isSubmitting} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditGroupPage;