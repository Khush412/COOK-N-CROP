import React, { useState, useEffect } from "react";
import * as C from "./AuthStyles";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import PixelBlast from "../custom_components/PixelBlastBackground";

export default function AuthPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading, error, clearError } =
    useAuth();

  const [signingIn, setSigningIn] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountNotFoundPopup, setShowAccountNotFoundPopup] = useState(false);
  const [showIncorrectPasswordPopup, setShowIncorrectPasswordPopup] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  // Function to show snackbar messages
  const showSnackbar = (message, severity = "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
    setLocalError(null);
    clearError();
  };

  const handleSignIn = async (e) => {
    e.preventDefault(); // MUST be first to stop reload
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    // Client-side validation
    if (!email || !password) {
      showSnackbar("Please fill in all fields", "error");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSnackbar("Please enter a valid email address", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (!result.success) {
        const { status, code, message } = result;
        const errorMessage = message || "Login failed";

        // Handle specific error cases
        if (status === 404 || code === 'USER_NOT_FOUND') {
          setShowAccountNotFoundPopup(true);
        } else if (status === 401) {
          if (code === 'INCORRECT_PASSWORD' || errorMessage.toLowerCase().includes('incorrect password')) {
            setShowIncorrectPasswordPopup(true);
          } else if (errorMessage.includes('deactivated') || errorMessage.includes('Account is deactivated')) {
            showSnackbar("This account has been deactivated. Please contact support.", "error");
          } else {
            // Fallback: treat generic 401 as user not found to avoid always showing incorrect password
            setShowAccountNotFoundPopup(true);
          }
        } else if (status === 500) {
          showSnackbar("Server error during login. Please try again later.", "error");
        } else if (status === 429) {
          showSnackbar("Too many login attempts. Please wait a few minutes and try again.", "warning");
        } else if (errorMessage.includes("Network Error")) {
          showSnackbar("Network connection failed. Please check your internet connection and try again.", "error");
        } else {
          showSnackbar(errorMessage, "error");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      // Handle network errors specifically
      if (err.message && err.message.includes("Network Error")) {
        showSnackbar("Network connection failed. Please check your internet connection and try again.", "error");
      } else {
        showSnackbar("An unexpected error occurred. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // MUST be first to stop reload
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    // Client-side validation
    if (!username || !email || !password) {
      showSnackbar("Please fill in all fields", "error");
      setIsSubmitting(false);
      return;
    }

    if (username.length < 3) {
      showSnackbar("Username must be at least 3 characters long", "error");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      showSnackbar("Password must be at least 6 characters long", "error");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSnackbar("Please enter a valid email address", "error");
      setIsSubmitting(false);
      return;
    }

    // Username validation (no special characters except underscore and hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      showSnackbar("Username can only contain letters, numbers, underscores, and hyphens", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register({ username, email, password });
      if (!result.success) {
        // Handle specific error cases with more detailed messages
        const errorMessage = result.message || "Registration failed";
        
        // Handle duplicate email/username errors - MORE COMPREHENSIVE CHECKS
        if (errorMessage.includes("User already exists with this email") || 
            errorMessage.includes("email already exists") ||
            (errorMessage.includes("email") && errorMessage.includes("exists")) ||
            errorMessage.toLowerCase().includes("email taken") ||
            errorMessage.toLowerCase().includes("email already registered")) {
          showSnackbar("An account with this email already exists. Please use a different email or sign in instead.", "error");
        } else if (errorMessage.includes("Username is already taken") || 
                   errorMessage.includes("username already taken") ||
                   (errorMessage.includes("username") && errorMessage.includes("taken")) ||
                   (errorMessage.includes("username") && errorMessage.includes("exists"))) {
          showSnackbar("This username is already taken. Please choose a different username.", "error");
        } 
        // Handle MongoDB duplicate key errors
        else if (errorMessage.includes("email") && errorMessage.includes("exists")) {
          showSnackbar("An account with this email already exists. Please use a different email or sign in instead.", "error");
        } else if (errorMessage.includes("username") && errorMessage.includes("exists")) {
          showSnackbar("This username is already taken. Please choose a different username.", "error");
        }
        // Handle validation errors
        else if (errorMessage.includes("Validation Error")) {
          // Extract specific validation messages if possible
          if (errorMessage.includes("username") && errorMessage.includes("required")) {
            showSnackbar("Username is required.", "error");
          } else if (errorMessage.includes("email") && errorMessage.includes("required")) {
            showSnackbar("Email is required.", "error");
          } else if (errorMessage.includes("password") && errorMessage.includes("required")) {
            showSnackbar("Password is required.", "error");
          } else if (errorMessage.includes("email") && errorMessage.includes("unique")) {
            showSnackbar("An account with this email already exists.", "error");
          } else if (errorMessage.includes("username") && errorMessage.includes("unique")) {
            showSnackbar("This username is already taken.", "error");
          } else {
            showSnackbar("Please check your information and try again.", "error");
          }
        }
        // Handle server errors
        else if (errorMessage.includes("Server error")) {
          showSnackbar("Server error during registration. Please try again later.", "error");
        }
        // Handle network errors
        else if (errorMessage.includes("Network Error")) {
          showSnackbar("Network connection failed. Please check your internet connection and try again.", "error");
        }
        // Fallback for other errors
        else {
          showSnackbar(errorMessage, "error");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Handle network errors specifically
      if (err.message && err.message.includes("Network Error")) {
        showSnackbar("Network connection failed. Please check your internet connection and try again.", "error");
      } 
      // Handle duplicate key errors that might come from the catch block
      else if (err.response && err.response.data && err.response.data.message) {
        const serverMessage = err.response.data.message;
        if (serverMessage.includes("email") && serverMessage.includes("exists")) {
          showSnackbar("An account with this email already exists. Please use a different email or sign in instead.", "error");
        } else if (serverMessage.includes("username") && serverMessage.includes("exists")) {
          showSnackbar("This username is already taken. Please choose a different username.", "error");
        } else {
          showSnackbar(serverMessage || "An unexpected error occurred. Please try again.", "error");
        }
      }
      else {
        showSnackbar("An unexpected error occurred. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleGitHubSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/github`;
  };

  const handleLinkedInSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/linkedin`;
  };

  // Prevent closing the popup by clicking outside or pressing ESC
  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setShowAccountNotFoundPopup(false);
    setShowIncorrectPasswordPopup(false);
  };

  const handleCloseAccountNotFoundPopup = () => {
    setShowAccountNotFoundPopup(false);
    setLocalError(null);
    clearError();
  };

  const handleCloseIncorrectPasswordPopup = () => {
    setShowIncorrectPasswordPopup(false);
    setLocalError(null);
    clearError();
  };

  return (
    <Box
      sx={{
        bgcolor: "transparent",
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        pt: { xs: 12, md: 12 },
        pb: 6,
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}>
        <PixelBlast 
          variant="circle"
          pixelSize={3}
          color={theme.palette.primary.main}
          style={{
            width: "100%",
            height: "100%",
          }}
          speed={0.4}
          patternScale={1.5}
          patternDensity={0.8}
          pixelSizeJitter={0.2}
          edgeFade={0.3}
          enableRipples={true}
          rippleIntensityScale={1.2}
          rippleThickness={0.12}
          rippleSpeed={0.4}
          liquid={true}
          liquidStrength={0.18}
          liquidRadius={1.5}
          liquidWobbleSpeed={3.5}
          noiseAmount={0.02}
          transparent={true}
        />
      </div>
      <C.Container>
        <C.SignUpContainer $signingIn={signingIn}>
          <C.Form onSubmit={handleSignUp} autoComplete="off">
            <C.Title>Create Account</C.Title>
            <C.Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <C.Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <C.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <C.Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </C.Button>

            <Box sx={{ mt: 3, width: "100%" }}>
              <Typography sx={{ textAlign: "center", mb: 1, color: theme.palette.text.secondary }}>
                Or sign up with
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                <IconButton onClick={handleGoogleSignIn} aria-label="Sign up with Google">
                  <FcGoogle size={32} />
                </IconButton>
                <IconButton onClick={handleGitHubSignIn} aria-label="Sign up with GitHub">
                  <FaGithub size={32} color="#333" />
                </IconButton>
                <IconButton onClick={handleLinkedInSignIn} aria-label="Sign up with LinkedIn">
                  <FaLinkedin size={32} color="#0A66C2" />
                </IconButton>
              </Box>
            </Box>
          </C.Form>
        </C.SignUpContainer>

        <C.SignInContainer $signingIn={signingIn}>
          <C.Form onSubmit={handleSignIn} autoComplete="off">
            <C.Title>Sign In</C.Title>
            <C.Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <C.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <C.Anchor
              as={RouterLink}
              to="/forgot-password"              style={{
                color: theme.palette.primary.main,
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Forgot your password?
            </C.Anchor>
            <C.Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </C.Button>

            <Box sx={{ mt: 3, width: "100%" }}>
              <Typography sx={{ textAlign: "center", mb: 1, color: theme.palette.text.secondary }}>
                Or sign in with
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                <IconButton onClick={handleGoogleSignIn} aria-label="Sign in with Google">
                  <FcGoogle size={32} />
                </IconButton>
                <IconButton onClick={handleGitHubSignIn} aria-label="Sign in with GitHub">
                  <FaGithub size={32} color="#333" />
                </IconButton>
                <IconButton onClick={handleLinkedInSignIn} aria-label="Sign in with LinkedIn">
                  <FaLinkedin size={32} color="#0A66C2" />
                </IconButton>
              </Box>
            </Box>
          </C.Form>
        </C.SignInContainer>

        <C.OverlayContainer $signingIn={signingIn}>
          <C.Overlay $signingIn={signingIn}>
            <C.LeftOverlayPanel $signingIn={signingIn}>
              <C.Title>Welcome Back!</C.Title>
              <C.Paragraph>
                To keep connected with us please login with your personal info
              </C.Paragraph>
              <C.GhostButton type="button" onClick={() => setSigningIn(true)}>
                Sign In
              </C.GhostButton>
            </C.LeftOverlayPanel>
            <C.RightOverlayPanel $signingIn={signingIn}>
              <C.Title>Hello, Friend!</C.Title>
              <C.Paragraph>
                Enter your personal details and start your journey with us
              </C.Paragraph>
              <C.GhostButton type="button" onClick={() => setSigningIn(false)}>
                Sign Up
              </C.GhostButton>
            </C.RightOverlayPanel>
          </C.Overlay>
        </C.OverlayContainer>

        <Dialog
          open={showAccountNotFoundPopup}
          onClose={handleDialogClose}
          maxWidth="xs"
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              background: `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "rgba(0, 32, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"} 0%, ${theme.palette.mode === "dark" ? "rgba(0, 32, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"} 100%)`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              position: "relative",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <IconButton
            onClick={handleCloseAccountNotFoundPopup}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 1,
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: theme.palette.error.main,
                  mx: "auto",
                  boxShadow: `0 4px 16px ${theme.palette.error.main}40`,
                }}
              >
                <WarningIcon sx={{ fontSize: 24, color: "white" }} />
              </Avatar>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
              Account Not Found
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, lineHeight: 1.4, fontFamily: theme.typography.fontFamily }}>
              We couldn't find an account with that email address.
              <br />
              Don't have an account yet? Create one to get started!
            </Typography>
            <Box
              sx={{
                bgcolor: theme.palette.primary.main + "10",
                borderRadius: 2,
                p: 1.5,
                mb: 1,
                border: `1px solid ${theme.palette.primary.main}30`,
              }}
            >
              <PersonAddIcon sx={{ fontSize: 24, color: theme.palette.primary.main, mb: 0.5 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1, fontFamily: theme.typography.fontFamily }}>
              Join Cook-N-Crop Today!
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily }}>
              {/* Added fontFamily to Typography */}
              Discover fresh ingredients and inspiring recipes from our community!
            </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseAccountNotFoundPopup}
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  fontFamily: theme.typography.fontFamily,
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                },
              }}
            >
              Try Again
            </Button>
            <Button
              onClick={() => {
                handleCloseAccountNotFoundPopup();
                setSigningIn(false);
              }}
              variant="contained"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 16px ${theme.palette.primary.main}40`,
                "&:hover": {
                  fontFamily: theme.typography.fontFamily,
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                },
              }}
            >
              Create Account
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showIncorrectPasswordPopup}
          onClose={handleDialogClose}
          maxWidth="xs"
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              background: `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "rgba(0, 32, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"} 0%, ${theme.palette.mode === "dark" ? "rgba(0, 32, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"} 100%)`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              position: "relative",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <IconButton
            onClick={handleCloseIncorrectPasswordPopup}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 1,
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: theme.palette.warning.main,
                  mx: "auto",
                  boxShadow: `0 4px 16px ${theme.palette.warning.main}40`,
                }}
              >
                <WarningIcon sx={{ fontSize: 24, color: "white" }} />
              </Avatar>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
              Incorrect Password
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, lineHeight: 1.4, fontFamily: theme.typography.fontFamily }}>
              The password you entered is incorrect. Please try again.
              <br />
              If you forgot your password, use the Forgot password option.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseIncorrectPasswordPopup}
              variant="outlined"
              sx={{
                borderColor: theme.palette.text.secondary,
                color: theme.palette.text.secondary,
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  fontFamily: theme.typography.fontFamily,
                  borderColor: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                },
              }}
            >
              Try Again
            </Button>
            <Button
              onClick={() => {
                handleCloseIncorrectPasswordPopup();
                // Optionally pre-focus the password field by toggling state
              }}
              variant="contained"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 16px ${theme.palette.primary.main}40`,
                "&:hover": {
                  fontFamily: theme.typography.fontFamily,
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                },
              }}
            >
              Back to Sign In
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ 
            zIndex: 9999,
            width: "100%",
            maxWidth: 600,
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 20,
            "& .MuiAlert-root": {
              width: "100%",
              justifyContent: "center",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ 
              width: "100%", 
              fontFamily: theme.typography.fontFamily,
              fontWeight: "bold",
              fontSize: "0.9rem"
            }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </C.Container>
    </Box>
  );
}
