import React from "react";
import { Box, Container, Typography, Link, Grid, IconButton, Stack, useTheme } from "@mui/material";
import { Facebook, Twitter, LinkedIn, Instagram, EmailOutlined } from "@mui/icons-material";

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        fontFamily: theme.typography.fontFamily,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        pt: 2,
        pb: 2,
        mt: 0,
        borderTop: `2.5px solid ${theme.palette.secondary.main}`,
        fontSize: 14,
        userSelect: "none",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          {/* Brand & Copyright */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                mb: 0.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.palette.getContrastText(theme.palette.primary.main),
              }}
            >
              Cook'N'Crop
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              &copy; {new Date().getFullYear()} Cook'N'Crop. All rights reserved.
            </Typography>
          </Grid>

          {/* Useful Links */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: "center", md: "center" } }}>
            <Stack
              direction="row"
              gap={3}
              justifyContent={{ xs: "center", md: "center" }}
              flexWrap="wrap"
            >
              {[
                { label: "About", href: "/about" },
                { label: "Support", href: "/support" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  underline="hover"
                  color="inherit"
                  sx={{
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 500,
                    fontSize: 13,
                    opacity: 0.92,
                    "&:hover": { color: theme.palette.secondary.main },
                    px: 0.5,
                  }}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Socials & Contact */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: "center", md: "right" } }}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: "center", md: "flex-end" }} mb={0.5}>
              {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, idx) => (
                <IconButton
                  key={idx}
                  aria-label="social media"
                  href="https://www.google.com/search?q=cook+n+crop"
                  size="small"
                  sx={{
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    transition: "color 0.3s",
                    "&:hover": { color: theme.palette.secondary.main, background: "none" },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.8, fontSize: "0.85em" }}>
              <EmailOutlined fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
              <a href="mailto:support@cookncrop.com" style={{ color: "inherit", textDecoration: "none" }}>
                support@cookncrop.com
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}