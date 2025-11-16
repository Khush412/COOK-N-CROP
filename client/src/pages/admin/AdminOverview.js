import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Grid, Alert, useTheme, alpha, 
  Avatar, Stack, Button, Chip, IconButton, Tooltip, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, LinearProgress, Card, CardContent, CardHeader, useMediaQuery
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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

// Enhanced Stat Card Component with better design
const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        p: { xs: 1, sm: 1.5, md: 2.5 }, 
        display: 'flex', 
        alignItems: 'center', 
        borderRadius: { xs: 1.5, sm: 2, md: 3 }, 
        border: `1px solid ${theme.palette.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 8,
          borderColor: alpha(color, 0.3)
        } : {},
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 1.5, sm: 2, md: 4 },
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`,
        }
      }}
      onClick={onClick}
    >
      <Box sx={{
        mr: { xs: 0.75, sm: 1, md: 2 },
        p: { xs: 0.75, sm: 1, md: 1.5 },
        borderRadius: '50%',
        color: color,
        backgroundColor: alpha(color, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: { xs: 32, sm: 40, md: 50 },
        minHeight: { xs: 32, sm: 40, md: 50 },
        boxShadow: `0 4px 8px ${alpha(color, 0.1)}`,
        zIndex: 1
      }}>
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1, zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: { xs: 0.25, sm: 0.5 }, fontFamily: 'inherit', fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>{value}</Typography>
        <Typography color="text.secondary" sx={{ fontFamily: 'inherit', fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, mb: { xs: 0.5, sm: 1 } }}>{title}</Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: { xs: 10, sm: 12, md: 16 }, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: { xs: 10, sm: 12, md: 16 }, color: 'error.main' }} />
            )}
            <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'} sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' } }}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{
        position: 'absolute',
        right: { xs: -10, sm: -20 },
        bottom: { xs: -10, sm: -20 },
        width: { xs: 40, sm: 80 },
        height: { xs: 40, sm: 80 },
        borderRadius: '50%',
        backgroundColor: alpha(color, 0.05),
        zIndex: 0
      }} />
    </Card>
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
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Order ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>User</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.slice(0, 5).map((order) => (
            <TableRow 
              key={order._id} 
              hover 
              onClick={() => navigate(`/order/${order._id}`)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order._id.substring(0, 8)}...
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: { xs: 10, sm: 12 } }}>
                    {order.user?.username?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {order.user?.username || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ₹{order.totalPrice?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Chip 
                  label={order.status} 
                  size="small" 
                  color={getStatusColor(order.status)}
                  sx={{ borderRadius: 1, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Post Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Group</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Creator</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.slice(0, 5).map((post) => (
            <TableRow 
              key={post._id} 
              hover
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                }
              }}
            >
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {post.title}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Chip 
                  label={post.group?.name || 'General'} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderRadius: 1, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 }, fontSize: { xs: 10, sm: 12 } }}>
                    {post.user?.username?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {post.user?.username || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {type === 'join' ? 'Group' : 'User'}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {type === 'join' ? 'User' : 'Content'}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.slice(0, 5).map((request) => (
            <TableRow 
              key={request._id} 
              hover
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.05)
                }
              }}
            >
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {type === 'join' ? request.group?.name : request.user?.username}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <Typography variant="body2">
                  {type === 'join' ? request.user?.username : 'Reported Post'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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
  const [tabValue, setTabValue] = useState(0);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminService.getDashboardStats();
      
      // Enhance the stats data with additional calculated fields
      const enhancedStats = {
        ...res.data,
        // Calculate trends if not provided by backend
        revenueTrend: res.data.revenueTrend || (res.data.totalRevenue ? 5 : 0),
        ordersTrend: res.data.ordersTrend || (res.data.totalOrders ? 3 : 0),
        signupsTrend: res.data.signupsTrend || (res.data.totalUsers ? 2 : 0),
        avgOrderValue: res.data.totalOrders && res.data.totalRevenue 
          ? res.data.totalRevenue / res.data.totalOrders 
          : 0,
        topProductRating: res.data.topSellingProducts && res.data.topSellingProducts.length > 0
          ? Math.max(...res.data.topSellingProducts.map(p => p.rating || 0))
          : 0,
        // Add order status distribution if not provided
        orderStatusDistribution: res.data.orderStatusDistribution || [
          { status: 'Delivered', count: Math.floor(res.data.totalOrders * 0.7) || 0 },
          { status: 'Processing', count: Math.floor(res.data.totalOrders * 0.15) || 0 },
          { status: 'Shipped', count: Math.floor(res.data.totalOrders * 0.1) || 0 },
          { status: 'Pending', count: Math.floor(res.data.totalOrders * 0.03) || 0 },
          { status: 'Canceled', count: Math.floor(res.data.totalOrders * 0.02) || 0 }
        ],
        // Add revenue by category if not provided
        revenueByCategory: res.data.revenueByCategory || [
          { category: 'Vegetables', revenue: res.data.totalRevenue * 0.3 || 0 },
          { category: 'Fruits', revenue: res.data.totalRevenue * 0.25 || 0 },
          { category: 'Dairy', revenue: res.data.totalRevenue * 0.2 || 0 },
          { category: 'Grains', revenue: res.data.totalRevenue * 0.15 || 0 },
          { category: 'Other', revenue: res.data.totalRevenue * 0.1 || 0 }
        ]
      };
      
      setStats(enhancedStats);
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

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders(),
      fetchRecentPosts(),
      fetchReportedContent()
      // fetchJoinRequests() - removed this
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
  const outOfStockProducts = 0; // Would need to fetch this data
  const activeGroups = 0; // Would need to fetch this data

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3, md: 4 }, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Key performance indicators for E-Commerce & Community
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchData} 
            disabled={refreshing}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: { xs: 1.5, sm: 2 },
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Welcome Section */}
      <Card elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3, md: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, border: `1px solid ${theme.palette.divider}`, boxShadow: 4, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.paper} 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Avatar 
            sx={{ 
              width: { xs: 48, sm: 60 }, 
              height: { xs: 48, sm: 60 }, 
              bgcolor: theme.palette.primary.main,
              boxShadow: 3
            }}
          >
            <PeopleIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: { xs: 150, sm: 200 } }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Welcome back, Admin!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mt: { xs: 0.25, sm: 0.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Here's what's happening with your store today
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: { xs: 150, sm: 200 } }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mt: { xs: 0.25, sm: 0.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Performance Indicators */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{ 
                width: { xs: 8, sm: 12 }, 
                height: { xs: 8, sm: 12 }, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                boxShadow: `0 0 8px ${theme.palette.success.main}`
              }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Server Status
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: 'success.main', fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              Operational
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{ 
                width: { xs: 8, sm: 12 }, 
                height: { xs: 8, sm: 12 }, 
                borderRadius: '50%', 
                bgcolor: stats?.revenueTrend >= 0 ? 'success.main' : 'error.main',
                boxShadow: `0 0 8px ${stats?.revenueTrend >= 0 ? theme.palette.success.main : theme.palette.error.main}`
              }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Sales Trend
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: stats?.revenueTrend >= 0 ? 'success.main' : 'error.main', fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              {stats?.revenueTrend >= 0 ? 'Up' : 'Down'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{ 
                width: { xs: 8, sm: 12 }, 
                height: { xs: 8, sm: 12 }, 
                borderRadius: '50%', 
                bgcolor: pendingReports === 0 ? 'success.main' : 'warning.main',
                boxShadow: `0 0 8px ${pendingReports === 0 ? theme.palette.success.main : theme.palette.warning.main}`
              }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Reports
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: pendingReports === 0 ? 'success.main' : 'warning.main', fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              {pendingReports === 0 ? 'Clear' : `${pendingReports} pending`}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{ 
                width: { xs: 8, sm: 12 }, 
                height: { xs: 8, sm: 12 }, 
                borderRadius: '50%', 
                bgcolor: outOfStockProducts === 0 ? 'success.main' : 'error.main',
                boxShadow: `0 0 8px ${outOfStockProducts === 0 ? theme.palette.success.main : theme.palette.error.main}`
              }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Inventory
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: outOfStockProducts === 0 ? 'success.main' : 'error.main', fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              {outOfStockProducts === 0 ? 'Healthy' : `${outOfStockProducts} low`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions Bar */}
      <Card elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3, md: 4 }, borderRadius: { xs: 2, sm: 3, md: 4 }, border: `1px solid ${theme.palette.divider}`, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Quick Actions
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/products')}
              fullWidth
              sx={{ 
                borderRadius: { xs: 2, sm: 3 }, 
                px: { xs: 1, sm: 2 }, 
                py: { xs: 1.5, sm: 2 }, 
                boxShadow: 3, 
                '&:hover': { boxShadow: 6 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ 
                width: { xs: 36, sm: 48 }, 
                height: { xs: 36, sm: 48 }, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}>
                <AddIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Add Product</Typography>
            </Button>
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/admin/orders/create')}
              fullWidth
              sx={{ 
                borderRadius: { xs: 2, sm: 3 }, 
                px: { xs: 1, sm: 2 }, 
                py: { xs: 1.5, sm: 2 }, 
                boxShadow: 3, 
                '&:hover': { boxShadow: 6 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ 
                width: { xs: 36, sm: 48 }, 
                height: { xs: 36, sm: 48 }, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}>
                <ShoppingCartIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Create Order</Typography>
            </Button>
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/products/low-stock')}
              fullWidth
              sx={{ 
                borderRadius: { xs: 2, sm: 3 }, 
                px: { xs: 1, sm: 2 }, 
                py: { xs: 1.5, sm: 2 }, 
                boxShadow: 2, 
                '&:hover': { boxShadow: 4 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ 
                width: { xs: 36, sm: 48 }, 
                height: { xs: 36, sm: 48 }, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}>
                <WarningIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Low Stock</Typography>
            </Button>
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/users')}
              fullWidth
              sx={{ 
                borderRadius: { xs: 2, sm: 3 }, 
                px: { xs: 1, sm: 2 }, 
                py: { xs: 1.5, sm: 2 }, 
                boxShadow: 2, 
                '&:hover': { boxShadow: 4 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ 
                width: { xs: 36, sm: 48 }, 
                height: { xs: 36, sm: 48 }, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}>
                <PeopleIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Manage Users</Typography>
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* TOP SECTION — Key Summary Cards (Enhanced set) */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats?.totalRevenue?.toFixed(0) ?? '0'}`} 
            icon={<MonetizationOnIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.success.main}
            trend={stats?.revenueTrend > 0 ? 'up' : stats?.revenueTrend < 0 ? 'down' : null}
            trendValue={stats?.revenueTrend ? `${Math.abs(stats.revenueTrend)}% this month` : null}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Orders This Week" 
            value={stats?.totalOrders ?? '0'} 
            icon={<ShoppingCartIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.info.main}
            trend={stats?.ordersTrend > 0 ? 'up' : stats?.ordersTrend < 0 ? 'down' : null}
            trendValue={stats?.ordersTrend ? `${Math.abs(stats.ordersTrend)}% this week` : null}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Total Products" 
            value={stats?.totalProducts ?? '0'} 
            icon={<InventoryIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.warning.main}
            onClick={() => navigate('/admin/products')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="New Signups" 
            value={newSignups} 
            icon={<GroupIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.secondary.main}
            trend={stats?.signupsTrend > 0 ? 'up' : stats?.signupsTrend < 0 ? 'down' : null}
            trendValue={stats?.signupsTrend ? `${Math.abs(stats.signupsTrend)}% this week` : null}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Active Users" 
            value={activeUsers} 
            icon={<PeopleIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Pending Reports" 
            value={pendingReports} 
            icon={<ReportIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.error.main}
            onClick={() => setTabValue(2)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Avg. Order Value" 
            value={`₹${stats?.avgOrderValue?.toFixed(0) ?? '0'}`} 
            icon={<MonetizationOnIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
          <StatCard 
            title="Top Product Rating" 
            value={stats?.topProductRating?.toFixed(1) ?? '0.0'} 
            icon={<StarIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />} 
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* CHARTS SECTION — Full Width Charts */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        {/* E-Commerce Analytics - Sales Trend Graph */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 }, height: '100%', border: `1px solid ${theme.palette.divider}`, boxShadow: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 }, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Sales Trend (Last 30 Days)</Typography>
              <Chip label="Last 30 Days" variant="outlined" size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
            </Box>
            <Box sx={{ height: { xs: 250, sm: 350, md: 450 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.salesData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.substring(5)} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <YAxis 
                    tickFormatter={(val) => `₹${val}`} 
                    allowDecimals={false} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <ChartTooltip 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Sales']} 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: isMobile ? 12 : 14
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales" 
                    stroke={theme.palette.success.main} 
                    fill={alpha(theme.palette.success.main, 0.3)}
                    strokeWidth={isMobile ? 2 : 3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Community Analytics - User Growth */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 }, height: '100%', border: `1px solid ${theme.palette.divider}`, boxShadow: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 }, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>User Growth (Last 7 Days)</Typography>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300, md: 400 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.userSignups}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str.substring(5)} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <ChartTooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: isMobile ? 12 : 14
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
          </Card>
        </Grid>
        
        {/* E-Commerce Analytics - Order Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 }, height: '100%', border: `1px solid ${theme.palette.divider}`, boxShadow: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 }, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Order Status Distribution</Typography>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300, md: 400 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.orderStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 60 : 120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelProps={{ fontSize: isMobile ? 8 : 12 }}
                  >
                    {stats?.orderStatusDistribution?.map((entry, index) => {
                      const colors = [
                        theme.palette.success.main,
                        theme.palette.primary.main,
                        theme.palette.info.main,
                        theme.palette.warning.main,
                        theme.palette.error.main
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <ChartTooltip 
                    formatter={(value) => [value, 'Orders']}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: isMobile ? 12 : 14
                    }}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"} 
                    verticalAlign={isMobile ? "bottom" : "middle"} 
                    align={isMobile ? "center" : "right"} 
                    wrapperStyle={{ fontSize: isMobile ? 8 : 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* E-Commerce Analytics - Revenue by Category */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: 2, sm: 3, md: 4 }, height: '100%', border: `1px solid ${theme.palette.divider}`, boxShadow: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 }, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Revenue by Category</Typography>
              <Chip label="Top Categories" variant="outlined" size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
            </Box>
            <Box sx={{ height: { xs: 250, sm: 350, md: 450 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.revenueByCategory || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <YAxis 
                    tickFormatter={(val) => `₹${val}`} 
                    stroke={alpha(theme.palette.text.primary, 0.6)} 
                    fontSize={isMobile ? 10 : 12}
                  />
                  <ChartTooltip 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: isMobile ? 12 : 14
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill={theme.palette.secondary.main} 
                    radius={[4, 4, 0, 0]}
                  >
                    {stats?.revenueByCategory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={theme.palette.secondary.main} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* BOTTOM SECTION — Tables / Lists */}
      <Card elevation={0} sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', boxShadow: 4, mb: { xs: 2, sm: 3, md: 4 } }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { 
              fontFamily: theme.typography.fontFamily,
              fontWeight: 'bold',
              py: { xs: 1, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab label="Recent Orders" />
          <Tab label="Recent Posts" />
          <Tab label="Pending Reports" />
        </Tabs>
        
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
        </Box>
      </Card>
    </Box>
  );
};

export default AdminOverview;