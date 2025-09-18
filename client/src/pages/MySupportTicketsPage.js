import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert, Chip, useTheme, alpha, Button, ListItemButton } from '@mui/material';
import { format } from 'date-fns';
import supportService from '../services/supportService';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const MySupportTicketsPage = () => {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const statusColors = { Open: 'warning', 'In Progress': 'info', Closed: 'success' };

  return (
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          My Support Tickets
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Track the status of your inquiries.
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      ) : tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <QuestionAnswerIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>You haven't submitted any support tickets yet.</Typography>
          <Button component={RouterLink} to="/support" variant="contained" sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>Contact Support</Button>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
          <List>
            {tickets.map(ticket => (
              <ListItemButton
                key={ticket._id}
                component={RouterLink}
                to={`/support/ticket/${ticket._id}`}
                divider
              >
                <ListItemText
                  primary={<Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{ticket.subject}</Typography>}
                  secondary={<Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{`Submitted on ${format(new Date(ticket.createdAt), 'PP')}`}</Typography>}
                />
                <Chip label={ticket.status} color={statusColors[ticket.status]} size="small" sx={{ fontFamily: theme.typography.fontFamily }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default MySupportTicketsPage;
