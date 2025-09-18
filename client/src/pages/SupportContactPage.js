import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { useAuth } from '../contexts/AuthContext';
import supportService from '../services/supportService';

// Sample FAQs
const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order from the "My Orders" section in your profile. Once your order is shipped, you will receive a tracking number via email.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Due to the perishable nature of our products, we do not accept returns. However, if you have an issue with your order, please contact us within 24 hours of delivery, and we will be happy to assist you.',
  },
  {
    question: 'How do I change or cancel an order?',
    answer: 'You can change or cancel your order within 2 hours of placing it. Please go to your order details page or contact us immediately for assistance.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking on the "Forgot Password?" link on the login page. You will receive an email with instructions to set a new password.',
  },
  {
    question: 'Do you offer subscriptions?',
    answer: 'Yes! We offer weekly and bi-weekly subscription boxes. You can manage your subscription from your profile page to customize your box, pause, or cancel anytime.',
  },
];

const SupportContactPage = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (isAuthenticated && user) {
      setForm(prev => ({ ...prev, name: user.username, email: user.email }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supportService.sendMessage(form);
      setSnackbar({ open: true, message: 'Your message has been sent! We will get back to you shortly.', severity: 'success' });
      // Reset form, but keep user details if logged in
      setForm({
        name: isAuthenticated ? user.username : '',
        email: isAuthenticated ? user.email : '',
        subject: '', message: '' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to send message. Please try again later.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', pt: { xs: 10, md: 12 }, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <ContactSupportIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily }}>
            Support & Contact
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '750px', mx: 'auto', fontFamily: theme.typography.fontFamily }}>
            Have questions? We're here to help. Check out our FAQs or send us a message directly.
          </Typography>
        </Paper>

        <Grid container spacing={6}>
          {/* FAQ Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, borderRadius: 2, '&:before': { display: 'none' }, mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          {/* Contact Form Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
                Send Us a Message
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Your Name" name="name" value={form.name} onChange={handleChange} disabled={loading || isAuthenticated} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required type="email" label="Your Email" name="email" value={form.email} onChange={handleChange} disabled={loading || isAuthenticated} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth required disabled={loading}>
                      <InputLabel id="subject-label" sx={{ fontFamily: theme.typography.fontFamily }}>Subject</InputLabel>
                      <Select labelId="subject-label" label="Subject" name="subject" value={form.subject} onChange={handleChange} sx={{ fontFamily: theme.typography.fontFamily }}>
                        <MenuItem value="General Inquiry" sx={{ fontFamily: theme.typography.fontFamily }}>General Inquiry</MenuItem>
                        <MenuItem value="Account Support" sx={{ fontFamily: theme.typography.fontFamily }}>Account Support</MenuItem>
                        <MenuItem value="Order Issue" sx={{ fontFamily: theme.typography.fontFamily }}>Order Issue</MenuItem>
                        <MenuItem value="Partnership" sx={{ fontFamily: theme.typography.fontFamily }}>Partnership</MenuItem>
                        <MenuItem value="Feedback" sx={{ fontFamily: theme.typography.fontFamily }}>Feedback</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth required multiline rows={6} label="Your Message" name="message" value={form.message} onChange={handleChange} disabled={loading} InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} sx={{ py: 1.5, fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px' }}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportContactPage;