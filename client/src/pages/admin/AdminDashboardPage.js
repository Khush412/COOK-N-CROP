import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper, Drawer, IconButton, useMediaQuery, Stack } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import { useSocket } from '../../contexts/SocketContext';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DiscountIcon from '@mui/icons-material/Discount';
import WarningIcon from '@mui/icons-material/Warning';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';

const adminNavItems = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { text: 'Manage Users', path: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Manage Products', path: '/admin/products', icon: <InventoryIcon /> },
  { text: 'Low Stock', path: '/admin/products/low-stock', icon: <WarningIcon /> },
  { text: 'Manage Orders', path: '/admin/orders', icon: <ReceiptLongIcon /> },
  { text: 'Create Order', path: '/admin/orders/create', icon: <AddShoppingCartIcon /> },
  { text: 'Manage Coupons', path: '/admin/coupons', icon: <DiscountIcon /> },
  { text: 'Reported Content', path: '/admin/reports', icon: <ReportIcon /> },
  { text: 'Broadcast', path: '/admin/broadcast', icon: <CampaignIcon /> },
];

const AdminDashboardPage = () => {
  const socket = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.emit('join_admin_room');
    }
  }, [socket]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Admin Menu</Typography>
      <Divider />
      <List>
        {adminNavItems.map((item) => (
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
    <Container maxWidth="xl" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily }}>
              Admin Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              Site management and overview.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Desktop Sidebar */}
        <Paper
          elevation={3}
          sx={{
            width: 280,
            flexShrink: 0,
            position: 'sticky',
            top: 100,
            display: { xs: 'none', lg: 'block' },
            borderRadius: 3,
            maxHeight: 'calc(100vh - 132px)', // 100px top offset + 32px container padding
            overflowY: 'auto',
          }}
        >
          {drawerContent}
        </Paper>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawerContent}
        </Drawer>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
