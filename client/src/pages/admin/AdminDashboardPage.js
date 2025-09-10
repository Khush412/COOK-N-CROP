import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';

const adminNavItems = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { text: 'Manage Users', path: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Manage Products', path: '/admin/products', icon: <InventoryIcon /> },
  { text: 'Reported Content', path: '/admin/reports', icon: <ReportIcon /> },
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
