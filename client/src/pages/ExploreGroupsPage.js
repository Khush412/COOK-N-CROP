import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Alert,
  Stack,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  People as PeopleIcon, 
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import groupService from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../custom_components/Loader';

const GroupCard = ({ group }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8],
        },
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/g/${group.slug}`)}
    >
      <CardMedia
        component="img"
        height="140"
        image={group.coverImage ? (group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`) : '/images/default-group-cover.png'}
        alt={`${group.name} cover image`}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
          {group.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: theme.typography.fontFamily
        }}>
          {group.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, mt: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
          </Typography>
        </Stack>
      </CardActions>
    </Card>
  );
};

const ExploreGroupsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const data = await groupService.getAllGroups();
        setGroups(data);
        setFilteredGroups(data);
        setError(null);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    // Filter and sort groups based on search term and sort option
    let result = [...groups];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'members':
        result.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        // Default sorting (newest)
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredGroups(result);
  }, [searchTerm, sortOption, groups]);

  const handleCreateGroupClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/community/create');
    } else {
      navigate('/community/create');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
              Explore Groups
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Discover communities around your favorite food topics.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreateGroupClick}
            startIcon={<AddIcon />}
            sx={{ fontFamily: theme.typography.fontFamily, borderRadius: '50px' }}
          >
            Create Group
          </Button>
        </Stack>
        
        {/* Search and Filter Section */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: '20px' },
                fontFamily: theme.typography.fontFamily
              }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            
            {/* Sort Options */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                Sort by:
              </Typography>
              <ToggleButtonGroup
                value={sortOption}
                exclusive
                onChange={(e, newValue) => newValue && setSortOption(newValue)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    fontFamily: theme.typography.fontFamily,
                    textTransform: 'none',
                    borderRadius: '20px',
                    border: 'none',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="newest">Newest</ToggleButton>
                <ToggleButton value="oldest">Oldest</ToggleButton>
                <ToggleButton value="members">Most Members</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Paper>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}><Loader size="medium" /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredGroups.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <PeopleIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            {searchTerm ? 'No groups match your search.' : 'No groups have been created yet. Be the first!'}
          </Typography>
          <Button component={RouterLink} to="/community/create" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Create Your First Group
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => ( 
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group._id}>
              <GroupCard group={group} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ExploreGroupsPage;