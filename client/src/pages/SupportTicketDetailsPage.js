import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Alert, 
  Chip, 
  Divider, 
  Stack, 
  Avatar, 
  useTheme, 
  alpha, 
  Button, 
  TextField,
  Zoom,
  Slide,
  Fade,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import supportService from '../services/supportService';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import Loader from '../custom_components/Loader';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  Update as UpdateIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon
} from '@mui/icons-material';

const SupportTicketDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await supportService.getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      setError('Failed to load ticket details. You may not have permission to view this.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      await supportService.addUserReply(id, replyContent);
      setReplyContent('');
      fetchTicket(); // Refetch to get the new reply and potentially updated status
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setIsReplying(false);
    }
  };
  
  const statusColors = { 
    Open: 'warning', 
    'In Progress': 'info', 
    Closed: 'success',
    Resolved: 'success',
    Pending: 'warning'
  };
  
  const priorityColors = {
    High: 'error',
    Medium: 'warning',
    Low: 'info'
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Loader size="large" />
      </Box>
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: 4 }}>
      <Fade in={true} timeout={500}>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>
          {error}
        </Alert>
      </Fade>
    </Container>
  );
  
  if (!ticket) return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: 4 }}>
      <Fade in={true} timeout={500}>
        <Alert severity="info" sx={{ fontFamily: theme.typography.fontFamily }}>
          Ticket not found.
        </Alert>
      </Fade>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: 4 }}>
      <Slide direction="right" in={true} timeout={600}>
        <Button 
          component={RouterLink} 
          to="/profile/support-tickets" 
          startIcon={<ArrowBackIcon />} 
          sx={{ 
            mb: 2, 
            fontFamily: theme.typography.fontFamily,
            fontWeight: 600,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: '20px',
            transition: 'all 0.3s ease',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            '&:hover': {
              transform: 'translateX(-5px)',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          {isMobile ? 'Back' : 'Back to My Tickets'}
        </Button>
      </Slide>
      
      <Zoom in={true} timeout={700}>
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: { xs: 2, sm: 3, md: 4 },
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`
          }}
        >
          {/* Ticket Header */}
          <Slide direction="down" in={true} timeout={800}>
            <Box sx={{ mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} spacing={2} mb={2}>
                <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, mb: 1 }}>
                    {ticket.subject}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip 
                      icon={<AssignmentIcon />} 
                      label={`Ticket #${ticket.ticketNumber}`} 
                      size="small" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }} 
                    />
                    <Chip 
                      icon={<CategoryIcon />} 
                      label={ticket.category} 
                      size="small" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }} 
                    />
                    <Chip 
                      icon={ticket.priority === 'High' ? <PriorityHighIcon /> : ticket.priority === 'Low' ? <LowPriorityIcon /> : <UpdateIcon />} 
                      label={ticket.priority} 
                      color={priorityColors[ticket.priority]} 
                      size="small" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      <UpdateIcon sx={{ fontSize: { xs: 12, sm: 16 } }} />
                      Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </Typography>
                  </Stack>
                </Box>
                <Chip 
                  label={ticket.status} 
                  color={statusColors[ticket.status]} 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 700,
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    height: { xs: 28, sm: 36 },
                    minWidth: { xs: 80, sm: 120 }
                  }} 
                />
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar 
                    src={
                      (ticket.user?.profilePic || user?.profilePic) && (ticket.user?.profilePic || user?.profilePic).startsWith('http')
                        ? (ticket.user?.profilePic || user?.profilePic)
                        : (ticket.user?.profilePic || user?.profilePic) ? `${process.env.REACT_APP_API_URL}${ticket.user?.profilePic || user.profilePic}` : undefined
                    }
                    sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                  >
                    {ticket.user?.username?.charAt(0) || user?.username.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                      <PersonIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
                      {ticket.user?.username || user?.username} <Typography component="span" color="text.secondary" sx={{ fontWeight: 'normal', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>(You)</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {format(new Date(ticket.createdAt), 'PPp')}
                    </Typography>
                  </Box>
                </Box>
                
                {ticket.assignedTo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar 
                      src={ticket.assignedTo.profilePic && ticket.assignedTo.profilePic.startsWith('http') ? ticket.assignedTo.profilePic : ticket.assignedTo.profilePic ? `${process.env.REACT_APP_API_URL}${ticket.assignedTo.profilePic}` : undefined}
                      sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                    >
                      {ticket.assignedTo.username.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                        <SupportAgentIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
                        {ticket.assignedTo.username} <Typography component="span" color="text.secondary" sx={{ fontWeight: 'normal', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>(Support Agent)</Typography>
                      </Typography>
                      {ticket.updatedAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Slide>

          <Stack spacing={4}>
            {/* Original Message */}
            <Slide direction="up" in={true} timeout={900}>
              <Card 
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  boxShadow: theme.shadows[2],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar 
                      src={
                        (ticket.user?.profilePic || user?.profilePic) && (ticket.user?.profilePic || user?.profilePic).startsWith('http')
                          ? (ticket.user?.profilePic || user?.profilePic)
                          : (ticket.user?.profilePic || user?.profilePic) ? `${process.env.REACT_APP_API_URL}${ticket.user?.profilePic || user.profilePic}` : undefined
                      }
                      sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}
                    >
                      {ticket.user?.username?.charAt(0) || user?.username.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {ticket.user?.username || user?.username} (You)
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {format(new Date(ticket.createdAt), 'PPp')}
                    </Typography>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography 
                    sx={{ 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: theme.typography.fontFamily,
                      lineHeight: 1.7,
                      fontSize: { xs: '0.85rem', sm: '1rem' }
                    }}
                  >
                    {ticket.message}
                  </Typography>
                </CardContent>
              </Card>
            </Slide>

            {/* Replies */}
            {ticket.replies.map((reply, index) => (
              <Slide key={reply._id} direction="up" in={true} timeout={1000 + (index * 200)}>
                <Card 
                  sx={{ 
                    borderRadius: { xs: 2, sm: 3 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    boxShadow: theme.shadows[2],
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    },
                    bgcolor: reply.user._id === user.id 
                      ? alpha(theme.palette.primary.main, 0.03) 
                      : alpha(theme.palette.secondary.main, 0.03)
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar 
                        src={reply.user.profilePic && reply.user.profilePic.startsWith('http') ? reply.user.profilePic : reply.user.profilePic ? `${process.env.REACT_APP_API_URL}${reply.user.profilePic}` : undefined}
                        sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}
                      >
                        {reply.user.username.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {reply.user.username} {reply.user._id === user.id ? '(You)' : '(Support Team)'}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {format(new Date(reply.createdAt), 'PPp')}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Typography 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: theme.typography.fontFamily,
                        lineHeight: 1.7,
                        fontSize: { xs: '0.85rem', sm: '1rem' }
                      }}
                    >
                      {reply.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            ))}
          </Stack>

          {ticket.status !== 'Closed' && (
            <Slide direction="up" in={true} timeout={1200}>
              <Box component="form" onSubmit={handleReplySubmit} sx={{ mt: 5, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2, fontFamily: theme.typography.fontFamily, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  <SendIcon sx={{ fontSize: { xs: 20, sm: 24 } }} /> Add a Reply
                </Typography> 
                <TextField 
                  fullWidth 
                  multiline 
                  rows={isMobile ? 4 : 5} 
                  value={replyContent} 
                  onChange={(e) => setReplyContent(e.target.value)} 
                  placeholder="Type your reply here..." 
                  disabled={isReplying} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: { xs: 2, sm: 3 },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      }
                    }, 
                    '& .MuiInputBase-input': { 
                      fontFamily: theme.typography.fontFamily,
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: '0.85rem', sm: '1rem' }
                    } 
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size={isMobile ? "medium" : "large"}
                    sx={{ 
                      mt: 2, 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 600,
                      px: { xs: 2, sm: 4 },
                      py: { xs: 1, sm: 1.5 },
                      borderRadius: '50px',
                      boxShadow: 3,
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      }
                    }} 
                    disabled={isReplying || !replyContent.trim()} 
                    startIcon={isReplying ? <Loader size="small" /> : <SendIcon />}
                  >
                    {isReplying ? (isMobile ? 'Sending...' : 'Sending Reply...') : (isMobile ? 'Send' : 'Send Reply')}
                  </Button>
                </Box>
              </Box>
            </Slide>
          )}
        </Paper>
      </Zoom>
    </Container>
  );
};

export default SupportTicketDetailsPage;