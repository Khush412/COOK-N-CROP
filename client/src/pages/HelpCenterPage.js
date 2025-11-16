import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText, Divider, alpha, TextField, InputAdornment, useMediaQuery, useTheme
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { 
  Help as HelpIcon, 
  Search as SearchIcon, 
  AccountCircle as AccountIcon, 
  ShoppingBasket as ShoppingIcon, 
  Forum as CommunityIcon, 
  LocalShipping as ShippingIcon, 
  Payment as PaymentIcon, 
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HelpCenterPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      title: "Account Management",
      icon: <AccountIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Learn how to create, manage, and secure your account",
      path: "/support#account"
    },
    {
      title: "Shopping & Orders",
      icon: <ShoppingIcon sx={{ color: theme.palette.secondary.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Ordering, payment methods, and delivery information",
      path: "/support#shopping"
    },
    {
      title: "Community Guidelines",
      icon: <CommunityIcon sx={{ color: theme.palette.info.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Rules and best practices for community participation",
      path: "/community/guidelines"
    },
    {
      title: "Shipping & Delivery",
      icon: <ShippingIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Delivery times, tracking, and shipping policies",
      path: "/support#shipping"
    },
    {
      title: "Payment Methods",
      icon: <PaymentIcon sx={{ color: theme.palette.warning.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Accepted payment options and security information",
      path: "/support#payment"
    },
    {
      title: "Privacy & Security",
      icon: <SecurityIcon sx={{ color: theme.palette.error.main, fontSize: isMobile ? 20 : 24 }} />,
      description: "Data protection and account security measures",
      path: "/privacy"
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password?' link on the login page."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 2-3 business days for local orders and 5-7 business days for regional orders."
    },
    {
      question: "Can I cancel my order?",
      answer: "You can cancel your order within 2 hours of placing it through your order history."
    }
  ];

  const filteredCategories = helpCategories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
          <HelpIcon sx={{ fontSize: isMobile ? 32 : 40, color: theme.palette.primary.main, mr: isMobile ? 1 : 2 }} />
          <Box>
            <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              Help Center
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
              Find answers to common questions and get support
            </Typography>
          </Box>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search help topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: { xs: 3, sm: 4 }, 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '50px',
              height: isMobile ? 40 : 50
            }, 
            '& .MuiInputBase-input': { 
              fontFamily: theme.typography.fontFamily,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
            } 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          size={isMobile ? "small" : "medium"}
        />
      </Paper>

      {searchTerm ? (
        // Search results view
        <Box>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
            Search Results
          </Typography>
          
          {filteredCategories.length > 0 && (
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                Categories
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: isMobile ? 1 : 2, overflow: 'hidden' }}>
                {filteredCategories.map((category, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    onClick={() => navigate(category.path)}
                    sx={{ 
                      py: isMobile ? 1 : 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: isMobile ? 30 : 40 }}>
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.title} 
                      secondary={category.description}
                      primaryTypographyProps={{ 
                        fontWeight: 600, 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                      }}
                      secondaryTypographyProps={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    />
                    <ArrowForwardIcon sx={{ color: theme.palette.grey[500], fontSize: isMobile ? 20 : 24 }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {filteredFaqs.length > 0 && (
            <Box>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 600, mb: { xs: 1, sm: 2 }, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                Frequently Asked Questions
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: isMobile ? 1 : 2, overflow: 'hidden' }}>
                {filteredFaqs.map((faq, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      py: isMobile ? 1 : 2.5,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    <Typography variant={isMobile ? "body1" : "subtitle1"} sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: isMobile ? 0.5 : 1, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                      {faq.question}
                    </Typography>
                    <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.6, fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>
                      {faq.answer}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {filteredCategories.length === 0 && filteredFaqs.length === 0 && (
            <Paper sx={{ p: isMobile ? 3 : 4, textAlign: 'center', borderRadius: isMobile ? 2 : 3 }}>
              <SearchIcon sx={{ fontSize: isMobile ? 40 : 60, color: 'grey.400', mb: 2 }} />
              <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                No results found for "{searchTerm}"
              </Typography>
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mt: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                Try different keywords or browse our help categories below.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        // Default view
        <Box>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
            Browse Help Topics
          </Typography>
          
          <List sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: isMobile ? 1 : 2, 
            overflow: 'hidden',
            mb: { xs: 4, sm: 6 }
          }}>
            {helpCategories.map((category, index) => (
              <ListItem 
                key={index} 
                button 
                onClick={() => navigate(category.path)}
                sx={{ 
                  py: isMobile ? 1.5 : 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  },
                  '&:not(:last-child)': {
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isMobile ? 35 : 50 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.title} 
                  secondary={category.description}
                  primaryTypographyProps={{ 
                    fontWeight: 600, 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
                  }}
                  secondaryTypographyProps={{ 
                    fontFamily: theme.typography.fontFamily,
                    mt: isMobile ? 0.25 : 0.5,
                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' }
                  }}
                />
                <ArrowForwardIcon sx={{ color: theme.palette.grey[500], fontSize: isMobile ? 20 : 24 }} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
            Frequently Asked Questions
          </Typography>
          
          <List sx={{ bgcolor: 'background.paper', borderRadius: isMobile ? 1 : 2, overflow: 'hidden' }}>
            {faqs.map((faq, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: isMobile ? 1.5 : 2.5,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:not(:last-child)': {
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }
                }}
              >
                <Typography variant={isMobile ? "body1" : "subtitle1"} sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: isMobile ? 0.5 : 1, fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
                  {faq.question}
                </Typography>
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.6, fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>
                  {faq.answer}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default HelpCenterPage;