import React from 'react';
import { Box, Container, Typography, Paper, Link, Accordion, AccordionSummary, AccordionDetails, List, ListItem, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const Section = ({ title, children, defaultExpanded = false }) => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion
        defaultExpanded={defaultExpanded}
        sx={{
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: isMobile ? 1 : 2,
          '&:before': { display: 'none' },
          bgcolor: 'background.paper',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '& .MuiAccordionSummary-content': { margin: isMobile ? '12px 0' : '16px 0' } }}
        >
          <Typography variant={isMobile ? "h6" : "h5"} component="h2" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: isMobile ? 1 : 2, px: isMobile ? 1 : 2 }}>{children}</AccordionDetails>
      </Accordion>
    </Box>
  );
};

const PrivacyPolicyPage = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', pt: { xs: 6.5, sm: 8.5, md: 10.5 }, pb: { xs: 6.5, sm: 8.5, md: 10.5 } }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 4, sm: 5, md: 6 },
            mb: { xs: 4, sm: 5, md: 6 },
            textAlign: 'center',
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <PrivacyTipIcon sx={{ fontSize: isMobile ? 30 : 40, color: 'primary.main', mb: 3.5 }} />
          <Typography variant={isMobile ? "h5" : "h2"} component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Privacy Policy
          </Typography>
        </Paper>

        <Box>
          <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary', mb: { xs: 2, sm: 3, md: 4 }, fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
            Cook'N'Crop ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </Typography>

          <Section title="1. Information We Collect" defaultExpanded>
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              We may collect information about you in a variety of ways. The information we may collect on the Service includes:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: isMobile ? 2 : 4 }}>
              <ListItem sx={{ display: 'list-item', p: 0, pb: isMobile ? 0.5 : 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0, pb: isMobile ? 0.5 : 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>User Content:</strong> Information you post to the service, such as recipes, comments, and photos.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0, pb: isMobile ? 0.5 : 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase from the Service. We store only very limited, if any, financial information that we collect.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Usage Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, browser type, and access times.</Typography></ListItem>
            </List>
          </Section>

          <Section title="2. How We Use Your Information">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to create and manage your account, process transactions, email you regarding your account or order, and monitor usage to improve the Service.
            </Typography>
          </Section>

          <Section title="3. Disclosure of Your Information">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              We may share information we have collected about you in certain situations, such as with third-party service providers for payment processing and data analysis, or if required by law to protect the rights and safety of others.
            </Typography>
          </Section>

          <Section title="4. Security of Your Information">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </Typography>
          </Section>

          <Section title="5. Contact Us">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              If you have questions or comments about this Privacy Policy, please contact us at <Link href="mailto:support@cookncrop.com" sx={{ fontFamily: 'inherit' }}>support@cookncrop.com</Link>.
            </Typography>
          </Section>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;