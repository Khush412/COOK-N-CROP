import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Alert, Button, Divider, Chip, Paper, Container, Stack, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import adminService from '../../services/adminService';
import { Link as RouterLink } from 'react-router-dom';
import Loader from '../../custom_components/Loader';

const ReportedItemCard = ({ item, type, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const title = type === 'post'
    ? `Post: "${item.title}"`
    : `Comment on "${item.post?.title || 'a post'}"`;

  const author = item.user?.username || 'Unknown User';

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            by {author} • <Chip label={`${item.reports.length} report(s)`} size="small" color="warning" />
          </Typography>
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </IconButton>
      </Stack>
      {expanded && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2, fontStyle: type === 'comment' ? 'italic' : 'normal', bgcolor: alpha(theme.palette.text.primary, 0.05), p: 1.5, borderRadius: 1, fontFamily: theme.typography.fontFamily }}>
            {type === 'comment' ? `"${item.content}"` : item.content}
          </Typography>
          <Divider />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Reports:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {item.reports.map((report, index) => (
              <Tooltip key={index} title={`Reported by ${report.user?.username || 'Unknown'}`}>
                <Chip label={report.reason} variant="outlined" />
              </Tooltip>
            ))}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button component={RouterLink} to={`/post/${type === 'post' ? item._id : item.post?._id}`} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>
              View Content
            </Button>
            <Button onClick={() => onDelete(item._id)} color="error" variant="contained" sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>
              Delete {type}
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

const ReportedContent = () => {
  const theme = useTheme();
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const openConfirmDialog = (type, payload, title, message) => {
    setConfirmAction({ type, payload, title, message });
    setConfirmDialogOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, payload } = confirmAction;
    try {
      if (type === 'deletePost') {
        await adminService.deletePost(payload);
      } else if (type === 'deleteComment') {
        await adminService.deleteComment(payload);
      }
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to delete content.');
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleDeletePost = (postId) => {
    openConfirmDialog('deletePost', postId, 'Confirm Post Deletion', 'Are you sure you want to permanently delete this post and all its comments?');
  };

  const handleDeleteComment = (commentId) => {
    openConfirmDialog('deleteComment', commentId, 'Confirm Comment Deletion', 'Are you sure you want to permanently delete this comment and all its replies?');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><Loader size="medium" /></Box>;

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          Reported Content
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Review and moderate content reported by the community.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, mb: 3 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Reported Posts ({reportedPosts.length})</Typography>
        {reportedPosts.length > 0 ? (
          reportedPosts.map(post => <ReportedItemCard key={post._id} item={post} type="post" onDelete={handleDeletePost} />)
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
            <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No posts have been reported.</Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Reported Comments ({reportedComments.length})</Typography>
        {reportedComments.length > 0 ? (
          reportedComments.map(comment => <ReportedItemCard key={comment._id} item={comment} type="comment" onDelete={handleDeleteComment} />)
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
            <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>No comments have been reported.</Typography>
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
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportedContent;
