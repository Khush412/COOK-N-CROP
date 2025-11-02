import React from 'react';
import {
  Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText, Divider, alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Gavel as GavelIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';

const CommunityGuidelinesPage = () => {
  const theme = useTheme();

  const guidelines = [
    {
      title: "Be Respectful",
      description: "Treat all community members with respect and kindness. Disagreements are normal, but personal attacks are not tolerated.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to the group's purpose. Off-topic posts may be removed by moderators.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    },
    {
      title: "No Harassment",
      description: "Harassment, bullying, or hate speech of any kind will not be tolerated and may result in account suspension.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main }} />
    },
    {
      title: "Share Original Content",
      description: "When possible, share your own recipes, photos, and experiences. If sharing content from others, give proper credit.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    },
    {
      title: "Follow Copyright Laws",
      description: "Do not post copyrighted material without permission. This includes recipes, photos, and other content you don't own.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main }} />
    },
    {
      title: "No Spam or Self-Promotion",
      description: "Avoid excessive posting, promotional content, or advertising without explicit permission from moderators.",
      icon: <ErrorIcon sx={{ color: theme.palette.error.main }} />
    },
    {
      title: "Be Authentic",
      description: "Share genuine experiences and opinions. Do not impersonate others or create fake accounts.",
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
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
    <Container maxWidth="md" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <GavelIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              Community Guidelines
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Creating a positive environment for everyone
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 4, fontFamily: theme.typography.fontFamily, fontSize: '1.1rem', lineHeight: 1.7 }}>
          Our community guidelines are designed to foster a welcoming, respectful, and inclusive environment for all food enthusiasts. 
          By participating in our community, you agree to follow these guidelines and help maintain the quality of our discussions.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Core Guidelines
        </Typography>
        
        <List sx={{ mb: 4 }}>
          {guidelines.map((guideline, index) => (
            <ListItem key={index} sx={{ alignItems: 'flex-start', py: 2 }}>
              <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                {guideline.icon}
              </ListItemIcon>
              <ListItemText 
                primary={guideline.title} 
                secondary={guideline.description}
                primaryTypographyProps={{ 
                  fontWeight: 600, 
                  fontFamily: theme.typography.fontFamily,
                  mb: 0.5
                }}
                secondaryTypographyProps={{ 
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.6
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Your Responsibilities
        </Typography>
        
        <List sx={{ mb: 4 }}>
          {responsibilities.map((responsibility, index) => (
            <ListItem key={index} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <InfoIcon sx={{ color: theme.palette.info.main }} />
              </ListItemIcon>
              <ListItemText 
                primary={responsibility} 
                primaryTypographyProps={{ 
                  fontFamily: theme.typography.fontFamily,
                  lineHeight: 1.6
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ p: 3, borderRadius: 3, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: theme.palette.info.main }} />
            Important Notes
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.7 }}>
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