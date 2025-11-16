import React from 'react';
import {
  Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText, Divider, alpha, useMediaQuery, useTheme
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Gavel as GavelIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';

const CommunityGuidelinesPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const guidelines = [
    {
      title: "Be Respectful",
      description: "Treat all community members with respect and kindness. Disagreements are normal, but personal attacks are not tolerated.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to the group's purpose. Off-topic posts may be removed by moderators.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "No Harassment",
      description: "Harassment, bullying, or hate speech of any kind will not be tolerated and may result in account suspension.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "Share Original Content",
      description: "When possible, share your own recipes, photos, and experiences. If sharing content from others, give proper credit.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "Follow Copyright Laws",
      description: "Do not post copyrighted material without permission. This includes recipes, photos, and other content you don't own.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "No Spam or Self-Promotion",
      description: "Avoid excessive posting, promotional content, or advertising without explicit permission from moderators.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: isMobile ? 20 : 24 }} />
    },
    {
      title: "Be Authentic",
      description: "Share genuine experiences and opinions. Do not impersonate others or create fake accounts.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: isMobile ? 20 : 24 }} />
    }
  ];

  const responsibilities = [
    "Report inappropriate content using the report button",
    "Participate in discussions constructively",
    "Help new members feel welcome",
    "Respect the decisions of moderators",
    "Keep personal information private"
  ];

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
          <GavelIcon sx={{ fontSize: isMobile ? 32 : 40, color: theme.palette.primary.main, mr: isMobile ? 1 : 2 }} />
          <Box>
            <Typography variant={isMobile ? "h5" : "h3"} component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              Community Guidelines
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
              Creating a positive environment for everyone
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: { xs: 3, sm: 4 }, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
          Our community guidelines are designed to foster a welcoming, respectful, and inclusive environment for all food enthusiasts. 
          By participating in our community, you agree to follow these guidelines and help maintain the quality of our discussions.
        </Typography>
        
        <Divider sx={{ my: { xs: 2, sm: 3 } }} />
        
        <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
          Core Guidelines
        </Typography>
        
        <List sx={{ mb: { xs: 3, sm: 4 } }}>
          {guidelines.map((guideline, index) => (
            <ListItem key={index} sx={{ alignItems: 'flex-start', py: isMobile ? 1 : 2 }}>
              <ListItemIcon sx={{ minWidth: isMobile ? 30 : 40, mt: 0.5 }}>
                {guideline.icon}
              </ListItemIcon>
              <ListItemText 
                primary={guideline.title} 
                secondary={guideline.description}
                primaryTypographyProps={{ 
                  fontWeight: 600, 
                  fontFamily: theme.typography.fontFamily,
                  mb: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                }}
                secondaryTypographyProps={{ 
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: { xs: 2, sm: 3 } }} />
        
        <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
          Your Responsibilities
        </Typography>
        
        <List sx={{ mb: { xs: 3, sm: 4 } }}>
          {responsibilities.map((responsibility, index) => (
            <ListItem key={index} sx={{ py: isMobile ? 0.5 : 1 }}>
              <ListItemIcon sx={{ minWidth: isMobile ? 30 : 40 }}>
                <InfoIcon sx={{ color: theme.palette.info.main, fontSize: isMobile ? 20 : 24 }} />
              </ListItemIcon>
              <ListItemText 
                primary={responsibility} 
                primaryTypographyProps={{ 
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: { xs: 2, sm: 3 } }} />
        
        <Box sx={{ p: isMobile ? 2 : 3, borderRadius: isMobile ? 2 : 3, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
          <Typography variant={isMobile ? "body1" : "h5"} sx={{ fontWeight: 700, mb: isMobile ? 1 : 2, fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', fontSize: { xs: '0.95rem', sm: '1.25rem', md: '1.5rem' } }}>
            <InfoIcon sx={{ mr: isMobile ? 0.5 : 1, color: theme.palette.info.main, fontSize: isMobile ? 20 : 28 }} />
            Important Notes
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.7, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
            Moderators have the authority to remove content, issue warnings, or suspend accounts that violate these guidelines. 
            Repeated violations may result in permanent account suspension. If you see content that violates these guidelines, 
            please report it using the report button rather than engaging with the poster directly.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CommunityGuidelinesPage;