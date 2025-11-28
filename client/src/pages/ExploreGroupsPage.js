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
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  People as PeopleIcon, 
  Search as SearchIcon,
} from '@mui/icons-material';
import groupService from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../custom_components/Loader';

const GroupCard = ({ group }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isMobile ? 2 : 4,
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
        height={isMobile ? "120" : "140"}
        image={group.coverImage ? (group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`) : '/images/default-group-cover.png'}
        alt={`${group.name} cover image`}
      />
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
        <Typography 
          gutterBottom 
          variant={isMobile ? "h6" : "h5"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            fontFamily: theme.typography.fontFamily,
            fontSize: isMobile ? '1.1rem' : '1.5rem'
          }}
        >
          {group.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: isMobile ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: theme.typography.fontFamily,
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}
        >
          {group.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: isMobile ? 1.5 : 2, pb: isMobile ? 1.5 : 2, mt: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PeopleIcon fontSize={isMobile ? "small" : "medium"} color="action" />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
          </Typography>
        </Stack>
      </CardActions>
    </Card>
  );
};

const ExploreGroupsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 2, sm: 3 } }}>
      <Paper sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: { xs: 2, sm: 3, md: 4 }, 
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` 
      }}>
        <Stack 
          direction={isMobile ? "column" : "row"} 
          justifyContent="space-between" 
          alignItems={isMobile ? "flex-start" : "center"} 
          sx={{ mb: { xs: 2, sm: 2.5 } }}
          spacing={isMobile ? 2 : 0}
        >
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 1.5, 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
              }}
            >
              Explore Groups
            </Typography>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary" 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
              }}
            >
              Discover communities around your favorite food topics.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreateGroupClick}
            startIcon={<AddIcon />}
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              borderRadius: '50px',
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5, md: 1.5 },
              minWidth: { xs: 'auto', sm: '100px', md: '120px' }
            }}
            fullWidth={isMobile}
          >
            Create Group
          </Button>
        </Stack>
        
        {/* Search and Filter Section */}
        <Paper sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          mb: { xs: 2, sm: 2.5, md: 3 }, 
          borderRadius: { xs: 2, sm: 2.5, md: 3 } 
        }}>
          <Stack spacing={isMobile ? 1 : 1.5}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize={isMobile ? "small" : "small"} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: isMobile ? '15px' : '20px',
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                },
                fontFamily: theme.typography.fontFamily
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                } 
              }}
              size={isMobile ? "small" : "small"}
            />
            
            {/* Sort Options */}
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={isMobile ? 1 : 1.5} 
              alignItems={isMobile ? "flex-start" : "center"}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                }}
              >
                Sort by:
              </Typography>
              <ToggleButtonGroup
                value={sortOption}
                exclusive
                onChange={(e, newValue) => newValue && setSortOption(newValue)}
                size={isMobile ? "small" : "small"}
                sx={{
                  '& .MuiToggleButton-root': {
                    fontFamily: theme.typography.fontFamily,
                    textTransform: 'none',
                    borderRadius: isMobile ? '15px' : '20px',
                    border: 'none',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    px: isMobile ? 1 : 1.5,
                    py: isMobile ? 0.5 : 0.75,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }
                  }
                }}
                orientation={isMobile ? "vertical" : "horizontal"}
                fullWidth={isMobile}
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
        <Paper sx={{ 
          p: isMobile ? 3 : 6, 
          textAlign: 'center', 
          borderRadius: isMobile ? 2 : 3 
        }}>
          <PeopleIcon sx={{ 
            fontSize: isMobile ? 50 : 80, 
            color: 'grey.400', 
            mb: isMobile ? 1 : 2 
          }} />
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.9rem' : '1.25rem'
            }}
          >
            {searchTerm ? 'No groups match your search.' : 'No groups have been created yet. Be the first!'}
          </Typography>
          <Button 
            component={RouterLink} 
            to="/community/create" 
            variant="contained" 
            sx={{ 
              mt: isMobile ? 2 : 3, 
              borderRadius: '50px', 
              px: isMobile ? 2 : 4, 
              py: isMobile ? 1 : 2,
              fontFamily: theme.typography.fontFamily,
              fontSize: isMobile ? '0.9rem' : '0.875rem'
            }}
            fullWidth={isMobile}
          >
            {isMobile ? "Create Group" : "Create Your First Group"}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={isMobile ? 1.5 : 3}>
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