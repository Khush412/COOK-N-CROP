import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, formatDistanceToNow } from 'date-fns';
import CommentIcon from '@mui/icons-material/Comment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import userService from '../services/userService';

const PublicProfilePage = () => {
  const { username } = useParams();
  const theme = useTheme();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getPublicProfile(username);
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { user, posts, comments } = profileData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            src={user.profilePic}
            alt={user.username}
            sx={{ width: 100, height: 100, fontSize: 48 }}
          >
            {!user.profilePic && user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {user.bio || 'No bio provided.'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Joined on {format(new Date(user.createdAt), 'PPP')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile activity tabs">
            <Tab icon={<PostAddIcon />} iconPosition="start" label={`Posts (${posts.length})`} />
            <Tab icon={<CommentIcon />} iconPosition="start" label={`Comments (${comments.length})`} />
          </Tabs>
        </Box>

        {/* Posts Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {posts.length > 0 ? (
              <List>
                {posts.map((post) => (
                  <ListItem
                    key={post._id}
                    button
                    component={RouterLink}
                    to={`/post/${post._id}`}
                    divider
                  >
                    <ListItemText
                      primary={post.title}
                      secondary={`Posted ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                This user hasn't made any posts yet.
              </Typography>
            )}
          </Box>
        )}

        {/* Comments Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {comments.length > 0 ? (
              <List>
                {comments.map((comment) => (
                  <ListItem
                    key={comment._id}
                    button
                    component={RouterLink}
                    to={`/post/${comment.post._id}`}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {comment.content}
                        </Typography>
                      }
                      secondary={`Commented on "${comment.post.title}" • ${formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                This user hasn't made any comments yet.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PublicProfilePage;
