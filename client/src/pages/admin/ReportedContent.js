import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Alert, Button, Divider, Chip, Paper, Container, Stack, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Select, MenuItem, FormControl, InputLabel,
  TextField, useTheme, alpha, Grid, Card, CardContent, CardActions, Collapse, LinearProgress
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import BarChartIcon from '@mui/icons-material/BarChart';
import adminService from '../../services/adminService';
import { Link as RouterLink } from 'react-router-dom';
import Loader from '../../custom_components/Loader';

const ReportedItemCard = ({ item, type, onDelete, onIgnore }) => {
  const theme = useMuiTheme();
  const [expanded, setExpanded] = useState(false);

  const title = type === 'post'
    ? `Post: "${item.title}"`
    : `Comment on "${item.post?.title || 'a post'}"`;

  const author = item.user?.username || 'Unknown User';

  // Get unique report reasons and their counts
  const getReportReasons = () => {
    const reasons = {};
    item.reports.forEach(report => {
      if (reasons[report.reason]) {
        reasons[report.reason]++;
      } else {
        reasons[report.reason] = 1;
      }
    });
    return reasons;
  };

  const reportReasons = getReportReasons();

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
              by {author}
            </Typography>
            <Chip 
              label={`${item.reports.length} report(s)`} 
              size="small" 
              color="warning" 
              sx={{ mb: 1 }}
            />
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </IconButton>
        </Stack>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2, fontStyle: type === 'comment' ? 'italic' : 'normal', bgcolor: alpha(theme.palette.text.primary, 0.05), p: 1.5, borderRadius: 1, fontFamily: theme.typography.fontFamily }}>
              {type === 'comment' ? `"${item.content}"` : item.content}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
              Report Analysis:
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {Object.entries(reportReasons).map(([reason, count]) => (
                <Grid item size={{ xs: 12, sm: 6 }} key={reason}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, flex: 1 }}>
                      {reason}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / item.reports.length) * 100} 
                    sx={{ 
                      mt: 0.5,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.warning.main
                      }
                    }} 
                  />
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
              Reports ({item.reports.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {item.reports.map((report, index) => (
                <Tooltip key={index} title={`Reported by ${report.user?.username || 'Unknown'} on ${new Date(report.createdAt).toLocaleDateString()}`}>
                  <Chip 
                    label={report.reason} 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      borderColor: alpha(theme.palette.warning.main, 0.3),
                      color: theme.palette.warning.main
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button 
          component={RouterLink} 
          to={`/post/${type === 'post' ? item._id : item.post?._id}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          variant="outlined" 
          size="small"
          sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
        >
          View Content
        </Button>
        <Stack direction="row" spacing={1}>
          <Button 
            onClick={() => onIgnore(item._id)} 
            color="secondary" 
            variant="outlined" 
            size="small"
            sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
          >
            Ignore
          </Button>
          <Button 
            onClick={() => onDelete(item._id)} 
            color="error" 
            variant="contained" 
            size="small"
            sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}
          >
            Delete {type}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

const ReportedContent = () => {
  const theme = useMuiTheme();
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reports'); // reports, date
  const [filterBy, setFilterBy] = useState('all'); // all, spam, offensive, other
  
  const commonReportReasons = ['Spam', 'Offensive Content', 'Harassment', 'Misinformation', 'Other'];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsRes, commentsRes] = await Promise.all([
        adminService.getReportedPosts(),
        adminService.getReportedComments(),
      ]);
      setReportedPosts(postsRes);
      setReportedComments(commentsRes);
      setFilteredPosts(postsRes);
      setFilteredComments(commentsRes);
    } catch (err) {
      setError('Failed to fetch reported content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters and sorting
  useEffect(() => {
    let posts = [...reportedPosts];
    let comments = [...reportedComments];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      posts = posts.filter(post => 
        post.title?.toLowerCase().includes(term) || 
        post.content?.toLowerCase().includes(term) ||
        post.user?.username?.toLowerCase().includes(term) ||
        post.reports.some(report => report.reason.toLowerCase().includes(term))
      );
      
      comments = comments.filter(comment => 
        comment.content?.toLowerCase().includes(term) ||
        comment.user?.username?.toLowerCase().includes(term) ||
        comment.post?.title?.toLowerCase().includes(term) ||
        comment.reports.some(report => report.reason.toLowerCase().includes(term))
      );
    }
    
    // Filter by report reason
    if (filterBy !== 'all') {
      posts = posts.filter(post => 
        post.reports.some(report => report.reason === filterBy)
      );
      
      comments = comments.filter(comment => 
        comment.reports.some(report => report.reason === filterBy)
      );
    }
    
    // Sort
    if (sortBy === 'reports') {
      posts.sort((a, b) => b.reports.length - a.reports.length);
      comments.sort((a, b) => b.reports.length - a.reports.length);
    } else if (sortBy === 'date') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredPosts(posts);
    setFilteredComments(comments);
  }, [searchTerm, sortBy, filterBy, reportedPosts, reportedComments]);

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
      } else if (type === 'ignorePost') {
        await adminService.clearPostReports(payload);
      } else if (type === 'ignoreComment') {
        await adminService.clearCommentReports(payload);
      }
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to perform action.');
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

  const handleIgnorePost = (postId) => {
    openConfirmDialog('ignorePost', postId, 'Ignore Post Report', 'Are you sure you want to ignore this report? The post will be removed from the reported content list.');
  };

  const handleIgnoreComment = (commentId) => {
    openConfirmDialog('ignoreComment', commentId, 'Ignore Comment Report', 'Are you sure you want to ignore this report? The comment will be removed from the reported content list.');
  };

  const getTotalReports = () => {
    const postReports = reportedPosts.reduce((total, post) => total + post.reports.length, 0);
    const commentReports = reportedComments.reduce((total, comment) => total + comment.reports.length, 0);
    return postReports + commentReports;
  };

  const getTopReportReasons = () => {
    const allReports = [
      ...reportedPosts.flatMap(post => post.reports),
      ...reportedComments.flatMap(comment => comment.reports)
    ];
    
    const reasons = {};
    allReports.forEach(report => {
      if (reasons[report.reason]) {
        reasons[report.reason]++;
      } else {
        reasons[report.reason] = 1;
      }
    });
    
    return Object.entries(reasons)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><Loader size="medium" /></Box>;

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Content Moderation Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Review and moderate content reported by the community.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReportProblemOutlinedIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {getTotalReports()}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ fontSize: 32, color: theme.palette.info.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {reportedPosts.length}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Reported Posts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ fontSize: 32, color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {reportedComments.length}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Reported Comments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Report Reasons */}
      <Card sx={{ mb: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', mb: 2 }}>
            Top Report Reasons
          </Typography>
          <Grid container spacing={2}>
            {getTopReportReasons().map(([reason, count], index) => (
              <Grid item size={{ xs: 12, sm: 6, md: 2.4 }} key={reason}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                    {reason}
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', color: theme.palette.primary.main }}>
                    {count}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / getTotalReports()) * 100} 
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.primary.main
                      }
                    }} 
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search reported content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily
                }
              }}
            />
          </Grid>
          
          <Grid item size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
                IconComponent={SortIcon}
              >
                <MenuItem value="reports" sx={{ fontFamily: theme.typography.fontFamily }}>Most Reports</MenuItem>
                <MenuItem value="date" sx={{ fontFamily: theme.typography.fontFamily }}>Newest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Filter By</InputLabel>
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
                IconComponent={FilterListIcon}
              >
                <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All Reports</MenuItem>
                {commonReportReasons.map(reason => (
                  <MenuItem key={reason} value={reason} sx={{ fontFamily: theme.typography.fontFamily }}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item size={{ xs: 12, md: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setSortBy('reports');
                setFilterBy('all');
              }}
              sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reported Content */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
          Reported Posts ({filteredPosts.length})
        </Typography>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <ReportedItemCard 
              key={post._id} 
              item={post} 
              type="post" 
              onDelete={handleDeletePost}
              onIgnore={handleIgnorePost}
            />
          ))
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
            <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {searchTerm || filterBy !== 'all' 
                ? 'No posts match your search or filter criteria.' 
                : 'No posts have been reported.'}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
          Reported Comments ({filteredComments.length})
        </Typography>
        {filteredComments.length > 0 ? (
          filteredComments.map(comment => (
            <ReportedItemCard 
              key={comment._id} 
              item={comment} 
              type="comment" 
              onDelete={handleDeleteComment}
              onIgnore={handleIgnoreComment}
            />
          ))
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, mt: 2 }}>
            <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {searchTerm || filterBy !== 'all' 
                ? 'No comments match your search or filter criteria.' 
                : 'No comments have been reported.'}
            </Typography>
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
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportedContent;