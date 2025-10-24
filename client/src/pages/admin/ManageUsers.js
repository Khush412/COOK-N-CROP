import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Select, MenuItem, Chip, Button, TextField, Pagination, Checkbox, Container, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

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
      alert('Failed to update role.'); // Simple alert for now
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
    <Container maxWidth="xl" sx={{ mt: 12, py: 4, zoom: 0.9 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Manage Users
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Oversee and manage all registered users on the platform.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search by Username or Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            {numSelected > 0 && (
              <>
                <Button variant="contained" color="success" onClick={() => handleBulkStatusUpdate(true)} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>Activate ({numSelected})</Button>
                <Button variant="contained" color="warning" onClick={() => handleBulkStatusUpdate(false)} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>Deactivate ({numSelected})</Button>
              </>
            )}
          </Stack>
          <Button variant="outlined" startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />} onClick={handleExport} disabled={exporting} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}>
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </Box>
        <TableContainer>
          <Table>
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
                <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"><Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert></TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const isItemSelected = isSelected(user._id);
                  return (
                    <TableRow key={user._id} hover onClick={(event) => handleSelectClick(event, user._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                      <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                      <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>{user.username}</TableCell>
                      <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{user.email}</TableCell>
                      <TableCell>
                        {editingUserId === user._id ? (
                          <Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            size="small"
                            sx={{ minWidth: 100, fontFamily: theme.typography.fontFamily }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem value="user" sx={{ fontFamily: theme.typography.fontFamily }}>User</MenuItem>
                            <MenuItem value="admin" sx={{ fontFamily: theme.typography.fontFamily }}>Admin</MenuItem>
                          </Select>
                        ) : (
                          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>{user.role}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {editingUserId === user._id ? (
                            <>
                              <Tooltip title="Save"><IconButton onClick={(e) => { e.stopPropagation(); handleSaveClick(user._id); }} color="success"><SaveIcon /></IconButton></Tooltip>
                              <Tooltip title="Cancel"><IconButton onClick={(e) => { e.stopPropagation(); handleCancelClick(); }}><CancelIcon /></IconButton></Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="View Addresses">
                                <IconButton component={RouterLink} to={`/admin/users/${user._id}/addresses`} onClick={(e) => e.stopPropagation()}><LocationOnIcon fontSize="small" /></IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Role">
                                <IconButton onClick={(e) => { e.stopPropagation(); handleEditClick(user); }} disabled={user._id === currentUser.id}><EditIcon fontSize="small" /></IconButton>
                              </Tooltip>
                              <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                                <span>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleToggleStatus(user._id, user.isActive); }} disabled={user._id === currentUser.id || user.role === 'admin'} color={user.isActive ? 'warning' : 'success'}>
                                    {user.isActive ? <BlockIcon /> : <CheckCircleOutlineIcon />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Permanently Delete User">
                                <span>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }} color="error" disabled={user._id === currentUser.id || user.role === 'admin'}><DeleteIcon fontSize="small" /></IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <PeopleOutlineIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No users found matching your criteria.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: theme.typography.fontFamily }}>
          <WarningAmberIcon color="warning" />
          {confirmAction?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: theme.typography.fontFamily }}>
            {confirmAction?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ fontFamily: theme.typography.fontFamily }}>
            Cancel
          </Button>
          <Button onClick={executeConfirmAction} color="error" variant="contained" autoFocus sx={{ fontFamily: theme.typography.fontFamily }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageUsers;
