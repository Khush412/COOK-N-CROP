import React from 'react';
import { Box, Container, Typography, Paper, Divider, alpha, Link, Accordion, AccordionSummary, AccordionDetails, List, ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';

const Section = ({ title, children, defaultExpanded = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion
        defaultExpanded={defaultExpanded}
        sx={{
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          '&:before': { display: 'none' },
          bgcolor: 'background.paper',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '& .MuiAccordionSummary-content': { margin: '16px 0' } }}
        >
          <Typography variant={isMobile ? "h6" : "h5"} component="h2" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>{children}</AccordionDetails>
      </Accordion>
    </Box>
  );
};

const TermsPage = () => {
  const theme = useTheme();
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
          <GavelIcon sx={{ fontSize: { xs: 30, sm: 40, md: 50 }, color: 'primary.main', mb: 3.5 }} />
          <Typography variant={isMobile ? "h5" : "h2"} component="h1" sx={{ fontWeight: 800, mb: 3, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Terms of Service
          </Typography>
        </Paper>

        <Box>
          <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary', mb: 4, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Welcome to Cook'N'Crop! These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
          </Typography>

          <Section title="1. User Accounts" defaultExpanded>
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              To access certain features of our Service, you must create an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
            </Typography>
          </Section>

          <Section title="2. User-Generated Content">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Our Service allows you to post content, including recipes, comments, and photos ("User Content"). You retain all rights in, and are solely responsible for, the User Content you post. By posting User Content, you grant Cook'N'Crop a non-exclusive, royalty-free, worldwide, perpetual license to use, display, reproduce, and distribute your User Content in connection with the Service.
            </Typography>
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              You agree not to post User Content that is illegal, obscene, defamatory, threatening, infringing of intellectual property rights, or otherwise injurious to third parties.
            </Typography>
          </Section>

          <Section title="3. Purchases and Payments">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              If you purchase products from our marketplace ("Crop'Corner"), you agree to provide current, complete, and accurate purchase and account information. All payments are processed through a secure third-party payment processor. We are not responsible for any errors or issues with the payment processor.
            </Typography>
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Prices for our products are subject to change without notice. We reserve the right to refuse any order you place with us.
            </Typography>
          </Section>

          <Section title="4. Prohibited Conduct">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              You agree not to use the Service to:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              <ListItem sx={{ display: 'list-item', p: 0, pb: 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Violate any local, state, national, or international law.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0, pb: 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Engage in any activity that is harmful, fraudulent, deceptive, or harassing.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0, pb: 1 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks.</Typography></ListItem>
              <ListItem sx={{ display: 'list-item', p: 0 }}><Typography component="span" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Interfere with or disrupt the integrity or performance of the Service.</Typography></ListItem>
            </List>
          </Section>

          <Section title="5. Intellectual Property">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Cook'N'Crop and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </Typography>
          </Section>

          <Section title="6. Termination">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </Typography>
          </Section>

          <Section title="7. Disclaimers and Limitation of Liability">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. Cook'N'Crop, its directors, employees, partners, and agents make no warranties of any kind, whether express or implied.
            </Typography>
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              In no event shall Cook'N'Crop be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </Typography>
          </Section>

          <Section title="8. Governing Law">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Cook'N'Crop is established, without regard to its conflict of law provisions.
            </Typography>
          </Section>

          <Section title="9. Changes to Terms">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms take effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </Typography>
          </Section>

          <Section title="10. Contact Us">
            <Typography paragraph sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              If you have any questions about these Terms, please contact us at <Link href="mailto:support@cookncrop.com" sx={{ fontFamily: 'inherit' }}>support@cookncrop.com</Link>.
            </Typography>
          </Section>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsPage;