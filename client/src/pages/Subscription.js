import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../config/axios";
import { useAuth } from "../contexts/AuthContext";

const FEATURES = [
  "Browse all public recipes",
  "Shop the entire marketplace",
  "Basic community access",
  "Save up to 20 favorite recipes",
  "Create weekly meal plans",
  "Save unlimited favorite recipes",
  "Access to premium recipe collections",
  "Advanced meal planner with nutritional info",
  "Create and share shopping lists",
  "Priority customer support",
  "Exclusive video tutorials from chefs",
  "Monthly curated ingredient box",
  "Early access to seasonal produce",
  "Personalized recipe recommendations",
  "Direct support from our culinary team",
];

const PLAN_FEATURE_COUNTS = {
  free: 5,
  premium: 10,
  pro: FEATURES.length,
};

const PLANS = [
  { key: "free", name: "Foodie", price: "$0 / month" },
  { key: "premium", name: "Pro Chef", price: "$7.99 / month" },
  { key: "pro", name: "Gourmet", price: "$24.99 / month" },
];

export default function SubscriptionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, loadUser } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(user?.subscription?.plan || "free");
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // success or error

  useEffect(() => {
    setCurrentPlan(user?.subscription?.plan || "free");
    setSelectedPlan(user?.subscription?.plan || "free");
  }, [user?.subscription?.plan]);

  const isFeatureIncluded = (planKey, featureIndex) =>
    featureIndex < PLAN_FEATURE_COUNTS[planKey];

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleConfirmSubscription = async () => {
    if (selectedPlan === currentPlan) return;

    if (!user || !user.id) {
      setSnackbarMessage("You must be logged in to change subscription.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const response = await api.put(`/users/${user.id}/subscription`, {
        plan: selectedPlan,
        startDate: now.toISOString(),
        endDate: oneMonthLater.toISOString(),
        isActive: selectedPlan !== "free",
      });

      if (response?.data?.success) {
        setCurrentPlan(selectedPlan);
        await loadUser();
        setSnackbarMessage(`Successfully subscribed to ${selectedPlan.toUpperCase()} plan!`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to update subscription. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while updating subscription.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Subscription update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ plan, isCurrent, isSelected, onSelect }) => (
    <Paper
      elevation={isSelected ? 8 : 3}
      sx={{
        p: 3,
        borderRadius: 3,
        border: isSelected ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
        bgcolor: isCurrent ? theme.palette.action.selected : 'background.paper',
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>{plan.name}</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{plan.price}</Typography>
      <List sx={{ my: 2 }}>
        {FEATURES.map((feature, i) => (
          <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {isFeatureIncluded(plan.key, i) ? <CheckCircleIcon color="success" /> : <CancelIcon color="disabled" />}
            </ListItemIcon>
            <ListItemText primary={feature} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
          </ListItem>
        ))}
      </List>
      <Button
        fullWidth
        variant={isSelected ? "contained" : "outlined"}
        color={isSelected ? "secondary" : "primary"}
        disabled={isCurrent || loading}
        onClick={() => onSelect(plan.key)}
        sx={{ fontFamily: theme.typography.fontFamily }}
      >
        {isCurrent ? "Current Plan" : isSelected ? "Selected" : "Select"}
      </Button>
    </Paper>
  );

  return (
    <Box maxWidth={960} mx="auto" my={6} px={2}>
      <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ fontFamily: theme.typography.fontFamily }}>
        Choose Your Subscription Plan
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom align="center" sx={{ fontFamily: theme.typography.fontFamily }}>
        Select the best plan that fits your needs and upgrade anytime.
      </Typography>

      {isMobile ? (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {PLANS.map(plan => (
            <Grid item xs={12} key={plan.key}>
              <PlanCard
                plan={plan}
                isCurrent={plan.key === currentPlan}
                isSelected={plan.key === selectedPlan}
                onSelect={handleSelectPlan}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} elevation={4} sx={{ mt: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold", minWidth: 240, fontFamily: theme.typography.fontFamily }}>
                  Features
                </TableCell>
                {PLANS.map((plan) => (
                  <TableCell
                    key={plan.key}
                    align="center"
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 18,
                      userSelect: "none",
                      bgcolor:
                        plan.key === currentPlan ? theme.palette.secondary.main : "inherit",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {plan.name}
                    <Typography variant="subtitle2" sx={{ mt: 0.5, fontFamily: theme.typography.fontFamily }}>
                      {plan.price}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {FEATURES.map((feature, i) => (
                <TableRow key={feature} hover>
                  <TableCell sx={{ py: 1.5, fontWeight: "600", fontFamily: theme.typography.fontFamily }}>{feature}</TableCell>
                  {PLANS.map((plan) => (
                    <TableCell key={plan.key + feature} align="center" sx={{ py: 1.5 }}>
                      {isFeatureIncluded(plan.key, i) ? (
                        <Tooltip title="Included" arrow>
                          <CheckCircleIcon color="success" fontSize="large" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Not included" arrow>
                          <CancelIcon color="disabled" fontSize="large" />
                        </Tooltip>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              <TableRow>
                <TableCell />
                {PLANS.map((plan) => {
                  const isCurrent = plan.key === currentPlan;
                  const isSelected = plan.key === selectedPlan;
                  return (
                    <TableCell key={"btn-" + plan.key} align="center" sx={{ py: 3 }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "secondary" : "primary"}
                        disabled={isCurrent || loading}
                        onClick={() => handleSelectPlan(plan.key)}
                        sx={{ minWidth: 140, fontFamily: theme.typography.fontFamily }}
                      >
                        {isCurrent ? "Current Plan" : isSelected ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={4} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
        <Button
          variant="contained"
          color="secondary"
          size={isMobile ? "medium" : "large"}
          disabled={selectedPlan === currentPlan || loading}
          onClick={handleConfirmSubscription}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ fontFamily: theme.typography.fontFamily }}
        >
          {selectedPlan === currentPlan
            ? "Subscribed"
            : loading
            ? "Processing..."
            : "Confirm Subscription"}
        </Button>
        {selectedPlan !== currentPlan && !loading && (
          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            onClick={() => setSelectedPlan(currentPlan)}
            sx={{ fontFamily: theme.typography.fontFamily }}
          >
            Cancel
          </Button>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontFamily: theme.typography.fontFamily }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
