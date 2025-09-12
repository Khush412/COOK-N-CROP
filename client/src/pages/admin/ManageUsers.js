import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Select, MenuItem, Chip, Button, TextField, Pagination, Checkbox } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
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

  const handleSaveClick = async (userId) => {
    try {
      await adminService.updateUserRole(userId, selectedRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: selectedRole } : u));
      setEditingUserId(null);
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await adminService.toggleUserStatus(userId);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      } catch (err) {
        alert(`Failed to ${action} user.`);
      }
    }
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

  const handleBulkStatusUpdate = async (isActive) => {
    const action = isActive ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} selected users?`)) {
      try {
        await adminService.updateMultipleUserStatuses(selectedUsers, isActive);
        fetchUsers();
        setSelectedUsers([]);
      } catch (err) {
        alert(`Failed to ${action} selected users.`);
      }
    }
  };

  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;
  const numSelected = selectedUsers.length;
  const rowCount = users.length;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ m: 0 }}>Manage Users</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {numSelected > 0 && (
            <>
              <Button variant="contained" color="success" onClick={() => handleBulkStatusUpdate(true)}>Activate ({numSelected})</Button>
              <Button variant="contained" color="warning" onClick={() => handleBulkStatusUpdate(false)}>Deactivate ({numSelected})</Button>
            </>
          )}
          <TextField
            label="Search by Username or Email"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
        </Box>
        <Button variant="outlined" startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />} onClick={handleExport} disabled={exporting}>
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
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center"><Alert severity="error">{error}</Alert></TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => {
                const isItemSelected = isSelected(user._id);
                return (
                  <TableRow key={user._id} hover onClick={(event) => handleSelectClick(event, user._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                    <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                    <TableCell><Tooltip title={user._id}><Typography variant="body2" noWrap sx={{ maxWidth: 80 }}>{user._id}</Typography></Tooltip></TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUserId === user._id ? (
                        <Select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          size="small"
                          sx={{ minWidth: 100 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="premium">Premium</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      ) : (
                        <Typography>{user.role}</Typography>
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
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      {editingUserId === user._id ? (
                        <>
                          <Tooltip title="Save"><IconButton onClick={(e) => { e.stopPropagation(); handleSaveClick(user._id); }} color="success"><SaveIcon /></IconButton></Tooltip>
                          <Tooltip title="Cancel"><IconButton onClick={(e) => { e.stopPropagation(); handleCancelClick(); }}><CancelIcon /></IconButton></Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="View Addresses">
                            <IconButton component={RouterLink} to={`/admin/users/${user._id}/addresses`} onClick={(e) => e.stopPropagation()}><LocationOnIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Role">
                            <IconButton onClick={(e) => { e.stopPropagation(); handleEditClick(user); }} disabled={user._id === currentUser.id}><EditIcon /></IconButton>
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
                              <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }} color="error" disabled={user._id === currentUser.id || user.role === 'admin'}><DeleteIcon /></IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No users found matching your criteria.</Typography>
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
  );
};

export default ManageUsers;
