import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Button, Divider, Chip, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';

const ReportedContent = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, commentsRes] = await Promise.all([
        adminService.getReportedPosts(),
        adminService.getReportedComments(),
      ]);
      setReportedPosts(postsRes);
      setReportedComments(commentsRes);
    } catch (err) {
      setError('Failed to fetch reported content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDismissPost = async (postId) => {
    if (window.confirm('This will delete the post. Are you sure?')) {
      try {
        await adminService.deletePost(postId);
        fetchData(); // Refresh data
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  const handleDismissComment = async (commentId) => {
    if (window.confirm('This will delete the comment. Are you sure?')) {
      try {
        await adminService.deleteComment(commentId);
        fetchData(); // Refresh data
      } catch (err) {
        alert('Failed to delete comment.');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reported Content</Typography>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Reported Posts ({reportedPosts.length})</Typography>
      {reportedPosts.length > 0 ? reportedPosts.map(post => (
        <Accordion key={post._id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>{post.title}</strong> by {post.user.username} ({post.reports.length} reports)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{post.content}</Typography>
            <Divider />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Reports:</Typography>
            {post.reports.map((report, index) => (
              <Chip key={index} label={`${report.reason} (by ${report.user.username})`} sx={{ mr: 1, mb: 1 }} />
            ))}
            <Box sx={{ mt: 2 }}>
              <Button component={Link} to={`/post/${post._id}`} target="_blank" rel="noopener noreferrer">View Post</Button>
              <Button onClick={() => handleDismissPost(post._id)} color="error">Delete Post</Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      )) : <Typography>No reported posts.</Typography>}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Reported Comments ({reportedComments.length})</Typography>
      {reportedComments.length > 0 ? reportedComments.map(comment => (
        <Accordion key={comment._id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Comment by <strong>{comment.user.username}</strong> on "{comment.post.title}" ({comment.reports.length} reports)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2, fontStyle: 'italic' }}>"{comment.content}"</Typography>
            <Divider />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Reports:</Typography>
            {comment.reports.map((report, index) => (
              <Chip key={index} label={`${report.reason} (by ${report.user.username})`} sx={{ mr: 1, mb: 1 }} />
            ))}
            <Box sx={{ mt: 2 }}>
              <Button component={Link} to={`/post/${comment.post._id}`} target="_blank" rel="noopener noreferrer">View Post</Button>
              <Button onClick={() => handleDismissComment(comment._id)} color="error">Delete Comment</Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      )) : <Typography>No reported comments.</Typography>}
    </Paper>
  );
};

export default ReportedContent;
