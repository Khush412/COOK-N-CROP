import React, { useState, useEffect } from "react";
import * as C from "./AuthStyles";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaTwitter } from "react-icons/fa";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/my-resumes");
    }
  }, [isAuthenticated, loading, navigate]);

  // Only clear errors when switching mode, don't clear popup state here
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [signingIn, clearError]);

  // Prevent reload from anchor elements for forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Forgot password flow not implemented yet");
  };

  const handleSignIn = async (e) => {
    e.preventDefault(); // MUST be first to stop reload
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      console.log('Login result:', result); // Debug log
      if (!result.success) {
        const { status, code } = result;
        console.log('Error details:', { status, code, message: result.message }); // Debug log

        if (status === 404 || code === 'USER_NOT_FOUND') {
          console.log('Showing Account Not Found popup'); // Debug log
          setShowAccountNotFoundPopup(true);
          setLocalError(null);
        } else if (status === 401) {
          const msg = (result.message || '').toLowerCase();
          if (code === 'INCORRECT_PASSWORD' || msg.includes('incorrect password')) {
            console.log('Showing Incorrect Password popup'); // Debug log
            setShowIncorrectPasswordPopup(true);
            setLocalError(null);
          } else {
            // Fallback: treat generic 401 as user not found to avoid always showing incorrect password
            console.log('Showing Account Not Found popup (fallback)'); // Debug log
            setShowAccountNotFoundPopup(true);
            setLocalError(null);
          }
        } else {
          console.log('Showing generic error:', result.message); // Debug log
          setLocalError(result.message);
        }
      }
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // MUST be first to stop reload
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    if (!username || !email || !password) {
      setLocalError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register({ username, email, password });
      if (!result.success) {
        setLocalError(result.message);
      }
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/api/auth/google`;
  };

  const handleGitHubSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/api/auth/github`;
  };

  const handleTwitterSignIn = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/api/auth/twitter`;
  };

  // Prevent closing the popup by clicking outside or pressing ESC
  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setShowAccountNotFoundPopup(false);
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
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 6,
      }}
    >
      <C.Container>
        {(error || localError) && (
          <Box sx={{ color: "error.main", mb: 2, textAlign: "center", fontWeight: "bold" }}>
            {error || localError}
          </Box>
        )}

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
                <IconButton onClick={handleTwitterSignIn} aria-label="Sign up with Twitter">
                  <FaTwitter size={32} color="#1DA1F2" />
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
              as="button"
              type="button"
              onClick={handleForgotPassword}
              style={{
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
                <IconButton onClick={handleTwitterSignIn} aria-label="Sign in with Twitter">
                  <FaTwitter size={32} color="#1DA1F2" />
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
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              position: "relative",
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Account Not Found
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, lineHeight: 1.4 }}>
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
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
              Join ResuMate Today!
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Create professional resumes in minutes with our easy-to-use builder
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
          onClose={(e, r) => {
            if (r === 'backdropClick' || r === 'escapeKeyDown') return;
            handleCloseIncorrectPasswordPopup();
          }}
          maxWidth="xs"
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              position: "relative",
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Incorrect Password
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, lineHeight: 1.4 }}>
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
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                },
              }}
            >
              Back to Sign In
            </Button>
          </DialogActions>
        </Dialog>
      </C.Container>
    </Box>
  );
}
