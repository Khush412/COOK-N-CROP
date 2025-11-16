import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
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
  Zoom,
  Slide,
  Collapse,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import supportService from '../services/supportService';
import {
  QuestionAnswer as QuestionAnswerIcon,
  Search as SearchIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Category as CategoryIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Loader from '../custom_components/Loader';

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
  
  const categoryIcons = {
    'Technical Issue': <PriorityHighIcon />,
    'Account': <PersonIcon />,
    'Billing': <UpdateIcon />,
    'General Inquiry': <QuestionAnswerIcon />,
    'Feature Request': <CategoryIcon />,
  };
  
  if (variant === 'list') {
    // Compact list view
    return (
      <Zoom in={true} timeout={500}>
        <Paper
          component={RouterLink}
          to={`/support/ticket/${ticket._id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[6],
              borderColor: alpha(theme.palette.primary.main, 0.6),
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight="700" 
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
              <Chip 
                label={ticket.status} 
                color={statusColors[ticket.status]} 
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontFamily: theme.typography.fontFamily,
                  height: 24,
                }}
              />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CategoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {ticket.category}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <UpdateIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
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
          
          <Chip 
            icon={categoryIcons[ticket.category] || <CategoryIcon />}
            label={ticket.priority}
            color={priorityColors[ticket.priority]}
            size="small"
            sx={{ 
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
              height: 24,
              ml: 2,
            }}
          />
        </Paper>
      </Zoom>
    );
  }
  
  // Default card view
  return (
    <Zoom in={true} timeout={500}>
      <Card
        component={RouterLink}
        to={`/support/ticket/${ticket._id}`}
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.shadows[4],
          '&:hover': {
            boxShadow: theme.shadows[12],
            borderColor: alpha(theme.palette.primary.main, 0.7),
            transform: 'translateY(-6px)',
          },
        }}
      >
        <CardContent sx={{ pb: 1, flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
            <Typography 
              variant="h6" 
              fontWeight="800" 
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
            <Chip 
              label={ticket.status} 
              color={statusColors[ticket.status]} 
              size="small"
              sx={{ 
                fontWeight: 700,
                fontFamily: theme.typography.fontFamily,
                height: 26,
              }}
            />
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
                lineHeight: 1.6,
              }}
            >
              {ticket.lastMessage}
            </Typography>
          )}
          
          <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CategoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                {ticket.category}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <UpdateIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              <strong>Ticket #:</strong> {ticket.ticketNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              <strong>Created:</strong> {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
            </Typography>
          </Stack>
        </CardContent>
        
        <CardActions sx={{ pt: 0, px: 2, pb: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Chip 
            icon={categoryIcons[ticket.category] || <CategoryIcon />}
            label={ticket.priority}
            color={priorityColors[ticket.priority]}
            size="small"
            sx={{ 
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
              height: 26,
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
        </CardActions>
      </Card>
    </Zoom>
  );
};

const MySupportTicketsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Add mobile detection
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // Default to list view on mobile
  const [page, setPage] = useState(1);
  const ticketsPerPage = 6;

  // Set view mode based on device size
  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

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
      <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
        <Slide direction="down" in={true} timeout={600}>
          <Paper sx={{ p: { xs: 4, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
            <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              My Support Tickets
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Track the status of your inquiries.
            </Typography>
          </Paper>
        </Slide>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><Loader size="medium" /></Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
        <Slide direction="down" in={true} timeout={600}>
          <Paper sx={{ p: { xs: 4, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
            <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              My Support Tickets
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Track the status of your inquiries.
            </Typography>
          </Paper>
        </Slide>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6.5, sm: 8.5 }, py: { xs: 4, sm: 5 } }}>
      <Slide direction="down" in={true} timeout={600}>
        <Paper sx={{ p: { xs: 4, md: 6 }, mb: { xs: 4, sm: 5, md: 6 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
          <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            My Support Tickets
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
            Track the status of your inquiries.
          </Typography>
        </Paper>
      </Slide>

      {tickets.length === 0 ? (
        <Slide direction="up" in={true} timeout={800}>
          <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
            <QuestionAnswerIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2, fontWeight: 700 }}>
              You haven't submitted any support tickets yet.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
              Need help? Submit a support ticket and our team will assist you.
            </Typography>
            <Slide direction="up" in={true} timeout={1000}>
              <Button 
                component={RouterLink} 
                to="/support" 
                variant="contained" 
                size="large"
                sx={{ 
                  mt: 3, 
                  borderRadius: '50px', 
                  px: 4, 
                  py: 1.5,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  }
                }}
              >
                Contact Support
              </Button>
            </Slide>
          </Paper>
        </Slide>
      ) : (
        <>
          {/* Search and View Mode */}
          <Slide direction="up" in={true} timeout={800}>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  placeholder="Search tickets by subject, category, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '24px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      }
                    },
                    '& .MuiInputBase-input': { 
                      fontFamily: theme.typography.fontFamily,
                      py: 1.5,
                    }
                  }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                />
                
                {/* Hide view mode toggle on mobile */}
                {!isMobile && (
                  <FormControl>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newValue) => newValue && setViewMode(newValue)}
                      size="medium"
                      sx={{ height: 48, borderRadius: '24px', overflow: 'hidden' }}
                    >
                      <ToggleButton 
                        value="grid" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          px: 3,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }
                        }}
                      >
                        <ViewModuleIcon sx={{ mr: 1 }} /> Grid
                      </ToggleButton>
                      <ToggleButton 
                        value="list" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          px: 3,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }
                        }}
                      >
                        <ViewListIcon sx={{ mr: 1 }} /> List
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                )}
                
                <Chip 
                  label={`${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`} 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    height: 36,
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }} 
                />
              </Stack>
            </Paper>
          </Slide>
          
          {paginatedTickets.length === 0 ? (
            <Slide direction="up" in={true} timeout={1000}>
              <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                <QuestionAnswerIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                  No tickets found matching your search.
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
                  Try adjusting your search terms.
                </Typography>
              </Paper>
            </Slide>
          ) : (
            <>
              {isMobile ? (
                // Always show list view on mobile
                <Stack spacing={2}>
                  {paginatedTickets.map((ticket, index) => (
                    <Collapse key={ticket._id} in={true} timeout={500 + (index * 100)}>
                      <TicketCard key={ticket._id} ticket={ticket} variant="list" />
                    </Collapse>
                  ))}
                </Stack>
              ) : viewMode === 'grid' ? (
                // Grid view for desktop
                <Grid container spacing={3}>
                  {paginatedTickets.map((ticket, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ticket._id}>
                      <Collapse in={true} timeout={500 + (index * 100)}>
                        <TicketCard ticket={ticket} />
                      </Collapse>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // List view for desktop
                <Stack spacing={2}>
                  {paginatedTickets.map((ticket, index) => (
                    <Collapse key={ticket._id} in={true} timeout={500 + (index * 100)}>
                      <TicketCard key={ticket._id} ticket={ticket} variant="list" />
                    </Collapse>
                  ))}
                </Stack>
              )}

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Slide direction="up" in={true} timeout={1200}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      siblingCount={1}
                      boundaryCount={1}
                      size="large"
                      sx={{ 
                        '& .MuiPaginationItem-root': { 
                          fontFamily: theme.typography.fontFamily,
                          borderRadius: '12px',
                          margin: '0 2px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }
                        },
                        '& .Mui-selected': { 
                          fontWeight: 'bold',
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        }
                      }}
                    />
                  </Slide>
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