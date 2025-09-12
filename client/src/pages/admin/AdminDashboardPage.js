import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DiscountIcon from '@mui/icons-material/Discount';
import WarningIcon from '@mui/icons-material/Warning';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

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
  return (
    <Container maxWidth="xl" sx={{ mt: 12, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
      <Paper elevation={3} sx={{ width: 250, flexShrink: 0, position: 'sticky', top: 100 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>Admin Menu</Typography>
        <Divider />
        <List>
          {adminNavItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path === '/admin'}
                sx={{
                  '&.active': {
                    backgroundColor: 'action.selected',
                    fontWeight: 'bold',
                    borderRight: 3,
                    borderColor: 'primary.main'
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
