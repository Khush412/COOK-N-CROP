import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  Button,
  ListItemButton,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardContent,
  CardActions,
  Divider,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import supportService from '../services/supportService';
import {
  QuestionAnswer as QuestionAnswerIcon,
  Search as SearchIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

const TicketCard = ({ ticket, variant = 'card' }) => {
  const theme = useTheme();
  
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
  
  if (variant === 'list') {
    // Compact list view
    return (
      <Paper
        component={RouterLink}
        to={`/support/ticket/${ticket._id}`}
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: '0.3s',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: alpha(theme.palette.primary.main, 0.4),
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: theme.palette.primary.main,
              }}
            >
              {ticket.subject}
            </Typography>
            {/* Removed the status chip to fix the bubble buttons issue */}
          </Stack>
          
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              <strong>Ticket #:</strong> {ticket.ticketNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              <strong>Created:</strong> {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
            </Typography>
          </Stack>
        </Box>
        
        {/* Removed the priority chip to fix the bubble buttons issue */}
      </Paper>
    );
  }
  
  // Default card view
  return (
    <Card
      component={RouterLink}
      to={`/support/ticket/${ticket._id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 4,
        border: `2px solid ${alpha(theme.palette.divider, 0.8)}`,
        transition: '0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadows[4],
        '&:hover': {
          boxShadow: theme.shadows[8],
          borderColor: alpha(theme.palette.primary.main, 0.5),
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ pb: 1, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: theme.palette.primary.main,
            }}
          >
            {ticket.subject}
          </Typography>
          {/* Removed the status and priority chips to fix the bubble buttons issue */}
        </Stack>
        
        {ticket.lastMessage && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: theme.typography.fontFamily,
              minHeight: 60,
            }}
          >
            {ticket.lastMessage}
          </Typography>
        )}
        
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            <strong>Ticket #:</strong> {ticket.ticketNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            <strong>Created:</strong> {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
          </Typography>
          {ticket.updatedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              <strong>Updated:</strong> {format(new Date(ticket.updatedAt), 'MMM d, yyyy')}
            </Typography>
          )}
        </Stack>
      </CardContent>
      
      <CardActions sx={{ pt: 0, px: 2, pb: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        {/* Removed the category chip to fix the bubble buttons issue */}
        <Box sx={{ flexGrow: 1 }} />
        {/* Removed the priority chip to fix the bubble buttons issue */}
      </CardActions>
    </Card>
  );
};

const MySupportTicketsPage = () => {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const ticketsPerPage = 5;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await supportService.getMyTickets();
        setTickets(res.data);
      } catch (err) {
        setError('Failed to load your support tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Filter tickets based on search term
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.category && ticket.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.lastMessage && ticket.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tickets, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const paginatedTickets = useMemo(() => {
    const startIndex = (page - 1) * ticketsPerPage;
    return filteredTickets.slice(startIndex, startIndex + ticketsPerPage);
  }, [filteredTickets, page]);

  const statusColors = { Open: 'warning', 'In Progress': 'info', Closed: 'success', Resolved: 'success', Pending: 'warning' };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
            My Support Tickets
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Track the status of your inquiries.
          </Typography>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
            My Support Tickets
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Track the status of your inquiries.
          </Typography>
        </Paper>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          My Support Tickets
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Track the status of your inquiries.
        </Typography>
      </Paper>

      {tickets.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <QuestionAnswerIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            You haven't submitted any support tickets yet.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
            Need help? Submit a support ticket and our team will assist you.
          </Typography>
          <Button component={RouterLink} to="/support" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Contact Support
          </Button>
        </Paper>
      ) : (
        <>
          {/* Search and View Mode */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '20px' },
                  '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
                }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              
              <FormControl>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newValue) => newValue && setViewMode(newValue)}
                  size="small"
                  sx={{ height: 40 }}
                >
                  <ToggleButton value="grid" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="list" sx={{ fontFamily: theme.typography.fontFamily, px: 2 }}>
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
              
              <Chip 
                label={`${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`} 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  height: 32,
                }} 
              />
            </Stack>
          </Paper>
          
          {paginatedTickets.length === 0 ? (
            <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No tickets found matching your search.
              </Typography>
            </Paper>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {paginatedTickets.map(ticket => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ticket._id}>
                      <TicketCard ticket={ticket} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={2}>
                  {paginatedTickets.map(ticket => (
                    <TicketCard key={ticket._id} ticket={ticket} variant="list" />
                  ))}
                </Stack>
              )}
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ 
                      '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                      '& .Mui-selected': { fontWeight: 'bold' }
                    }}
                  />
                </Box>
              )}
            </>
          )}

        </>
      )}
    </Container>
  );
};

export default MySupportTicketsPage;