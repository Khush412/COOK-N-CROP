import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={<PeopleIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Revenue" value={`$${stats?.totalRevenue?.toFixed(0) ?? '...'}`} icon={<MonetizationOnIcon />} color={theme.palette.info.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Products" value={stats?.totalProducts ?? '...'} icon={<InventoryIcon />} color={theme.palette.secondary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Posts" value={stats?.totalPosts ?? '...'} icon={<PostAddIcon />} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Orders" value={stats?.totalOrders ?? '...'} icon={<ShoppingCartIcon />} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Sales Data (Last 30 Days)
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats?.salesData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} />
              <YAxis tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Sales" stroke={theme.palette.secondary.main} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top 5 Selling Products
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topSellingProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} interval={0} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="totalQuantitySold" name="Units Sold" fill={theme.palette.success.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top 5 Customers by Spending
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.topCustomers?.map((customer, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>#{index + 1}</TableCell>
                      <TableCell>{customer.username}</TableCell>
                      <TableCell align="right">{customer.orderCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>${customer.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              User Roles
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.userRoleDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverview;
