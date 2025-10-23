import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import groupService from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

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
        image={group.coverImage.startsWith('http') ? group.coverImage : `${process.env.REACT_APP_API_URL}${group.coverImage}`}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const data = await groupService.getAllGroups();
        setGroups(data);
        setError(null);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : groups.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <PeopleIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            No groups have been created yet. Be the first!
          </Typography>
          <Button component={RouterLink} to="/community/create" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Create Your First Group
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => ( 
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