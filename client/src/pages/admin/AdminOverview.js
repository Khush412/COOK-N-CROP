import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import adminService from '../../services/adminService';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2 }}>
    <Box sx={{
      mr: 2,
      p: 1.5,
      borderRadius: '50%',
      color: 'white',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

const AdminOverview = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={<PeopleIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Products" value={stats?.totalProducts ?? '...'} icon={<InventoryIcon />} color={theme.palette.secondary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Posts" value={stats?.totalPosts ?? '...'} icon={<PostAddIcon />} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Orders" value={stats?.totalOrders ?? '...'} icon={<ShoppingCartIcon />} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          New User Signups (Last 7 Days)
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats?.userSignups}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="New Users" stroke={theme.palette.primary.main} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminOverview;
