import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Select, MenuItem, Chip, Button, TextField, Pagination, Checkbox, Container, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, Menu, ListItemIcon, ListItemText } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../custom_components/Loader';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, payload, title, message }
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleActionsClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({ page, search: debouncedSearchTerm });
      setUsers(res.users);
      setPage(res.page);
      setTotalPages(res.pages);
    } catch (err) {
      setError('Failed to fetch users.');
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setSelectedRole(user.role);
  };

  const handleCancelClick = () => {
    setEditingUserId(null);
  };

  const openConfirmDialog = (type, payload, title, message) => {
    setConfirmAction({ type, payload, title, message });
    setConfirmDialogOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, payload } = confirmAction;
    try {
      if (type === 'deleteUser') {
        await adminService.deleteUser(payload);
        fetchUsers();
      } else if (type === 'toggleStatus') {
        await adminService.toggleUserStatus(payload.userId);
        setUsers(users.map(u => u._id === payload.userId ? { ...u, isActive: !payload.currentStatus } : u));
      } else if (type === 'bulkStatusUpdate') {
        await adminService.updateMultipleUserStatuses(selectedUsers, payload);
        fetchUsers();
        setSelectedUsers([]);
      }
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleSaveClick = async (userId) => {
    try {
      await adminService.updateUserRole(userId, selectedRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: selectedRole } : u));
      setEditingUserId(null);
    } catch (err) {
      alert(`Failed to update role: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteUser = (userId) => {
    openConfirmDialog('deleteUser', userId, 'Confirm User Deletion', 'Are you sure you want to permanently delete this user? This action cannot be undone.');
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    openConfirmDialog('toggleStatus', { userId, currentStatus }, `Confirm User ${action.charAt(0).toUpperCase() + action.slice(1)}`, `Are you sure you want to ${action} this user?`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminService.exportUsers();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users-export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to export users:', error);
      alert('Failed to export users.');
    } finally {
      setExporting(false);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n._id);
      setSelectedUsers(newSelecteds);
      return;
    }
    setSelectedUsers([]);
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkStatusUpdate = (isActive) => {
    const action = isActive ? 'activate' : 'deactivate';
    openConfirmDialog('bulkStatusUpdate', isActive, `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`, `Are you sure you want to ${action} ${selectedUsers.length} selected users?`);
  };

  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;
  const numSelected = selectedUsers.length;
  const rowCount = users.length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Manage Users
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Oversee and manage all registered users on the platform.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              label="Search by Username or Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            {numSelected > 0 && (
              <>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => handleBulkStatusUpdate(false)}
                  sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, width: { xs: '100%', sm: 'auto' } }}
                >
                  Deactivate Selected ({numSelected})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => handleBulkStatusUpdate(true)}
                  sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, width: { xs: '100%', sm: 'auto' } }}
                >
                  Activate Selected
                </Button>
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={exporting ? <Loader size="small" /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={exporting}
              sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, width: { xs: '100%', sm: 'auto' } }}
            >
              Export
            </Button>
          </Stack>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}><Loader size="large" /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{ minWidth: { xs: 600, sm: 800, md: '100%' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all users' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Joined</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => {
                      const isItemSelected = isSelected(user._id);
                      return (
                        <TableRow 
                          key={user._id} 
                          hover 
                          onClick={(event) => handleSelectClick(event, user._id)} 
                          role="checkbox" 
                          aria-checked={isItemSelected} 
                          tabIndex={-1} 
                          selected={isItemSelected} 
                          sx={{
                            '& td': { py: { xs: 1, sm: 1.5 } },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02)
                            }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `user-checkbox-${user._id}` }}
                            />
                          </TableCell>
                          <TableCell id={`user-checkbox-${user._id}`} sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                              <Box 
                                sx={{ 
                                  width: { xs: 32, sm: 40 }, 
                                  height: { xs: 32, sm: 40 }, 
                                  borderRadius: '50%', 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  color: 'primary.main',
                                  fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                  {user.username}
                                </Typography>
                                {user.name && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                    {user.name}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            {editingUserId === user._id ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
                                  <Select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    <MenuItem value="user" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>User</MenuItem>
                                    <MenuItem value="admin" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Admin</MenuItem>
                                    <MenuItem value="moderator" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Moderator</MenuItem>
                                  </Select>
                                </FormControl>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleSaveClick(user._id)}
                                  sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' }, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={handleCancelClick}
                                  sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <Chip 
                                label={user.role} 
                                size="small" 
                                color={user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'secondary' : 'default'} 
                                onClick={() => handleEditClick(user)}
                                sx={{ cursor: 'pointer', borderRadius: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Chip 
                              label={user.isActive ? 'Active' : 'Inactive'} 
                              size="small" 
                              color={user.isActive ? 'success' : 'error'} 
                              icon={user.isActive ? <CheckCircleOutlineIcon sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }} /> : <BlockIcon sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }} />}
                              sx={{ borderRadius: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(event) => handleActionsClick(event, user)}
                              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
                          <PeopleOutlineIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            No users found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            Try adjusting your search criteria
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      borderRadius: 2,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
        sx={{ '& .MuiMenuItem-root': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } } }}
      >
        <MenuItem 
          component={RouterLink} 
          to={`/user/${selectedUser?.username}`}
          onClick={handleActionsClose}
        >
          <ListItemIcon>
            <PeopleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>View Profile</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to={`/admin/users/${selectedUser?._id}/addresses`}
          onClick={handleActionsClose}
        >
          <ListItemIcon>
            <LocationOnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>View Addresses</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleStatus(selectedUser?._id, selectedUser?.isActive);
          handleActionsClose();
        }}>
          <ListItemIcon>
            {selectedUser?.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{selectedUser?.isActive ? "Deactivate User" : "Activate User"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteUser(selectedUser?._id);
          handleActionsClose();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Delete User</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: theme.typography.fontFamily, pb: 1, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
          {confirmAction?.title}
        </DialogTitle>
        <DialogContent sx={{ fontFamily: theme.typography.fontFamily }}>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {confirmAction?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={executeConfirmAction} 
            variant="contained" 
            autoFocus
            sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily, width: { xs: '100%', sm: 'auto' } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;