import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Alert, Table, TableBody, TableCell, Box, Pagination,
  TableContainer, TableHead, TableRow, Paper, Avatar, Slider, Container,
  Button, Chip, Stack, Grid, Card, CardContent, LinearProgress, 
  FormControl, InputLabel, Select, MenuItem, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, useTheme, alpha
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import adminService from '../../services/adminService';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import Loader from '../../custom_components/Loader';

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [debouncedThreshold, setDebouncedThreshold] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('stock'); // stock, name, price
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const theme = useMuiTheme();

  // Get unique categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedThreshold(threshold);
    }, 500);
    return () => clearTimeout(timer);
  }, [threshold]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getLowStockProducts({ 
        page, 
        threshold: debouncedThreshold 
      });
      setProducts(data.products);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to fetch low stock products.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedThreshold]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewStock(product.countInStock);
    setEditDialogOpen(true);
  };

  const handleSaveStock = async () => {
    // In a real implementation, you would call an API to update the stock
    // For now, we'll just update the local state
    setProducts(prev => 
      prev.map(p => 
        p._id === editProduct._id 
          ? { ...p, countInStock: newStock } 
          : p
      )
    );
    setEditDialogOpen(false);
    setEditProduct(null);
    setNewStock(0);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Category', 'Price', 'Stock Left'];
    const rows = products.map(product => [
      product.name,
      product.category,
      product.price,
      product.countInStock
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-products-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStockStatusColor = (stock) => {
    if (stock < 3) return 'error';
    if (stock < 5) return 'warning';
    return 'info';
  };

  const getStockStatusText = (stock) => {
    if (stock < 3) return 'Critical';
    if (stock < 5) return 'Low';
    return 'Moderate';
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'stock') {
        return sortOrder === 'asc' ? a.countInStock - b.countInStock : b.countInStock - a.countInStock;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      return 0;
    });

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.warning.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Inventory Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Monitor and manage products with low inventory levels.
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {products.length}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ fontSize: 32, color: theme.palette.info.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {products.filter(p => p.countInStock < 5).length}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Critical Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterListIcon sx={{ fontSize: 32, color: theme.palette.success.main, mr: 2 }} />
                <Typography variant="h4" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                  {categories.length}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DownloadIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  sx={{ 
                    borderRadius: 2, 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 'bold'
                  }}
                >
                  Export
                </Button>
              </Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary' }}>
                Download Report
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        {/* Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily
                }
              }}
            />
          </Grid>
          
          <Grid item size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
                IconComponent={SortIcon}
              >
                <MenuItem value="stock" sx={{ fontFamily: theme.typography.fontFamily }}>Stock Level</MenuItem>
                <MenuItem value="name" sx={{ fontFamily: theme.typography.fontFamily }}>Name</MenuItem>
                <MenuItem value="price" sx={{ fontFamily: theme.typography.fontFamily }}>Price</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
              >
                <MenuItem value="asc" sx={{ fontFamily: theme.typography.fontFamily }}>Ascending</MenuItem>
                <MenuItem value="desc" sx={{ fontFamily: theme.typography.fontFamily }}>Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ borderRadius: 2, fontFamily: theme.typography.fontFamily }}
              >
                <MenuItem value="all" sx={{ fontFamily: theme.typography.fontFamily }}>All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category} sx={{ fontFamily: theme.typography.fontFamily }}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              onClick={() => setDebouncedThreshold(threshold)}
              sx={{ 
                borderRadius: 2, 
                fontFamily: theme.typography.fontFamily,
                fontWeight: 'bold',
                height: 'fit-content',
                alignSelf: 'flex-end',
                minWidth: '100%'
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
        
        {/* Threshold Input */}
        <Box sx={{ my: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, background: alpha(theme.palette.background.default, 0.5) }}>
          <Typography gutterBottom sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Set Stock Threshold
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily
                },
                '& .MuiInputLabel-root': { 
                  fontFamily: theme.typography.fontFamily
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => setDebouncedThreshold(threshold)}
              sx={{ 
                borderRadius: 2, 
                fontFamily: theme.typography.fontFamily,
                fontWeight: 'bold'
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><Loader size="medium" /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Button 
                        onClick={handleSelectAll}
                        size="small"
                        sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                      >
                        {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Stock Left</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product) => (
                      <TableRow 
                        key={product._id} 
                        hover
                        selected={selectedProducts.includes(product._id)}
                      >
                        <TableCell padding="checkbox">
                          <Button 
                            onClick={() => handleSelectProduct(product._id)}
                            size="small"
                            variant={selectedProducts.includes(product._id) ? "contained" : "outlined"}
                            sx={{ 
                              minWidth: '32px', 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%',
                              fontFamily: theme.typography.fontFamily,
                              p: 0
                            }}
                          >
                            {selectedProducts.includes(product._id) ? '✓' : ''}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Avatar 
                            src={product.images && product.images.length > 0 ? `${process.env.REACT_APP_API_URL}${product.images[0]}` : (product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`)} 
                            variant="rounded" 
                            sx={{ width: 50, height: 50 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>{product.name}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>
                          <Chip 
                            label={product.category} 
                            size="small" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily }}>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                          {product.countInStock}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => handleEditProduct(product)}
                            sx={{ 
                              borderRadius: 2,
                              fontFamily: theme.typography.fontFamily
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <WarningAmberIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                            No products are below the selected stock threshold.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      fontFamily: theme.typography.fontFamily 
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
          Update Stock for {editProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="New Stock Quantity"
              type="number"
              fullWidth
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  fontFamily: theme.typography.fontFamily
                },
                '& .MuiInputLabel-root': { 
                  fontFamily: theme.typography.fontFamily
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ fontFamily: theme.typography.fontFamily }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStock}
            variant="contained"
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              borderRadius: 2
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LowStockPage;