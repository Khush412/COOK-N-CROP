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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        p: { xs: 1, sm: 2 },
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: sidebarOpen ? theme.shadows[2] : 'none',
        transition: 'box-shadow 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3 },
        pb: { xs: 1, sm: 2 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold', 
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.primary.main,
          transition: 'all 0.3s ease',
          fontSize: { xs: '1rem', sm: '1.25rem' }
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
              borderRadius: { xs: 1, sm: 2 },
              mx: { xs: 0.5, sm: 1 },
              my: { xs: 0.25, sm: 0.5 },
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
            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ 
                fontFamily: theme.typography.fontFamily, 
                fontWeight: 'bold',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }} 
            />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        
        {/* Management Section */}
        <ListItemButton 
          onClick={() => setManagementOpen(!managementOpen)}
          sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            mb: { xs: 0.5, sm: 1 },
            backgroundColor: managementOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: managementOpen ? 'translateX(2px)' : 'none',
            px: { xs: 1, sm: 2 }
          }}
        >
          <ListItemIcon>
            <InventoryIcon sx={{ color: theme.palette.primary.main, transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />
          </ListItemIcon>
          <ListItemText 
            primary="Management" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'primary.main',
              transition: 'all 0.3s ease',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }} 
          />
          {managementOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />}
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
                    borderRadius: { xs: 1, sm: 2 },
                    mx: { xs: 0.5, sm: 1 },
                    my: { xs: 0.25, sm: 0.5 },
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
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
                  <ListItemIcon sx={{ minWidth: { xs: 28, sm: 32 } }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'inherit', 
                      variant: 'body2',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Actions Section */}
        <ListItemButton 
          onClick={() => setActionsOpen(!actionsOpen)}
          sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            mb: { xs: 0.5, sm: 1 },
            backgroundColor: actionsOpen ? alpha(theme.palette.info.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: actionsOpen ? 'translateX(2px)' : 'none',
            px: { xs: 1, sm: 2 }
          }}
        >
          <ListItemIcon>
            <AddShoppingCartIcon sx={{ color: theme.palette.info.main, transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />
          </ListItemIcon>
          <ListItemText 
            primary="Actions" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'info.main',
              transition: 'all 0.3s ease',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }} 
          />
          {actionsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />}
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
                    borderRadius: { xs: 1, sm: 2 },
                    mx: { xs: 0.5, sm: 1 },
                    my: { xs: 0.25, sm: 0.5 },
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
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
                  <ListItemIcon sx={{ minWidth: { xs: 28, sm: 32 } }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'inherit', 
                      variant: 'body2',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Analytics Section */}
        <ListItemButton 
          onClick={() => setAnalyticsOpen(!analyticsOpen)}
          sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            mb: { xs: 0.5, sm: 1 },
            backgroundColor: analyticsOpen ? alpha(theme.palette.success.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: analyticsOpen ? 'translateX(2px)' : 'none',
            px: { xs: 1, sm: 2 }
          }}
        >
          <ListItemIcon>
            <ReportIcon sx={{ color: theme.palette.success.main, transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />
          </ListItemIcon>
          <ListItemText 
            primary="Analytics" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'success.main',
              transition: 'all 0.3s ease',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }} 
          />
          {analyticsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />}
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
                    borderRadius: { xs: 1, sm: 2 },
                    mx: { xs: 0.5, sm: 1 },
                    my: { xs: 0.25, sm: 0.5 },
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
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
                  <ListItemIcon sx={{ minWidth: { xs: 28, sm: 32 } }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'inherit', 
                      variant: 'body2',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Communications Section */}
        <ListItemButton 
          onClick={() => setCommunicationsOpen(!communicationsOpen)}
          sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            mb: { xs: 0.5, sm: 1 },
            backgroundColor: communicationsOpen ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.15),
              transform: 'translateX(4px)',
            },
            transition: 'all 0.3s ease',
            transform: communicationsOpen ? 'translateX(2px)' : 'none',
            px: { xs: 1, sm: 2 }
          }}
        >
          <ListItemIcon>
            <CampaignIcon sx={{ color: theme.palette.warning.main, transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />
          </ListItemIcon>
          <ListItemText 
            primary="Communications" 
            primaryTypographyProps={{ 
              fontWeight: 700, 
              color: 'warning.main',
              transition: 'all 0.3s ease',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }} 
          />
          {communicationsOpen ? <ExpandLess sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} /> : <ExpandMore sx={{ transition: 'all 0.3s ease', fontSize: { xs: 20, sm: 24 } }} />}
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
                    borderRadius: { xs: 1, sm: 2 },
                    mx: { xs: 0.5, sm: 1 },
                    my: { xs: 0.25, sm: 0.5 },
                    pl: { xs: 3, sm: 4 },
                    py: { xs: 0.75, sm: 1 },
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
                  <ListItemIcon sx={{ minWidth: { xs: 28, sm: 32 } }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'inherit', 
                      variant: 'body2',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }} 
                  />
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
      pt: { xs: 7, sm: 8 },
      overflowX: 'hidden',
    }}>
      {/* Left sidebar toggle button - Visible only when sidebar is closed */}
      <IconButton
        onClick={isMobile ? handleDrawerToggle : toggleSidebar}
        sx={{
          position: 'fixed',
          left: { xs: 8, sm: 16 },
          top: { xs: 72, sm: 80 },
          zIndex: 1200,
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
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
          display: { xs: 'flex', md: sidebarOpen ? 'none' : 'flex' },
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: 'rotate(0deg)',
          '& .hamburger-line': {
            transition: 'all 0.3s ease',
          }
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
      </IconButton>

      {/* Sidebar - Visible on all screens with mobile drawer for small screens */}
      <Box
        sx={{
          width: { xs: 240, sm: 280 },
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
          display: { xs: 'none', md: 'block' },
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: sidebarOpen ? theme.shadows[8] : 'none',
          contain: 'layout style paint',
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
          ml: { xs: 0, md: sidebarOpen ? { xs: '240px', sm: '240px', md: '280px' } : 0 },
          pl: { xs: 0, md: sidebarOpen ? 0 : { xs: 1, sm: 2 } },
          pt: { xs: 1, sm: 2 },
          pb: { xs: 2, sm: 4 },
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          overflowX: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, overflowX: 'hidden' }}>
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: { xs: 240, sm: 280 },
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[8],
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