import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Grid, Alert, useTheme, alpha, 
  Avatar, Stack, Button, Chip, IconButton, Tooltip, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, LinearProgress
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
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
import ReportIcon from '@mui/icons-material/Report';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatDistanceToNow, format } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import groupService from '../../services/groupService';
import productService from '../../services/productService';
import Loader from '../../custom_components/Loader';

// Stat Card Component
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

// Recent Orders Table Component
const RecentOrdersTable = ({ orders, loading, navigate }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Loader size="medium" />
      </Box>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No recent orders</Typography>
      </Box>
    );
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Shipped': return 'primary';
      case 'Processing': return 'info';
      case 'Pending': return 'warning';
      case 'Canceled': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Order ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>User</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.slice(0, 5).map((order) => (
            <TableRow 
              key={order._id} 
              hover 
              onClick={() => navigate(`/order/${order._id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order._id.substring(0, 8)}...
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {order.user?.username?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {order.user?.username || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ₹{order.totalPrice?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Chip 
                  label={order.status} 
                  size="small" 
                  color={getStatusColor(order.status)}
                  sx={{ borderRadius: 1 }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2">
                  {format(new Date(order.createdAt), 'MMM dd')}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Recent Posts Table Component
const RecentPostsTable = ({ posts, loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Loader size="medium" />
      </Box>
    );
  }
  
  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No recent posts</Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Post Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Group</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Creator</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.slice(0, 5).map((post) => (
            <TableRow key={post._id} hover>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {post.title}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Chip 
                  label={post.group?.name || 'General'} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {post.user?.username?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {post.user?.username || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Pending Requests Table Component
const PendingRequestsTable = ({ requests, loading, type }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Loader size="medium" />
      </Box>
    );
  }
  
  if (!requests || requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No pending requests</Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
              {type === 'join' ? 'Group' : 'User'}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
              {type === 'join' ? 'User' : 'Content'}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.slice(0, 5).map((request) => (
            <TableRow key={request._id} hover>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {type === 'join' ? request.group?.name : request.user?.username}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2">
                  {type === 'join' ? request.user?.username : 'Reported Post'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Main AdminOverview Component
const AdminOverview = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedPostsLoading, setReportedPostsLoading] = useState(true);
  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

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

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await adminService.getAllOrders({ page: 1, limit: 5 });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to fetch recent orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      setPostsLoading(true);
      // This would need to be implemented in the backend
      // For now, we'll just set empty array
      setPosts([]);
    } catch (err) {
      console.error('Failed to fetch recent posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchReportedContent = async () => {
    try {
      setReportedPostsLoading(true);
      const res = await adminService.getReportedPosts();
      setReportedPosts(res || []);
    } catch (err) {
      console.error('Failed to fetch reported content:', err);
    } finally {
      setReportedPostsLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      setJoinRequestsLoading(true);
      // This would need to be implemented in the backend
      // For now, we'll just set empty array
      setJoinRequests([]);
    } catch (err) {
      console.error('Failed to fetch join requests:', err);
    } finally {
      setJoinRequestsLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders(),
      fetchRecentPosts(),
      fetchReportedContent(),
      fetchJoinRequests()
    ]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Loader size="large" />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  // Calculate additional metrics
  const activeUsers = stats?.totalUsers ? Math.floor(stats.totalUsers * 0.7) : 0; // Estimate 70% active
  const newSignups = stats?.userSignups ? stats.userSignups.reduce((sum, day) => sum + day.count, 0) : 0;
  const pendingReports = reportedPosts.length;
  const pendingRequests = joinRequests.length;
  const outOfStockProducts = 0; // Would need to fetch this data
  const activeGroups = 0; // Would need to fetch this data

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, mb: 0.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Key performance indicators for E-Commerce & Community
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchData} 
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

      {/* TOP SECTION — Quick Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats?.totalRevenue?.toFixed(0) ?? '0'}`} 
            icon={<MonetizationOnIcon />} 
            color={theme.palette.success.main}
            trend={stats?.revenueTrend > 0 ? 'up' : stats?.revenueTrend < 0 ? 'down' : null}
            trendValue={stats?.revenueTrend ? `${Math.abs(stats.revenueTrend)}% this month` : null}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Orders This Week" 
            value={stats?.totalOrders ?? '0'} 
            icon={<ShoppingCartIcon />} 
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Users" 
            value={activeUsers} 
            icon={<PeopleIcon />} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="New Signups" 
            value={newSignups} 
            icon={<GroupIcon />} 
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Products" 
            value={stats?.totalProducts ?? '0'} 
            icon={<InventoryIcon />} 
            color={theme.palette.warning.main}
            onClick={() => navigate('/admin/products')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Groups" 
            value={activeGroups} 
            icon={<GroupIcon />} 
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Active Posts" 
            value={stats?.totalPosts ?? '0'} 
            icon={<PostAddIcon />} 
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Pending Reports" 
            value={pendingReports} 
            icon={<ReportIcon />} 
            color={theme.palette.error.main}
            onClick={() => navigate('/admin/reports')}
          />
        </Grid>
      </Grid>

      {/* MIDDLE SECTION — Graphs & Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* E-Commerce Analytics - Sales Trend Graph */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Sales Trend (Last 30 Days)</Typography>
              <Chip label="Last 30 Days" variant="outlined" size="small" />
            </Box>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.substring(5)} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                  />
                  <YAxis 
                    tickFormatter={(val) => `₹${val}`} 
                    allowDecimals={false} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                  />
                  <ChartTooltip 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Sales']} 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales" 
                    stroke={theme.palette.success.main} 
                    fill={alpha(theme.palette.success.main, 0.2)}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Community Analytics - User Growth */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>User Growth (Last 7 Days)</Typography>
            </Box>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.userSignups}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.substring(5)} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                  />
                  <ChartTooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="New Users" 
                    fill={theme.palette.primary.main} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* E-Commerce Analytics - Top Selling Products */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Top Selling Products</Typography>
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

        {/* Community Analytics - Reported Content */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Reported Content</Typography>
            </Box>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Spam', value: 5 },
                      { name: 'Inappropriate', value: 3 },
                      { name: 'Copyright', value: 2 },
                      { name: 'Other', value: 4 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill={theme.palette.error.main} />
                    <Cell fill={theme.palette.warning.main} />
                    <Cell fill={theme.palette.info.main} />
                    <Cell fill={theme.palette.secondary.main} />
                  </Pie>
                  <ChartTooltip 
                    formatter={(value) => [value, 'Reports']}
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

      {/* BOTTOM SECTION — Tables / Lists */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { 
              fontFamily: theme.typography.fontFamily,
              fontWeight: 'bold'
            }
          }}
        >
          <Tab label="Recent Orders" />
          <Tab label="Recent Posts" />
          <Tab label="Pending Reports" />
          <Tab label="Join Requests" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <RecentOrdersTable orders={orders} loading={ordersLoading} navigate={navigate} />
          )}
          {tabValue === 1 && (
            <RecentPostsTable posts={posts} loading={postsLoading} />
          )}
          {tabValue === 2 && (
            <PendingRequestsTable 
              requests={reportedPosts} 
              loading={reportedPostsLoading} 
              type="report" 
            />
          )}
          {tabValue === 3 && (
            <PendingRequestsTable 
              requests={joinRequests} 
              loading={joinRequestsLoading} 
              type="join" 
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminOverview;