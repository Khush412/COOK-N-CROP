import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Avatar,
  Button,
  alpha,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import {
  Block as BlockIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Loader from '../custom_components/Loader';

const BlockedUserCard = ({ blockedUser, onUnblock }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        transition: '0.3s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1, textAlign: 'center' }}>
        <Avatar 
          src={blockedUser.profilePic && blockedUser.profilePic.startsWith('http') ? blockedUser.profilePic : blockedUser.profilePic ? `${process.env.REACT_APP_API_URL}${blockedUser.profilePic}` : undefined} 
          sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            boxShadow: theme.shadows[3],
          }}
        >
          {!blockedUser.profilePic && <PersonIcon />}
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            fontFamily: theme.typography.fontFamily,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {blockedUser.username}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          Blocked on {new Date(blockedUser.blockedAt || blockedUser.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ pt: 0, px: 2, pb: 2, justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => onUnblock(blockedUser._id)} 
          sx={{ 
            fontFamily: theme.typography.fontFamily, 
            borderRadius: '50px',
            px: 3,
          }}
        >
          Unblock
        </Button>
      </CardActions>
    </Card>
  );
};

const BlockedUsersPage = () => {
  const { loadUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const usersPerPage = 6;

  const theme = useTheme();
  const fetchBlockedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getBlockedUsers();
      setBlockedUsers(res.data);
    } catch (err) {
      setError('Failed to load blocked users list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return blockedUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blockedUsers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, page]);

  const handleUnblock = async (userId) => {
    try {
      await userService.blockUser(userId); // The same endpoint toggles the block status
      await loadUser(); // Refresh the main user context
      fetchBlockedUsers(); // Re-fetch the list for this page
    } catch (err) {
      alert('Failed to unblock user.');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
            Blocked Users
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Manage users you've blocked from interacting with you.
          </Typography>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader size="large" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
            Blocked Users
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Manage users you've blocked from interacting with you.
          </Typography>
        </Paper>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Blocked Users
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Manage users you've blocked from interacting with you.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search blocked users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '20px' },
              '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
          
          <Chip 
            label={`${filteredUsers.length} blocked user${filteredUsers.length !== 1 ? 's' : ''}`} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              height: 32,
            }} 
          />
        </Stack>
      </Paper>
      
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        {blockedUsers.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <BlockIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
              You haven't blocked any users.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
              When you block someone, they won't be able to follow or message you.
            </Typography>
          </Box>
        ) : paginatedUsers.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              No blocked users found matching your search.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedUsers.map((blockedUser) => ( 
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={blockedUser._id}>
                  <BlockedUserCard blockedUser={blockedUser} onUnblock={handleUnblock} />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{ 
                    '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                    '& .Mui-selected': { fontWeight: 'bold' }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BlockedUsersPage;