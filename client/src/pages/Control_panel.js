import React from "react";
import {
  Box, ButtonBase, Typography, Grid, useTheme, useMediaQuery, Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from "@mui/icons-material/Settings";

const pages = [
  { label: "Profile", path: "/profile", icon: AccountCircleIcon, color: "#786fa6" },
  { label: "Subscription", path: "/subscription", icon: PaymentIcon, color: "#4dd0e1" },
  { label: "My Addresses", path: "/profile/addresses", icon: HomeIcon, color: "#ffb94b" },
  { label: "Community", path: "/community", icon: GroupIcon, color: "#4fc3f7" },
  { label: "My Orders", path: "/profile/orders", icon: ReceiptLongIcon, color: "#b8e986" },
  { label: "Settings", path: "/settings", icon: SettingsIcon, color: "#b388ff" },
  { label: "Shopping Cart", path: "/cart", icon: ShoppingCartIcon, color: "#ff8a65" },
];

export default function ControlPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Set fixed height and width for dashboard cards
  const CARD_HEIGHT = 140;
  const CARD_WIDTH = 250;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        pt: { xs: 7, sm: 10 },
        pb: 7,
        px: { xs: 1, sm: 4, md: 8 },
      }}
    >
      {/* Dashboard Title */}
      <Fade in>
        <Typography
          variant={isSmall ? "h5" : "h3"}
          fontWeight={900}
          sx={{
            mb: 1,
            letterSpacing: 2,
            fontFamily: theme.typography.fontFamily,
            color: theme.palette.primary.main,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Control Panel
        </Typography>
      </Fade>
      <Box
        sx={{
          height: 5,
          width: 62,
          background: `linear-gradient(90deg,${theme.palette.primary.main}30,${theme.palette.secondary.main}80)`,
          borderRadius: 6,
          mx: "auto",
          mb: { xs: 4, sm: 5 },
        }}
      />

      {/* Dashboard Grid */}
      <Grid
        container
        spacing={isSmall ? 3 : 4}
        justifyContent="center"
        alignItems="stretch"
        sx={{ maxWidth: 1050, mx: "auto", width: "100%" }}
      >
        {pages.map(({ label, path, icon: Icon, color }) => (
          <Grid
            key={label}
            item
            xs={12}
            sm={6}
            md={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              minHeight: CARD_HEIGHT,
            }}
          >
            <ButtonBase
              onClick={() => navigate(path)}
              focusRipple
              sx={{
                width: CARD_WIDTH,
                minWidth: CARD_WIDTH,
                maxWidth: CARD_WIDTH,
                height: CARD_HEIGHT,
                minHeight: CARD_HEIGHT,
                maxHeight: CARD_HEIGHT,
                borderRadius: 4,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2.5,
                px: 2.5,
                background: `rgba(255,255,255,0.72)`,
                boxShadow: theme.shadows[6],
                overflow: "hidden",
                position: "relative",
                border: `2px solid transparent`,
                transition: "box-shadow 0.28s, border 0.2s, background 0.2s, transform 0.2s",
                "&:hover, &:focus-visible": {
                  boxShadow: theme.shadows[16],
                  background: `rgba(255,255,255,0.98)`,
                  border: `2px solid ${color}`,
                  transform: "translateY(-3px) scale(1.027)",
                  ".icon-bg": { filter: "brightness(0.94)" },
                },
              }}
            >
              <Box
                className="icon-bg"
                sx={{
                  flexShrink: 0,
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  background: color,
                  backgroundImage: `linear-gradient(135deg, ${color}90 40%, #fff5 130%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 12px 0 ${color}33`,
                  transition: "filter 0.2s",
                }}
              >
                <Icon sx={{ color: "#fff", fontSize: 32 }} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                textAlign="left"
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  flexGrow: 1,
                  letterSpacing: 1,
                  userSelect: "none",
                  fontSize: { xs: 18, sm: 20 },
                  lineHeight: 1.1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Typography>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}
