import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Avatar, 
  Divider, 
  ListItemIcon, 
  ListItemText, 
  Tooltip, 
  useTheme, 
  useMediaQuery, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  Chip,
  alpha,
  styled,
  Snackbar,
  Alert,
  Fade
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Person as PersonIcon, 
  ShoppingCart as ShoppingCartIcon, 
  ReceiptLong as ReceiptLongIcon,
  Home as HomeIcon,
  Mail as MailIcon,
  Favorite as FavoriteIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  Logout as LogoutIcon,
  Palette as PaletteIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Settings as SettingsIcon,
  Apps as AppsIcon,
  Close as CloseIcon,
  SupportAgent as SupportAgentIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Notifications as NotificationsIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import ThemeCustomizer from "./ThemeCustomizer";
import NotificationsMenu from "./NotificationsMenu";
import notificationService from "../services/notificationService";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import EnhancedGlobalSearch from './EnhancedGlobalSearch';

// Navigation link styles adjusted for reduced padding except first nav item
const NavLink = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.secondary.main : theme.palette.common.white,
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.07em",
  fontFamily: theme.typography.fontFamily,
  paddingBottom: 5,
  position: "relative",
  textTransform: "uppercase",
  background: "none",
  minWidth: 70,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  transition: "color 0.3s ease",
  borderBottom: active ? `2px solid ${theme.palette.secondary.main}` : "2px solid transparent",
  "&:hover, &:focus": {
    color: theme.palette.secondary.main,
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    background: "none",
    outlineOffset: 2,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 3,
  },
}));

const SiteName = styled(Typography)(({ theme }) => ({
  fontFamily: "'Cinzel', serif",
  color: theme.palette.common.white,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textDecoration: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
  fontSize: "1.5rem",
  textTransform: "uppercase",
  cursor: "pointer",
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    paddingRight: theme.spacing(6),
  }
}));

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  cursor: "pointer",
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  transition: "background-color 0.3s",
  "&:hover, &:focus-visible": {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
    outline: "none",
  },
}));

const DropdownArrow = styled(ArrowDropDownIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: 26,
  userSelect: "none",
  pointerEvents: "none",
}));

const BaseMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 16,
    minWidth: 250,
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: "blur(12px)",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 10px, rgba(0,0,0,0.12) 0px 0px 5px",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.text.primary,
  },
  "& .MuiMenu-list": {
    paddingTop: 0,
    paddingBottom: 0,
  },
  "& .MuiMenuItem-root": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.primary,
  },
  "& .MuiPaper-root::before": {
    content: '""',
    position: "absolute",
    top: 10,
    right: 28,
    width: 14,
    height: 14,
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: "blur(12px)",
    transform: "rotate(45deg)",
    boxShadow: "rgba(0, 0, 0, 0.1) -1px -1px 2px, rgba(0, 0, 0, 0.05) 1px 1px 1px",
    borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    zIndex: 0,
  },
}));

const StyledMenu = forwardRef((props, ref) => {
  return (
    <BaseMenu
      elevation={0}
      ref={ref}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionComponent={Fade}
      {...props}
    />
  );
});

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(3),
  width: 'auto',
  [theme.breakpoints.up('sm')]: {
    width: '300px',
  },
}));

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, unreadMessageCount, fetchUnreadMessageCount } = useAuth();
  const { cart } = useCart();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const socket = useSocket();
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [hasShadow, setHasShadow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [showChatbot, setShowChatbot] = useState(() => localStorage.getItem('showChatbot') !== 'false');
  const [showMobileDock, setShowMobileDock] = useState(() => {
    const saved = localStorage.getItem('showMobileDock');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleChatbot = () => {
    const newValue = !showChatbot;
    setShowChatbot(newValue);
    localStorage.setItem('showChatbot', String(newValue));
    window.dispatchEvent(new CustomEvent('chatbot-toggle', { detail: { visible: newValue } }));
  };

  const handleToggleMobileDock = () => {
    const newValue = !showMobileDock;
    setShowMobileDock(newValue);
    localStorage.setItem('showMobileDock', String(newValue));
    // Dispatch a custom event to notify other components of the change
    window.dispatchEvent(new CustomEvent('mobiledock-toggle', { detail: { visible: newValue } }));
  };

  useEffect(() => {
    const onScroll = () => setHasShadow(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnreadMessageCount();
  }, [fetchUnreadMessageCount]);

  useEffect(() => {
    if (socket) {
      socket.on("new_notification", (newNotification) => {
        showSnackbar(`New notification from ${newNotification.sender.username}`, "info");
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      socket.on("broadcast_received", (data) => {
        showSnackbar(data.message, "success");
        fetchNotifications();
      });

      socket.on("new_private_message", (message) => {
        showSnackbar(`New message from ${message.sender.username}`, "info");
        fetchUnreadMessageCount();
      });

      return () => {
        socket.off("new_notification");
        socket.off("broadcast_received");
        socket.off("new_private_message");
      };
    }
  }, [socket, showSnackbar, fetchNotifications, fetchUnreadMessageCount]);

  // Handle profile menu open/close
  const handleOpenUserMenu = (event) => {
    // Only open the mobile menu on mobile devices
    if (window.innerWidth < 600) {
      setAnchorElUser(event.currentTarget);
    } else {
      // Keep existing behavior for desktop
      setAnchorElUser(event.currentTarget);
    }
  };

  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate("/");
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate("/profile");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerNavigate = (path) => {
    navigate(path);
    handleDrawerToggle();
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSuggestionSelect = () => {
    setSearchQuery('');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Community', path: '/community' },
    { label: "Store", path: '/CropCorner' },
    { label: 'My Feed', path: '/feed' }, // Added back My Feed to main navbar
  ];

  const userDrawerLinks = [
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'My Orders', path: '/profile/orders', icon: <ReceiptLongIcon /> },
    { label: 'Saved Addresses', path: '/profile/addresses', icon: <HomeIcon /> },
    { label: 'Messages', path: '/messages', icon: <Badge badgeContent={unreadMessageCount} color="secondary"><MailIcon /></Badge> },
    { label: 'My Wishlist', path: '/profile/wishlist', icon: <FavoriteIcon /> },
    { label: 'My Collections', path: '/profile/collections', icon: <CollectionsBookmarkIcon /> },
    { label: 'Saved Posts', path: '/profile/saved-posts', icon: <BookmarkIcon /> },
    { label: 'My Support Tickets', path: '/profile/support-tickets', icon: <SupportAgentIcon /> },
    { label: 'My Activity', path: '/profile/my-activity', icon: <HistoryIcon /> },
    { label: 'Blocked Users', path: '/profile/blocked-users', icon: <BlockIcon /> },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold', textAlign: 'center', fontFamily: theme.typography.fontFamily }}>
        Cook'n'Crop
      </Typography>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigate(item.path)}>
                <ListItemText primary={item.label} sx={{ textAlign: 'center' }} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleDrawerNavigate('/cart')}>
              <ListItemIcon><ShoppingCartIcon sx={{ color: theme.palette.text.secondary }} /></ListItemIcon>
              <ListItemText primary="Shopping Cart" primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { handleDrawerToggle(); setThemeDialogOpen(true); }}>
              <ListItemIcon><PaletteIcon sx={{ color: theme.palette.text.secondary }} /></ListItemIcon>
              <ListItemText primary="Customize Theme" primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
            </ListItemButton>
          </ListItem>
        </List>

        {isAuthenticated ? (
          <>
            <Divider><Typography variant="overline" sx={{ fontFamily: theme.typography.fontFamily }}>My Account</Typography></Divider>
            <List>
              {userDrawerLinks.map(item => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton onClick={() => handleDrawerNavigate(item.path)}>
                    <ListItemIcon sx={{ color: theme.palette.text.secondary }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                  </ListItemButton>
                </ListItem>
              ))}
              {user?.role === 'admin' && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleDrawerNavigate('/admin')}>
                    <ListItemIcon sx={{ color: theme.palette.text.secondary }}><AdminPanelSettingsIcon /></ListItemIcon>
                    <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </>
        ) : null}
      </Box>

      <Divider />
      <List>
        {isAuthenticated ? (
          <ListItem disablePadding>
            <ListItemButton onClick={() => {
              handleDrawerToggle();
              // Use a slight delay to allow drawer to close before navigating
              setTimeout(() => {
                logout();
                navigate('/');
              }, 300);
            }}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: 'error.main' }} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }} />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleDrawerNavigate('/login')} sx={{ py: 1.5 }}>
              <ListItemText primary="Login / Sign Up" sx={{ textAlign: 'center' }} primaryTypographyProps={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  // Calculate total items in cart
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <>
      <AppBar
        position="fixed"
        color="primary"
        sx={{
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.primary.main,
          boxShadow: hasShadow ? "0 3px 12px rgba(0,0,0,0.35)" : "none",
          transition: "box-shadow 0.3s ease",
          width: "100%",
          left: 0,
          top: 0,
        }}
        elevation={hasShadow ? 6 : 0}
      >
        <Toolbar
          sx={{
            px: 2,
            maxWidth: 1500,
            margin: "auto",
            width: "100%",
            alignItems: "center",
            display: "flex",
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 1, sm: 2 }, display: { xs: 'block', lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <SiteName
              component={RouterLink}
              to="/"
              tabIndex={0}
              aria-label="Go to homepage"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.5rem' }, // Smaller logo on mobile
              }}
            >
              Cook’n’Crop
            </SiteName>
          </Box>

          <Box
            component="nav"
            aria-label="main navigation"
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: 2,
              mx: 'auto',
            }}
          >
            {navItems.map((item) => (
              <NavLink key={item.label} component={RouterLink} to={item.path} active={isActive(item.path) ? 1 : 0}>
                {item.label}
              </NavLink>
            ))}
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right Section - Desktop */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: { sm: 1 } }}>
            {/* Desktop Search Bar */}
            <EnhancedGlobalSearch />
            {/* Cart Button */}
            <Tooltip title="Shopping Cart" arrow>
              <IconButton
                size="large"
                component={RouterLink}
                to="/cart"
                sx={{
                  color: theme.palette.common.white,
                  "&:hover": {
                    color: theme.palette.secondary.main,
                    backgroundColor: "transparent",
                  },
                  transition: "color 0.25s ease",
                }}
                aria-label="shopping cart"
              >
                <Badge badgeContent={cartItemCount > 0 ? cartItemCount : null} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Theme Button */}
            <Tooltip title="Customize theme" arrow>
              <IconButton
                size="large"
                sx={{
                  color: theme.palette.common.white,
                  "&:hover": {
                    color: theme.palette.secondary.main,
                    backgroundColor: "transparent",
                  },
                  transition: "color 0.25s ease",
                }}
                onClick={() => setThemeDialogOpen(true)}
                aria-label="open theme customizer"
              >
                <PaletteIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications Button */}
            {isAuthenticated && (
              <Tooltip title="Notifications" arrow>
                <IconButton
                  size="large"
                  onClick={handleOpenNotificationsMenu}
                  sx={{
                    color: theme.palette.common.white,
                    "&:hover": {
                      color: theme.palette.secondary.main,
                      backgroundColor: "transparent",
                    },
                    transition: "color 0.25s ease",
                  }}
                  aria-label="notifications"
                >
                  <Badge badgeContent={unreadCount} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* User Profile or Login Button */}
            {isAuthenticated ? (
              <>
                <ProfileContainer
                  aria-controls={anchorElUser ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={anchorElUser ? "true" : undefined}
                  onClick={handleOpenUserMenu}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenUserMenu(e);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="User account menu"
                >
                  <Avatar
                    src={user?.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user?.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined}
                    alt={user?.username || "User"}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                      fontSize: 14,
                      fontFamily: theme.typography.fontFamily,
                      userSelect: "none",
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <DropdownArrow />
                </ProfileContainer>

                <StyledMenu
                  id="user-menu"
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser) && window.innerWidth >= 600}
                  disableScrollLock={true}
                  onClose={handleCloseUserMenu}
                  MenuListProps={{
                    "aria-labelledby": "user-menu-button",
                    role: "menu",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700, mb: 0.5 }}
                    >
                      {user?.username || "User"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ fontFamily: theme.typography.fontFamily }}
                    >
                      {user?.email || ""}
                    </Typography>
                  </Box>

                  <MenuItem onClick={handleProfile} sx={{ borderRadius: 2, px: 3 }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/orders");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <ReceiptLongIcon fontSize="small" />
                    </ListItemIcon>
                    My Orders
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/collections");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <CollectionsBookmarkIcon fontSize="small" />
                    </ListItemIcon>
                    My Collections
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/addresses");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <HomeIcon fontSize="small" />
                    </ListItemIcon>
                    Saved Addresses
                  </MenuItem>


                  {user?.role === "admin" && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate("/admin");
                      }}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      <ListItemIcon>
                        <AdminPanelSettingsIcon fontSize="small" />
                      </ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/saved-posts");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <BookmarkIcon fontSize="small" />
                    </ListItemIcon>
                    Saved Posts
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/messages");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={unreadMessageCount} color="secondary">
                        <MailIcon fontSize="small" />
                      </Badge>
                    </ListItemIcon>
                    Messages
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/my-activity");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    My Activity
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/blocked-users");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <BlockIcon fontSize="small" />
                    </ListItemIcon>
                    Blocked Users
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/wishlist");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <FavoriteIcon fontSize="small" />
                    </ListItemIcon>
                    My Wishlist
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/support-tickets");
                    }}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <SupportAgentIcon fontSize="small" />
                    </ListItemIcon>
                    My Support Tickets
                  </MenuItem>
                  <MenuItem
                    onClick={handleToggleChatbot}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    <ListItemIcon>
                      <SmartToyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Show Chatbot"
                      primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                    />
                    <Switch
                      checked={showChatbot}
                      edge="end"
                      readOnly
                      inputProps={{ 'aria-label': 'toggle chatbot visibility' }}
                    />
                  </MenuItem>

                  <Divider sx={{ my: 1 }} />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ borderRadius: 2, color: "error.main", px: 3 }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </StyledMenu>
              </>
            ) : (
              <Button
                variant="outlined"
                component={RouterLink}
                to="/login"
                sx={{
                  ml: 3,
                  borderColor: theme.palette.common.white,
                  color: theme.palette.common.white,
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 2,
                  px: 2,
                  py: 0.8,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.secondary.main,
                    boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 4,
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>

          {/* Right Section - Mobile */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
            {/* Mobile Notifications Icon */}
            {isAuthenticated && (
              <IconButton
                size="small"
                onClick={handleOpenNotificationsMenu}
                sx={{ color: theme.palette.common.white }}
                aria-label="notifications"
              >
                <Badge badgeContent={unreadCount} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            {/* Mobile Profile Icon with Avatar */}
            {isAuthenticated ? (
              <>
                <IconButton
                  size="small"
                  aria-controls={anchorElUser ? "mobile-user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={anchorElUser ? "true" : undefined}
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0.5 }}
                  aria-label="User account menu"
                >
                  <Avatar
                    src={user?.profilePic && user.profilePic.startsWith('http') ? user.profilePic : user?.profilePic ? `${process.env.REACT_APP_API_URL}${user.profilePic}` : undefined}
                    alt={user?.username || "User"}
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: '14px',
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </IconButton>

                <Menu
                  id="mobile-user-menu"
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser) && window.innerWidth < 600}
                  onClose={handleCloseUserMenu}
                  disableScrollLock={true}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 180,
                    }
                  }}
                >
                  <MenuItem onClick={handleProfile} sx={{ borderRadius: 1, px: 2 }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/messages");
                    }}
                    sx={{ borderRadius: 1, px: 2 }}
                  >
                    <ListItemIcon>
                      <MailIcon fontSize="small" />
                    </ListItemIcon>
                    Messages
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/orders");
                    }}
                    sx={{ borderRadius: 1, px: 2 }}
                  >
                    <ListItemIcon>
                      <ReceiptLongIcon fontSize="small" />
                    </ListItemIcon>
                    My Orders
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/profile/collections");
                    }}
                    sx={{ borderRadius: 1, px: 2 }}
                  >
                    <ListItemIcon>
                      <CollectionsBookmarkIcon fontSize="small" />
                    </ListItemIcon>
                    My Collections
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      handleToggleMobileDock();
                    }}
                    sx={{ 
                      borderRadius: 1, 
                      px: 2,
                      minHeight: '36px'
                    }}
                  >
                    <ListItemIcon>
                      <AppsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mobile Dock"
                      primaryTypographyProps={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: '0.875rem'
                      }}
                    />
                    <Switch
                      checked={showMobileDock}
                      edge="end"
                      readOnly
                      size="small"
                      inputProps={{ 'aria-label': 'toggle mobile dock visibility' }}
                    />
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ borderRadius: 1, color: "error.main", px: 2 }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                size="small"
                component={RouterLink}
                to="/login"
                sx={{ color: theme.palette.common.white }}
                aria-label="login"
              >
                <PersonIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: 'background.default' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Theme Customizer Dialog */}
      <Dialog
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock={true}
        aria-labelledby="theme-dialog-title"
         PaperProps={{ sx: { borderRadius: 3, p: 2, fontFamily: theme.typography.fontFamily } }}
      >
         <DialogTitle id="theme-dialog-title" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
          Customize Theme
        </DialogTitle>
        <ThemeCustomizer />
      </Dialog>

      <NotificationsMenu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        handleClose={handleCloseNotificationsMenu}
        notifications={notifications}
        onMarkRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllAsRead}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%", fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
