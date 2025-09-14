import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme, alpha, Avatar, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import adminService from '../../services/adminService';

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const theme = useTheme();

  const fetchActivity = useCallback(async () => {
    try {
      const res = await adminService.getRecentActivity();
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch recent activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    if (socket) {
      socket.on('new_activity', (newActivity) => {
        setActivities(prev => [newActivity, ...prev].slice(0, 15)); // Add to top and keep list size manageable
      });
      return () => socket.off('new_activity');
    }
  }, [socket]);

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <PeopleIcon sx={{ color: theme.palette.primary.main }} />;
      case 'order': return <ShoppingCartIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'post': return <PostAddIcon sx={{ color: theme.palette.success.main }} />;
      default: return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Recent Activity</Typography>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box> : (
        <Stack spacing={2.5} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {activities.map(activity => (
            <Box key={`${activity.type}-${activity.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha(getIcon(activity.type)?.props.sx.color || theme.palette.grey[500], 0.1) }}>
                {getIcon(activity.type)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{activity.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3, borderLeft: `4px solid ${color}` }}>
    <Box sx={{
      mr: 2,
      p: 1.5,
      borderRadius: '50%',
      color: color,
      backgroundColor: alpha(color, 0.1),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      <Typography color="text.secondary" sx={{ fontFamily: 'inherit' }}>{title}</Typography>
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
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={<PeopleIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total Revenue" value={`$${stats?.totalRevenue?.toFixed(0) ?? '...'}`} icon={<MonetizationOnIcon />} color={theme.palette.info.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total Products" value={stats?.totalProducts ?? '...'} icon={<InventoryIcon />} color={theme.palette.secondary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total Posts" value={stats?.totalPosts ?? '...'} icon={<PostAddIcon />} color={theme.palette.success.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total Orders" value={stats?.totalOrders ?? '...'} icon={<ShoppingCartIcon />} color={theme.palette.warning.main} />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Sales Data (Last 30 Days)</Typography>
            <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats?.salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} />
              <YAxis tickFormatter={(val) => `$${val}`} allowDecimals={false} />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Sales" stroke={theme.palette.secondary.main} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>User Roles</Typography>
            <Box sx={{ height: 300 }}>
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

        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Top 5 Selling Products</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topSellingProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
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
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Top 5 Customers by Spending</Typography>
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
                      <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>#{index + 1}</TableCell>
                      <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>{customer.username}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: theme.typography.fontFamily }}>{customer.orderCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>${customer.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <RecentActivityFeed />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>New User Signups (Last 7 Days)</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats?.userSignups}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
      </Grid>
    </Box>
  );
};

export default AdminOverview;
