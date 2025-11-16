import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Select,
  MenuItem,
  Chip,
  TablePagination,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Avatar,
} from "@mui/material";
import { format } from "date-fns";
import api from "../../config/axios";
import Loader from "../../custom_components/Loader";

const ManageSupport = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter,
        subject: subjectFilter,
      });
      const res = await api.get(`/support?${params.toString()}`);
      setMessages(res.data.data);
      setTotalMessages(res.data.count);
    } catch (err) {
      setError('Failed to load support messages.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter, subjectFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusChange = async (id, newStatus) => {
    const originalMessages = [...messages];
    setMessages((prev) => prev.map((msg) => (msg._id === id ? { ...msg, status: newStatus } : msg)));
    try {
      await api.put(`/support/${id}`, { status: newStatus });
      setSnackbar({ open: true, message: "Status updated successfully!", severity: "success" });
      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to update status.", severity: "error" });
      setMessages(originalMessages); // Revert on failure
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setReplyContent("");
    setDialogOpen(true);
    // Fetch full details with replies
    try {
      const res = await api.get(`/support/${message._id}`);
      setSelectedMessage(res.data.data);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to load full ticket details.", severity: "error" });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;
    setReplyLoading(true);
    try {
      const res = await api.post(`/support/${selectedMessage._id}/reply`, { replyContent });
      setSnackbar({ open: true, message: "Reply sent successfully!", severity: "success" });
      setMessages((prev) => prev.map((msg) => (msg._id === res.data.data._id ? res.data.data : msg)));
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to send reply.", severity: "error" });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const statusColors = { Open: 'warning', 'In Progress': 'info', Closed: 'success' };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><Loader size="medium" /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>Support Messages</Typography>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="center" sx={{ width: '100%' }}>
          <TextField
            label="Search by Name, Email, Subject..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } } }}
            inputProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } } }}
          />
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ width: '100%', mt: { xs: 1, md: 0 } }}>
            <FormControl size="small" sx={{ minWidth: { xs: '50%', md: 150 } }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>
                <MenuItem value="All" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>All Status</MenuItem>
                <MenuItem value="Open" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Open</MenuItem>
                <MenuItem value="In Progress" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>In Progress</MenuItem>
                <MenuItem value="Closed" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '50%', md: 200 } }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Subject</InputLabel>
              <Select value={subjectFilter} label="Subject" onChange={(e) => { setSubjectFilter(e.target.value); setPage(0); }} sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily }}>
                <MenuItem value="All" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>All Subjects</MenuItem>
                <MenuItem value="General Inquiry" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>General Inquiry</MenuItem>
                <MenuItem value="Account Support" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Account Support</MenuItem>
                <MenuItem value="Order Issue" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Order Issue</MenuItem>
                <MenuItem value="Partnership" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Partnership</MenuItem>
                <MenuItem value="Feedback" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Feedback</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: { xs: 600, sm: 800, md: 1000 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
                <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>From</TableCell>
                <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Subject</TableCell>
                <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                <TableCell align="right" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map(msg => (
                <TableRow key={msg._id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{format(new Date(msg.createdAt), 'PPpp')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 0.5 }}>{msg.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>{msg.email}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{msg.subject}</TableCell>
                  <TableCell>
                    <Chip label={msg.status} color={statusColors[msg.status]} size="small" sx={{ fontWeight: "bold", fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.625rem', sm: '0.75rem' } }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleViewMessage(msg)} 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: 1, sm: 2 }
                      }}
                    >
                      View & Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalMessages}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{
            '& .MuiTablePagination-select': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            },
            '& .MuiTablePagination-actions button': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: "bold", fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Support Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedMessage && (
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>From</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{selectedMessage.name} ({selectedMessage.email})</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{format(new Date(selectedMessage.createdAt), "PPpp")}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Subject</Typography>
                  <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>{selectedMessage.subject}</Typography>
                </Grid>
              </Grid>
              <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "action.hover", mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1 }}>User's Message</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{selectedMessage.message}</Typography>
              </Paper>

              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <Stack spacing={2} sx={{ mt: 2, maxHeight: 250, overflowY: 'auto', p: 1 }}>
                  <Divider><Chip label="Conversation History" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }} /></Divider>
                  {selectedMessage.replies.map(reply => (
                    <Paper
                      key={reply._id}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: reply.user?._id === selectedMessage.user?._id
                          ? alpha(theme.palette.primary.main, 0.05)
                          : alpha(theme.palette.secondary.main, 0.05),
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Avatar src={reply.user?.profilePic} sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, fontSize: { xs: '0.75rem', sm: '1rem' } }}>{reply.user?.username?.charAt(0) || '?'}</Avatar>
                        <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {reply.user?.username || 'Deleted User'} {reply.user?._id !== selectedMessage.user?._id && '(Admin)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                          {format(new Date(reply.createdAt), 'PPp')}
                        </Typography>
                      </Stack>
                      <Typography sx={{ whiteSpace: 'pre-wrap', pl: { xs: 4, sm: 7 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {reply.content}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status:</Typography>
                <Select 
                  value={selectedMessage.status} 
                  onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)} 
                  size="small" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  <MenuItem value="Open" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Open</MenuItem>
                  <MenuItem value="In Progress" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>In Progress</MenuItem>
                  <MenuItem value="Closed" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '1rem' } }}>Closed</MenuItem>
                </Select>
              </Stack>
              <Divider />
              <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Reply to User</Typography>
              <TextField
                label="Your Reply"
                multiline
                rows={5}
                fullWidth
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={replyLoading}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                sx={{ 
                  '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } },
                  '& .MuiOutlinedInput-root': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={replyLoading} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Close
          </Button>
          <Button 
            onClick={handleSendReply} 
            variant="contained" 
            disabled={replyLoading || !replyContent.trim()} 
            startIcon={replyLoading ? <Loader size="small" /> : null} 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {replyLoading ? "Sending..." : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%", 
            fontFamily: theme.typography.fontFamily,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageSupport;