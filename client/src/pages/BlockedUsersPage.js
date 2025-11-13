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
  Zoom,
  Slide,
  Collapse,
  useTheme,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import {
  Block as BlockIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import Loader from '../custom_components/Loader';

const BlockedUserCard = ({ blockedUser, onUnblock, index }) => {
  const theme = useMuiTheme();
  
  return (
    <Zoom in={true} timeout={500 + (index * 100)}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: theme.shadows[4],
          '&:hover': {
            boxShadow: theme.shadows[12],
            borderColor: alpha(theme.palette.error.main, 0.7),
            transform: 'translateY(-6px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1.5, textAlign: 'center' }}>
          <Avatar 
            src={blockedUser.profilePic && blockedUser.profilePic.startsWith('http') ? blockedUser.profilePic : blockedUser.profilePic ? `${process.env.REACT_APP_API_URL}${blockedUser.profilePic}` : undefined} 
            sx={{ 
              width: 90, 
              height: 90, 
              mx: 'auto', 
              mb: 2.5,
              boxShadow: theme.shadows[6],
              border: `3px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            {!blockedUser.profilePic && <PersonIcon />}
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              fontFamily: theme.typography.fontFamily,
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: theme.palette.error.main,
            }}
          >
            {blockedUser.username}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: 2.5, pb: 2.5, justifyContent: 'center', borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => onUnblock(blockedUser._id)} 
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              fontWeight: 600,
              borderRadius: '50px',
              px: 4,
              py: 1.2,
              boxShadow: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 6,
              }
            }}
          >
            Unblock User
          </Button>
        </CardActions>
      </Card>
    </Zoom>
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
        <Slide direction="down" in={true} timeout={600}>
          <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
              Blocked Users
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Manage users you've blocked from interacting with you.
            </Typography>
          </Paper>
        </Slide>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader size="large" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Slide direction="down" in={true} timeout={600}>
          <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
              Blocked Users
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Manage users you've blocked from interacting with you.
            </Typography>
          </Paper>
        </Slide>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Slide direction="down" in={true} timeout={600}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon sx={{ fontSize: 36, color: theme.palette.error.main }} /> Blocked Users
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Manage users you've blocked from interacting with you.
          </Typography>
        </Paper>
      </Slide>
      
      <Slide direction="up" in={true} timeout={800}>
        <Paper elevation={4} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, mb: 4, border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search blocked users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  }
                },
                '& .MuiInputBase-input': { 
                  fontFamily: theme.typography.fontFamily,
                  py: 1.5,
                }
              }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            
            <Chip 
              label={`${filteredUsers.length} blocked user${filteredUsers.length !== 1 ? 's' : ''}`} 
              icon={<BlockIcon />}
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                height: 36,
                fontWeight: 600,
                fontSize: '1rem',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              }} 
            />
          </Stack>
        </Paper>
      </Slide>
      
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
        {blockedUsers.length === 0 ? (
          <Slide direction="up" in={true} timeout={1000}>
            <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2, fontWeight: 700 }}>
                You haven't blocked any users.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                When you block someone, they won't be able to follow or message you.
              </Typography>
            </Box>
          </Slide>
        ) : paginatedUsers.length === 0 ? (
          <Slide direction="up" in={true} timeout={1000}>
            <Box sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                No blocked users found matching your search.
              </Typography>
            </Box>
          </Slide>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedUsers.map((blockedUser, index) => ( 
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={blockedUser._id}>
                  <Collapse in={true} timeout={500 + (index * 100)}>
                    <BlockedUserCard blockedUser={blockedUser} onUnblock={handleUnblock} index={index} />
                  </Collapse>
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Slide direction="up" in={true} timeout={1200}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="error"
                    siblingCount={1}
                    boundaryCount={1}
                    size="large"
                    sx={{ 
                      '& .MuiPaginationItem-root': { 
                        fontFamily: theme.typography.fontFamily,
                        borderRadius: '12px',
                        margin: '0 2px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        }
                      },
                      '& .Mui-selected': { 
                        fontWeight: 'bold',
                        backgroundColor: theme.palette.error.main,
                        color: theme.palette.error.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.error.dark,
                        }
                      }
                    }}
                  />
                </Slide>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BlockedUsersPage;