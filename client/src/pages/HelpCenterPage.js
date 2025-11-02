import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText, Divider, alpha, TextField, InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      title: "Account Management",
      icon: <AccountIcon sx={{ color: theme.palette.primary.main }} />,
      description: "Learn how to create, manage, and secure your account",
      path: "/support#account"
    },
    {
      title: "Shopping & Orders",
      icon: <ShoppingIcon sx={{ color: theme.palette.secondary.main }} />,
      description: "Ordering, payment methods, and delivery information",
      path: "/support#shopping"
    },
    {
      title: "Community Guidelines",
      icon: <CommunityIcon sx={{ color: theme.palette.info.main }} />,
      description: "Rules and best practices for community participation",
      path: "/community/guidelines"
    },
    {
      title: "Shipping & Delivery",
      icon: <ShippingIcon sx={{ color: theme.palette.success.main }} />,
      description: "Delivery times, tracking, and shipping policies",
      path: "/support#shipping"
    },
    {
      title: "Payment Methods",
      icon: <PaymentIcon sx={{ color: theme.palette.warning.main }} />,
      description: "Accepted payment options and security information",
      path: "/support#payment"
    },
    {
      title: "Privacy & Security",
      icon: <SecurityIcon sx={{ color: theme.palette.error.main }} />,
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
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              Help Center
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
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
            mb: 4, 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '50px',
              height: 50
            }, 
            '& .MuiInputBase-input': { 
              fontFamily: theme.typography.fontFamily,
              fontSize: '1.1rem'
            } 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
        />
      </Paper>

      {searchTerm ? (
        // Search results view
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
            Search Results
          </Typography>
          
          {filteredCategories.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
                Categories
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                {filteredCategories.map((category, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    onClick={() => navigate(category.path)}
                    sx={{ 
                      py: 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.title} 
                      secondary={category.description}
                      primaryTypographyProps={{ 
                        fontWeight: 600, 
                        fontFamily: theme.typography.fontFamily 
                      }}
                      secondaryTypographyProps={{ 
                        fontFamily: theme.typography.fontFamily 
                      }}
                    />
                    <ArrowForwardIcon sx={{ color: theme.palette.grey[500] }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {filteredFaqs.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
                Frequently Asked Questions
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                {filteredFaqs.map((faq, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      py: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 1 }}>
                      {faq.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {faq.answer}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {filteredCategories.length === 0 && filteredFaqs.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <SearchIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No results found for "{searchTerm}"
              </Typography>
              <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mt: 1 }}>
                Try different keywords or browse our help categories below.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        // Default view
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
            Browse Help Topics
          </Typography>
          
          <List sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            overflow: 'hidden',
            mb: 6
          }}>
            {helpCategories.map((category, index) => (
              <ListItem 
                key={index} 
                button 
                onClick={() => navigate(category.path)}
                sx={{ 
                  py: 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  },
                  '&:not(:last-child)': {
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 50 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.title} 
                  secondary={category.description}
                  primaryTypographyProps={{ 
                    fontWeight: 600, 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: '1.1rem'
                  }}
                  secondaryTypographyProps={{ 
                    fontFamily: theme.typography.fontFamily,
                    mt: 0.5
                  }}
                />
                <ArrowForwardIcon sx={{ color: theme.palette.grey[500] }} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily }}>
            Frequently Asked Questions
          </Typography>
          
          <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            {faqs.map((faq, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: 2.5,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:not(:last-child)': {
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 1, fontSize: '1.1rem' }}>
                  {faq.question}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.6 }}>
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