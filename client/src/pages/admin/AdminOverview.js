import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme, alpha, Avatar, Stack, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
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
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Recent Activity</Typography>
        <Chip label={activities.length} color="primary" size="small" />
      </Box>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress size={32} /></Box> : (
        <Stack spacing={2.5} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {activities.map(activity => (
            <Box key={`${activity.type}-${activity.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.05) } }}>
              <Avatar sx={{ bgcolor: alpha(getIcon(activity.type)?.props.sx.color || theme.palette.grey[500], 0.1), width: 40, height: 40 }}>
                {getIcon(activity.type)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 500 }}>{activity.title}</Typography>
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

const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center', 
        borderRadius: 3, 
        border: `1px solid ${theme.palette.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: alpha(color, 0.3)
        } : {},
        height: '100%'
      }}
      onClick={onClick}
    >
      <Box sx={{
        mr: 2,
        p: 1.5,
        borderRadius: '50%',
        color: color,
        backgroundColor: alpha(color, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
        minHeight: 50
      }}>
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>{value}</Typography>
        <Typography color="text.secondary" sx={{ fontFamily: 'inherit', fontSize: '0.875rem', mb: 1 }}>{title}</Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const AdminOverview = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Add CSS keyframes for spin animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <CircularProgress size={60} />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Welcome back! Here's what's happening with your store today.
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchStats} 
            disabled={refreshing}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              width: 40,
              height: 40
            }}
          >
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Actions Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
            Quick Actions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products')}
            size="medium"
            sx={{ borderRadius: 2, px: 2 }}
          >
            Add Product
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/orders/create')}
            size="medium"
            sx={{ borderRadius: 2, px: 2 }}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<WarningIcon />}
            onClick={() => navigate('/admin/products/low-stock')}
            size="medium"
            sx={{ borderRadius: 2, px: 2 }}
          >
            Low Stock
          </Button>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/admin/users')}
            size="medium"
            sx={{ borderRadius: 2, px: 2 }}
          >
            Manage Users
          </Button>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers ?? '...'} 
            icon={<PeopleIcon />} 
            color={theme.palette.primary.main}
            trend={stats?.usersTrend > 0 ? 'up' : stats?.usersTrend < 0 ? 'down' : null}
            trendValue={stats?.usersTrend ? `${Math.abs(stats.usersTrend)}% this month` : null}
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard 
            title="Total Revenue" 
            value={`$${stats?.totalRevenue?.toFixed(0) ?? '...'}`} 
            icon={<MonetizationOnIcon />} 
            color={theme.palette.info.main}
            trend={stats?.revenueTrend > 0 ? 'up' : stats?.revenueTrend < 0 ? 'down' : null}
            trendValue={stats?.revenueTrend ? `${Math.abs(stats.revenueTrend)}% this month` : null}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard 
            title="Total Products" 
            value={stats?.totalProducts ?? '...'} 
            icon={<InventoryIcon />} 
            color={theme.palette.secondary.main}
            onClick={() => navigate('/admin/products')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard 
            title="Total Posts" 
            value={stats?.totalPosts ?? '...'} 
            icon={<PostAddIcon />} 
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard 
            title="Total Orders" 
            value={stats?.totalOrders ?? '...'} 
            icon={<ShoppingCartIcon />} 
            color={theme.palette.warning.main}
            trend={stats?.ordersTrend > 0 ? 'up' : stats?.ordersTrend < 0 ? 'down' : null}
            trendValue={stats?.ordersTrend ? `${Math.abs(stats.ordersTrend)}% this month` : null}
            onClick={() => navigate('/admin/orders')}
          />
        </Grid>
      </Grid>

      {/* Charts and Activity Feed */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Sales Data (Last 30 Days)</Typography>
              <Chip label="Last 30 Days" variant="outlined" size="small" />
            </Box>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats?.salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} stroke={alpha(theme.palette.text.primary, 0.6)} />
                  <YAxis tickFormatter={(val) => `$${val}`} allowDecimals={false} stroke={alpha(theme.palette.text.primary, 0.6)} />
                  <ChartTooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales" 
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <RecentActivityFeed />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Top 5 Selling Products</Typography>
              <Chip label="Top 5" variant="outlined" size="small" />
            </Box>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topSellingProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis type="number" allowDecimals={false} stroke={alpha(theme.palette.text.primary, 0.6)} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    interval={0} 
                    stroke={alpha(theme.palette.text.primary, 0.6)}
                  />
                  <ChartTooltip 
                    cursor={{ fill: alpha(theme.palette.secondary.main, 0.1) }} 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalQuantitySold" 
                    name="Units Sold" 
                    fill={theme.palette.success.main} 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>User Roles</Typography>
              <Chip label="Distribution" variant="outlined" size="small" />
            </Box>
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
                    labelLine={true}
                  >
                    {[theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]} 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
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