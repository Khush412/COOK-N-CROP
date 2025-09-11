import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Select, MenuItem, Chip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getAllUsers();
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
      setUsers(prevUsers => prevUsers.map(u => u._id === userId ? { ...u, role: selectedRole } : u));
      setEditingUserId(null);
    } catch (err) {
      alert('Failed to update role.');
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const res = await adminService.toggleUserStatus(userId);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      } catch (err) {
        alert(`Failed to ${action} user.`);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        alert('Failed to delete user.');
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
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `cook-n-crop-users-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export users.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Manage Users</Typography>
        <Button variant="outlined" startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />} onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
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
            {users.map((user) => (
              <TableRow key={user._id} hover>
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
                      <Tooltip title="Save"><IconButton onClick={() => handleSaveClick(user._id)} color="success"><SaveIcon /></IconButton></Tooltip>
                      <Tooltip title="Cancel"><IconButton onClick={handleCancelClick}><CancelIcon /></IconButton></Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit Role">
                        <IconButton onClick={() => handleEditClick(user)} disabled={user._id === currentUser.id}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                        <span> {/* Span is needed for disabled Tooltip */}
                          <IconButton onClick={() => handleToggleStatus(user._id, user.isActive)} disabled={user._id === currentUser.id || user.role === 'admin'} color={user.isActive ? 'warning' : 'success'}>
                            {user.isActive ? <BlockIcon /> : <CheckCircleOutlineIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Permanently Delete User">
                        <span>
                          <IconButton onClick={() => handleDeleteUser(user._id)} color="error" disabled={user._id === currentUser.id || user.role === 'admin'}><DeleteIcon /></IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ManageUsers;
