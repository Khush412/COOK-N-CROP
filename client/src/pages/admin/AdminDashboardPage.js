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
import GroupsIcon from '@mui/icons-material/Groups';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const adminNavItems = [
  { text: 'Users', path: '/admin/users', icon: <PeopleIcon />, category: 'management' },
  { text: 'Products', path: '/admin/products', icon: <InventoryIcon />, category: 'management' },
  { text: 'Low Stock', path: '/admin/products/low-stock', icon: <WarningIcon />, category: 'management' },
  { text: 'Orders', path: '/admin/orders', icon: <ReceiptLongIcon />, category: 'management' },
  { text: 'Support Tickets', path: '/admin/support', icon: <SupportAgentIcon />, category: 'management' },
  { text: 'Create Order', path: '/admin/orders/create', icon: <AddShoppingCartIcon />, category: 'actions' },
  { text: 'Coupons', path: '/admin/coupons', icon: <DiscountIcon />, category: 'actions' },
  { text: 'Reports', path: '/admin/reports', icon: <ReportIcon />, category: 'analytics' },
  { text: 'Broadcast', path: '/admin/broadcast', icon: <CampaignIcon />, category: 'communications' },
  { text: 'Auto-Join Groups', path: '/admin/auto-join-groups', icon: <GroupsIcon />, category: 'management' },
];

const AdminDashboardPage = () => {
  const socket = useSocket();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [communicationsOpen, setCommunicationsOpen] = useState(false);

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
        bgcolor: theme.palette.background.paper,
        p: 2,
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: sidebarOpen ? theme.shadows[2] : 'none',
        transition: 'box-shadow 0.3s ease',
        overflow: 'hidden', // Prevent visual glitches from overflow
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold', 
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.primary.main,
          transition: 'all 0.3s ease'
        }}>
          Admin Panel
        </Typography>
        {!isMobile && (
          <IconButton 
            onClick={toggleSidebar} 
            size="small"
            sx={{
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List component="nav" disablePadding sx={{ overflowY: 'auto', flex: 1, 
        // Invisible scrollbars
        '&::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
          background: 'transparent',
        },
        // For Firefox
        scrollbarWidth: 'none',
        // For IE/Edge
        '-ms-overflow-style': 'none',
      }}>
        {/* Dashboard - Always at the top and visible */}
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/admin"
            end
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
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }} />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Management Section */}
        <ListItemButton 
          onClick={() => setManagementOpen(!managementOpen)}
          sx={{ 
            borderRadius: 3, 
            mb: 1,
            backgroundColor: managementOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: managementOpen ? 'translateX(2px)' : 'none',
          }}
        >
          <ListItemIcon>
            <InventoryIcon sx={{ color: theme.palette.primary.main, transition: 'all 0.3s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Management" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'primary.main',
              transition: 'all 0.3s ease'
            }} 
          />
          {managementOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease' }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease' }} />}
        </ListItemButton>
        <Collapse in={managementOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ position: 'relative', zIndex: 1 }}>
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
            borderRadius: 3, 
            mb: 1,
            backgroundColor: actionsOpen ? alpha(theme.palette.info.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: actionsOpen ? 'translateX(2px)' : 'none',
          }}
        >
          <ListItemIcon>
            <AddShoppingCartIcon sx={{ color: theme.palette.info.main, transition: 'all 0.3s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Actions" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'info.main',
              transition: 'all 0.3s ease'
            }} 
          />
          {actionsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease' }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease' }} />}
        </ListItemButton>
        <Collapse in={actionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ position: 'relative', zIndex: 1 }}>
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
            borderRadius: 3, 
            mb: 1,
            backgroundColor: analyticsOpen ? alpha(theme.palette.success.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: analyticsOpen ? 'translateX(2px)' : 'none',
          }}
        >
          <ListItemIcon>
            <ReportIcon sx={{ color: theme.palette.success.main, transition: 'all 0.3s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Analytics" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'success.main',
              transition: 'all 0.3s ease'
            }} 
          />
          {analyticsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease' }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease' }} />}
        </ListItemButton>
        <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ position: 'relative', zIndex: 1 }}>
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
            borderRadius: 3, 
            mb: 1,
            backgroundColor: communicationsOpen ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: communicationsOpen ? 'translateX(2px)' : 'none',
          }}
        >
          <ListItemIcon>
            <CampaignIcon sx={{ color: theme.palette.warning.main, transition: 'all 0.3s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Communications" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'warning.main',
              transition: 'all 0.3s ease'
            }} 
          />
          {communicationsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease' }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease' }} />}
        </ListItemButton>
        <Collapse in={communicationsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ position: 'relative', zIndex: 1 }}>
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
      {/* Left sidebar toggle button - Visible only when sidebar is closed */}
      <IconButton
        onClick={isMobile ? handleDrawerToggle : toggleSidebar}
        sx={{
          position: 'fixed',
          left: 16,
          top: 80,
          zIndex: 1200,
          width: 40,
          height: 40,
          minHeight: 0,
          minWidth: 0,
          p: 0,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '50%',
          boxShadow: 4,
          '&:hover': {
            bgcolor: theme.palette.background.paper,
            boxShadow: 8,
            transform: 'scale(1.1)',
          },
          display: sidebarOpen ? 'none' : 'flex', // Show only when sidebar is closed
          transition: 'all 0.3s ease', // Smooth transition
          cursor: 'pointer',
          transform: 'rotate(0deg)',
          '& .hamburger-line': {
            transition: 'all 0.3s ease',
          }
        }}
      >
        <MenuIcon sx={{ fontSize: 24 }} />
      </IconButton>

      {/* Sidebar - Visible on all screens with mobile drawer for small screens */}
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
          zIndex: 1200,
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          display: { xs: 'none', md: sidebarOpen ? 'block' : 'none' }, // Control visibility based on state
          // Custom scrollbar styling - invisible scrollbars
          '&::-webkit-scrollbar': {
            width: '0px',
            background: 'transparent',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            background: 'transparent',
          },
          // For Firefox
          scrollbarWidth: 'none',
          // For IE/Edge
          '-ms-overflow-style': 'none',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth transition with custom easing
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', // Slide effect
          boxShadow: sidebarOpen ? theme.shadows[8] : 'none',
          contain: 'layout style paint', // Improve rendering performance and prevent visual glitches
        }}
      >
        {drawerContent}
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { xs: 0, md: sidebarOpen ? '280px' : 0 },
          pl: { xs: 0, md: sidebarOpen ? 0 : 2 },
          pt: 2,
          pb: 4,
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          overflowX: 'hidden',
          // Invisible scrollbars
          '&::-webkit-scrollbar': {
            width: '0px',
            background: 'transparent',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            background: 'transparent',
          },
          // For Firefox
          scrollbarWidth: 'none',
          // For IE/Edge
          '-ms-overflow-style': 'none',
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
              display: { xs: 'block', md: 'none' }, // Show on mobile, hide on desktop
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 280,
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[8],
                // Invisible scrollbars
                '&::-webkit-scrollbar': {
                  width: '0px',
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'transparent',
                  background: 'transparent',
                },
                // For Firefox
                scrollbarWidth: 'none',
                // For IE/Edge
                '-ms-overflow-style': 'none',
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