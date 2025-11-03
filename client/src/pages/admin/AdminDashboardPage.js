import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper, Drawer, IconButton, useMediaQuery, Stack, Collapse, alpha } from '@mui/material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useSocket } from '../../contexts/SocketContext';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DiscountIcon from '@mui/icons-material/Discount';
import WarningIcon from '@mui/icons-material/Warning';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const adminNavItems = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { text: 'Users', path: '/admin/users', icon: <PeopleIcon />, category: 'management' },
  { text: 'Products', path: '/admin/products', icon: <InventoryIcon />, category: 'management' },
  { text: 'Low Stock', path: '/admin/products/low-stock', icon: <WarningIcon />, category: 'management' },
  { text: 'Orders', path: '/admin/orders', icon: <ReceiptLongIcon />, category: 'management' },
  { text: 'Support Tickets', path: '/admin/support', icon: <SupportAgentIcon />, category: 'management' },
  { text: 'Create Order', path: '/admin/orders/create', icon: <AddShoppingCartIcon />, category: 'actions' },
  { text: 'Coupons', path: '/admin/coupons', icon: <DiscountIcon />, category: 'actions' },
  { text: 'Reports', path: '/admin/reports', icon: <ReportIcon />, category: 'analytics' },
  { text: 'Broadcast', path: '/admin/broadcast', icon: <CampaignIcon />, category: 'communications' },
];

const AdminDashboardPage = () => {
  const socket = useSocket();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);
  const [communicationsOpen, setCommunicationsOpen] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.emit('join_admin_room');
    }
  }, [socket]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Group nav items by category
  const groupedNavItems = adminNavItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
          Admin Panel
        </Typography>
        {!isMobile && (
          <IconButton onClick={toggleSidebar} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List component="nav" disablePadding>
        {/* Management Section */}
        <ListItemButton 
          onClick={() => setManagementOpen(!managementOpen)}
          sx={{ 
            borderRadius: 2, 
            mb: 1,
            backgroundColor: managementOpen ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <ListItemIcon>
            <InventoryIcon sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText 
            primary="Management" 
            primaryTypographyProps={{ fontWeight: 700, color: 'primary.main' }} 
          />
          {managementOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={managementOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {groupedNavItems.management?.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    pl: 4,
                    py: 1,
                    '&.active': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'inherit', variant: 'body2' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Actions Section */}
        <ListItemButton 
          onClick={() => setActionsOpen(!actionsOpen)}
          sx={{ 
            borderRadius: 2, 
            mb: 1,
            backgroundColor: actionsOpen ? alpha(theme.palette.info.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.1),
            }
          }}
        >
          <ListItemIcon>
            <AddShoppingCartIcon sx={{ color: theme.palette.info.main }} />
          </ListItemIcon>
          <ListItemText 
            primary="Actions" 
            primaryTypographyProps={{ fontWeight: 700, color: 'info.main' }} 
          />
          {actionsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={actionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {groupedNavItems.actions?.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    pl: 4,
                    py: 1,
                    '&.active': {
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontWeight: 'bold',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.info.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'inherit', variant: 'body2' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Analytics Section */}
        <ListItemButton 
          onClick={() => setAnalyticsOpen(!analyticsOpen)}
          sx={{ 
            borderRadius: 2, 
            mb: 1,
            backgroundColor: analyticsOpen ? alpha(theme.palette.success.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.success.main, 0.1),
            }
          }}
        >
          <ListItemIcon>
            <ReportIcon sx={{ color: theme.palette.success.main }} />
          </ListItemIcon>
          <ListItemText 
            primary="Analytics" 
            primaryTypographyProps={{ fontWeight: 700, color: 'success.main' }} 
          />
          {analyticsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {groupedNavItems.analytics?.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    pl: 4,
                    py: 1,
                    '&.active': {
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 'bold',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.success.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'inherit', variant: 'body2' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Communications Section */}
        <ListItemButton 
          onClick={() => setCommunicationsOpen(!communicationsOpen)}
          sx={{ 
            borderRadius: 2, 
            mb: 1,
            backgroundColor: communicationsOpen ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
            }
          }}
        >
          <ListItemIcon>
            <CampaignIcon sx={{ color: theme.palette.warning.main }} />
          </ListItemIcon>
          <ListItemText 
            primary="Communications" 
            primaryTypographyProps={{ fontWeight: 700, color: 'warning.main' }} 
          />
          {communicationsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={communicationsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {groupedNavItems.communications?.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    pl: 4,
                    py: 1,
                    '&.active': {
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      fontWeight: 'bold',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.warning.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.warning.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'inherit', variant: 'body2' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Dashboard (standalone) */}
        {groupedNavItems.other?.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === '/admin'}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&.active': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'inherit' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      pt: 8,
      overflowX: 'hidden',
    }}>
      {/* Left sidebar toggle button */}
      {!sidebarOpen && !isMobile && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1200,
            width: 24,
            height: 24,
            minHeight: 0,
            minWidth: 0,
            p: 0,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '50%',
            boxShadow: 2,
            '&:hover': {
              bgcolor: theme.palette.background.paper,
              boxShadow: 4,
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* Left sidebar */}
      {sidebarOpen && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            top: 64,
            left: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 1100,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'transparent',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
            },
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: sidebarOpen ? '280px' : 0,
          pl: sidebarOpen ? 0 : 2,
          pt: 2,
          pb: 4,
          transition: 'margin 0.3s ease',
          overflowX: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', lg: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 280,
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.default,
              },
            }}
          >
            {drawerContent}
          </Drawer>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;