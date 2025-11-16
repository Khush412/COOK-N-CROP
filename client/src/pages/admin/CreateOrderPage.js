import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Grid, TextField, Autocomplete, Button, IconButton, Container, Stack,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Alert, Chip, Card, CardContent,
  Stepper, Step, StepLabel, useTheme, alpha, InputAdornment, Tooltip
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const [user, setUser] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [product, setProduct] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const [orderItems, setOrderItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryCharge = subtotal < 200 ? 40 : 0;
  const totalPrice = subtotal + deliveryCharge;

  // Steps for the order creation process
  const steps = [
    'Select User',
    'Add Products',
    'Shipping Address',
    'Review & Place Order'
  ];

  useEffect(() => {
    if (user) {
      setShippingAddress({
        fullName: user.username,
        street: '', city: '', state: '', zipCode: '', country: '', phone: ''
      });
    }
  }, [user]);

  const handleUserSearch = async (event, newValue) => {
    if (!newValue || newValue.length < 2) {
      setUserOptions([]);
      return;
    }
    setUserLoading(true);
    try {
      const users = await adminService.searchUsers(newValue);
      setUserOptions(users);
    } catch (err) {
      console.error("Failed to search users", err);
      setUserOptions([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSelect = (event, newValue) => {
    setUser(newValue);
    if (newValue) {
      setActiveStep(1); // Move to next step when user is selected
    }
  };

  const handleProductSelect = (event, newValue) => {
    setProduct(newValue);
  };

  const handleStepChange = (step) => {
    if (step <= activeStep || (step === 1 && user) || (step === 2 && orderItems.length > 0) || step === 0) {
      setActiveStep(step);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !user) {
      setError('Please select a user first');
      return;
    }
    if (activeStep === 1 && orderItems.length === 0) {
      setError('Please add at least one product');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const clearSelections = () => {
    setUser(null);
    setProduct(null);
    setOrderItems([]);
    setShippingAddress({
      fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: ''
    });
    setActiveStep(0);
    setError('');
    setSuccess('');
  };

  const handleProductSearch = async (event, newValue) => {
    if (!newValue || newValue.length < 2) {
      setProductOptions([]);
      return;
    }
    setProductLoading(true);
    try {
      const products = await adminService.searchProductsForAdmin(newValue);
      setProductOptions(products);
    } catch (err) {
      console.error("Failed to search products", err);
      setProductOptions([]);
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!product) return;
    const existItem = orderItems.find(x => x.product === product._id);
    if (existItem) {
      setOrderItems(orderItems.map(x => x.product === existItem.product ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setOrderItems([...orderItems, {
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : (product.image || ''),
        price: product.price,
        qty: 1,
      }]);
    }
    setProduct(null);
    setProductOptions([]);
    setError('');
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setOrderItems(orderItems.map(item => 
      item.product === productId ? { ...item, qty: newQty } : item
    ));
  };

  const handleIncreaseQuantity = (productId) => {
    const item = orderItems.find(x => x.product === productId);
    if (item) {
      handleUpdateQuantity(productId, item.qty + 1);
    }
  };

  const handleDecreaseQuantity = (productId) => {
    const item = orderItems.find(x => x.product === productId);
    if (item) {
      handleUpdateQuantity(productId, item.qty - 1);
    }
  };

  const handleRemoveItem = (id) => {
    setOrderItems(orderItems.filter(x => x.product !== id));
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // User selection
        return user !== null;
      case 1: // Product selection
        return orderItems.length > 0;
      case 2: // Shipping address
        return shippingAddress.street && shippingAddress.city && shippingAddress.state && 
               shippingAddress.zipCode && shippingAddress.country;
      default:
        return true;
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('Please select a user.');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('Please add products to the order.');
      return;
    }
    
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode || !shippingAddress.country) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderData = {
        userId: user._id,
        orderItems: orderItems.map(item => ({ product: item.product, qty: item.qty })),
        shippingAddress,
      };
      const createdOrder = await adminService.createOrderForUser(orderData);
      setSuccess('Order created successfully!');
      setTimeout(() => {
        navigate(`/admin/orders`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mb: 4, 
        borderRadius: 4, 
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Box>
            <Button 
              onClick={() => navigate('/admin/orders')} 
              startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />} 
              sx={{ 
                mb: 1, 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 }
              }}
            >
              Back to Manage Orders
            </Button>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                fontFamily: theme.typography.fontFamily, 
                color: theme.palette.primary.main,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Create New Order
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                mt: 1,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
              }}
            >
              Follow the steps to create a new order for your customer
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
            <Button 
              variant="outlined" 
              onClick={clearSelections}
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                borderRadius: 2,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 }
              }}
            >
              Reset Form
            </Button>
          </Box>
        </Box>
        
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel 
          sx={{ 
            mb: 2,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                onClick={() => handleStepChange(index)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: activeStep === index ? 'bold' : 'normal',
                    color: activeStep === index ? theme.palette.primary.main : 'inherit',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, fontFamily: theme.typography.fontFamily, borderRadius: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{success}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Step 0: Select User */}
          {activeStep === 0 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 24, sm: 32 } }} />
                </Box>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Select User
                </Typography>
              </Box>
              
              <Autocomplete
                options={userOptions}
                getOptionLabel={(option) => `${option.username} (${option.email})`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                onChange={handleUserSelect}
                onInputChange={handleUserSearch}
                loading={userLoading}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search for a user..." 
                    variant="outlined"
                    placeholder="Type to search users by username or email"
                    InputProps={{ 
                      ...params.InputProps, 
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>{userLoading ? <Loader size="small" color="inherit" /> : null}{params.InputProps.endAdornment}</>
                      ),
                    }}
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }}
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      },
                      borderRadius: 2,
                      mb: 2
                    }}
                  />
                )}
              />
              
              {user && (
                <Card sx={{ mt: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                      <Avatar 
                        src={user.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : undefined}
                        sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily, 
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {user.username}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                          }}
                        >
                          {user.email}
                        </Typography>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'error'} 
                          size="small" 
                          sx={{ 
                            mt: 1,
                            fontSize: { xs: '0.625rem', sm: '0.75rem' }
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: { xs: 24, sm: 32 } }} />
                    </Box>
                  </CardContent>
                </Card>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 2, sm: 3 } }}>
                <Button 
                  variant="contained" 
                  onClick={handleNextStep}
                  disabled={!user}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Continue
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 1: Add Products */}
          {activeStep === 1 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <AddShoppingCartIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 24, sm: 32 } }} />
                </Box>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Add Products
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Autocomplete 
                  sx={{ flexGrow: 1 }} 
                  options={productOptions} 
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option._id === value._id} 
                  value={product} 
                  onChange={handleProductSelect}
                  onInputChange={handleProductSearch} 
                  loading={productLoading}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Search for a product..." 
                      variant="outlined"
                      placeholder="Type to search products by name"
                      InputProps={{ 
                        ...params.InputProps, 
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>{productLoading ? <Loader size="small" color="inherit" /> : null}{params.InputProps.endAdornment}</>
                        ),
                      }}
                      InputLabelProps={{ 
                        sx: { 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        } 
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        borderRadius: 2
                      }}
                    />
                  )}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddProduct} 
                  disabled={!product}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Add
                </Button>
              </Box>
              
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Order Items ({orderItems.length})
              </Typography>
              
              {orderItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                  <ShoppingCartIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      color: 'text.secondary',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    No items added yet
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      color: 'text.secondary', 
                      mt: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Search and add products to the order
                  </Typography>
                </Box>
              ) : (
                <List sx={{ bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: 2, p: 1 }}>
                  {orderItems.map(item => (
                    <ListItem 
                      key={item.product} 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        borderRadius: 2, 
                        mb: 1, 
                        p: { xs: 1.5, sm: 2 },
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} 
                          variant="rounded" 
                          sx={{ 
                            width: { xs: 56, sm: 64 }, 
                            height: { xs: 56, sm: 64 }, 
                            mr: { xs: 1, sm: 2 } 
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily, 
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mt: 1, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily,
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                              }}
                            >
                              ₹{item.price.toFixed(2)} each
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDecreaseQuantity(item.product)}
                                sx={{ 
                                  minWidth: { xs: 28, sm: 32 },
                                  width: { xs: 28, sm: 32 },
                                  height: { xs: 28, sm: 32 }
                                }}
                              >
                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>-</Typography>
                              </IconButton>
                              <TextField 
                                value={item.qty}
                                onChange={(e) => handleUpdateQuantity(item.product, parseInt(e.target.value) || 1)}
                                size="small"
                                sx={{ 
                                  width: { xs: 50, sm: 60 }, 
                                  textAlign: 'center',
                                  '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    py: { xs: 0.5, sm: 1 }
                                  }
                                }}
                                inputProps={{ 
                                  style: { textAlign: 'center' },
                                  min: 1
                                }}
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleIncreaseQuantity(item.product)}
                                sx={{ 
                                  minWidth: { xs: 28, sm: 32 },
                                  width: { xs: 28, sm: 32 },
                                  height: { xs: 28, sm: 32 }
                                }}
                              >
                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>+</Typography>
                              </IconButton>
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontFamily: theme.typography.fontFamily, 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              ₹{(item.price * item.qty).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleRemoveItem(item.product)}
                        sx={{ 
                          color: theme.palette.error.main,
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 2, sm: 3 } }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePrevStep}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleNextStep}
                  disabled={orderItems.length === 0}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Continue
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 2: Shipping Address */}
          {activeStep === 2 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <LocationOnIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 24, sm: 32 } }} />
                </Box>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Shipping Address
                </Typography>
              </Box>
              
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    label="Full Name" 
                    name="fullName" 
                    value={shippingAddress.fullName} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    label="Street Address" 
                    name="street" 
                    value={shippingAddress.street} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    required 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    label="City" 
                    name="city" 
                    value={shippingAddress.city} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    required 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    label="State" 
                    name="state" 
                    value={shippingAddress.state} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    required 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    label="Zip Code" 
                    name="zipCode" 
                    value={shippingAddress.zipCode} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    required 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField 
                    label="Country" 
                    name="country" 
                    value={shippingAddress.country} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    required 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    label="Phone (Optional)" 
                    name="phone" 
                    value={shippingAddress.phone} 
                    onChange={handleAddressChange} 
                    fullWidth 
                    margin="normal" 
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      } 
                    }} 
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }, 
                      borderRadius: 2,
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 2, sm: 3 } }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePrevStep}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleNextStep}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Continue
                </Button>
              </Box>
            </Paper>
          )}

          {/* Step 3: Review & Place Order */}
          {activeStep === 3 && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CheckCircleIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 24, sm: 32 } }} />
                </Box>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Review & Place Order
                </Typography>
              </Box>
              
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* User Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          fontWeight: 'bold', 
                          mb: 2,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Customer
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <Avatar 
                          src={user.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : undefined}
                          sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily, 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {user.username}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontFamily: theme.typography.fontFamily,
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Shipping Address */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          fontWeight: 'bold', 
                          mb: 2,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Shipping Address
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                        }}
                      >
                        <strong>{shippingAddress.fullName}</strong><br />
                        {shippingAddress.street}<br />
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                        {shippingAddress.country}<br />
                        {shippingAddress.phone && `Phone: ${shippingAddress.phone}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Order Items */}
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          fontWeight: 'bold', 
                          mb: 2,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Order Items ({orderItems.length})
                      </Typography>
                      <List>
                        {orderItems.map(item => (
                          <ListItem key={item.product} sx={{ py: { xs: 0.5, sm: 1 }, px: 0 }}>
                            <ListItemAvatar>
                              <Avatar 
                                src={item.image ? `${process.env.REACT_APP_API_URL}${item.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`} 
                                variant="rounded" 
                                sx={{ 
                                  width: { xs: 40, sm: 48 }, 
                                  height: { xs: 40, sm: 48 }, 
                                  mr: { xs: 1, sm: 2 } 
                                }}
                              />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontFamily: theme.typography.fontFamily, 
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                  }}
                                >
                                  {item.name}
                                </Typography>
                              }
                              secondary={
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: theme.typography.fontFamily,
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                  }}
                                >
                                  Qty: {item.qty} × ₹{item.price.toFixed(2)} = ₹{(item.price * item.qty).toFixed(2)}
                                </Typography>
                              }
                              primaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                              secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          Subtotal
                        </Typography>
                        <Typography 
                          fontWeight="bold" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          ₹{subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          Delivery Charge
                        </Typography>
                        <Typography 
                          fontWeight="bold" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily, 
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          Total
                        </Typography>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily, 
                            color: theme.palette.primary.main,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          ₹{totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 2, sm: 3 } }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePrevStep}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handlePlaceOrder} 
                  disabled={placingOrder}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: 2, 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 2, sm: 4 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {placingOrder ? <Loader size="small" /> : 'Place Order'}
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, position: 'sticky', top: { xs: 80, sm: 100 }, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                fontFamily: theme.typography.fontFamily, 
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Order Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Subtotal
              </Typography>
              <Typography 
                fontWeight="bold" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                ₹{subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Delivery Charge
              </Typography>
              <Typography 
                fontWeight="bold" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Total
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                ₹{totalPrice.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  mb: 1,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                <strong>Order Progress</strong>
              </Typography>
              <Stepper 
                activeStep={activeStep} 
                orientation="vertical" 
                sx={{ 
                  ml: -1,
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label} active={index <= activeStep} completed={index < activeStep}>
                    <StepLabel>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          color: index <= activeStep ? 'text.primary' : 'text.secondary',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            
            <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                <strong>Tip:</strong> Make sure all details are correct before placing the order.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateOrderPage;