import React, { useState } from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, TextField, Grid } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

const NewsletterSignup = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Newsletter signup:', email);
    setSubmitted(true);
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      borderRadius: 4,
      mb: 6
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <EmailIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 1 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.secondary.main
                  }}
                >
                  Stay Updated
                </Typography>
              </Box>
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary
                }}
              >
                Join Our Newsletter
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  fontFamily: theme.typography.fontFamily, 
                  maxWidth: '600px'
                }}
              >
                Get the latest recipes, seasonal offers, and farming tips delivered straight to your inbox.
              </Typography>
              
              <Box component="ul" sx={{ pl: 2, mb: 3, textAlign: 'left' }}>
                <Typography component="li" variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                  Exclusive recipes from our chefs
                </Typography>
                <Typography component="li" variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                  Early access to seasonal produce
                </Typography>
                <Typography component="li" variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Special discounts and promotions
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              p: 4, 
              borderRadius: 3, 
              bgcolor: 'background.paper',
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              {submitted ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 2, 
                      fontFamily: theme.typography.fontFamily,
                      color: theme.palette.success.main
                    }}
                  >
                    Thank You!
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      mb: 3
                    }}
                  >
                    You've been subscribed to our newsletter. Check your email for confirmation.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3, 
                      fontFamily: theme.typography.fontFamily,
                      textAlign: 'center'
                    }}
                  >
                    Subscribe Now
                  </Typography>
                  <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '50px',
                          fontFamily: theme.typography.fontFamily
                        },
                        '& .MuiInputBase-input': { 
                          py: 1.5,
                          px: 2,
                          fontFamily: theme.typography.fontFamily
                        }
                      }}
                      InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      endIcon={<SendIcon />}
                      size="large"
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 'bold', 
                        borderRadius: '50px', 
                        py: 1.5,
                        boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': { 
                          boxShadow: `0 0 25px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.secondary.main, 0.6)}`,
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      Get Fresh Updates
                    </Button>
                  </form>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 2, 
                      fontFamily: theme.typography.fontFamily 
                    }}
                  >
                    We respect your privacy. Unsubscribe at any time.
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsletterSignup;