import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, TextField, Button, Alert, Container, Stack, Card, CardContent, 
  CardActions, IconButton, Chip, Tooltip, LinearProgress, Grid, Divider, useTheme, alpha
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import CampaignIcon from '@mui/icons-material/Campaign';
import HistoryIcon from '@mui/icons-material/History';
import PreviewIcon from '@mui/icons-material/Preview';
import TemplateIcon from '@mui/icons-material/Description';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import adminService from '../../services/adminService';
import Loader from '../../custom_components/Loader';

const BroadcastPage = () => {
  const theme = useMuiTheme();
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);

  // Message templates
  const templates = [
    {
      id: 1,
      title: "New Feature Announcement",
      message: "We've just launched an exciting new feature! Check it out and let us know what you think.",
      link: ""
    },
    {
      id: 2,
      title: "Maintenance Notice",
      message: "We'll be performing scheduled maintenance on [DATE] from [TIME] to [TIME]. We apologize for any inconvenience.",
      link: ""
    },
    {
      id: 3,
      title: "Community Spotlight",
      message: "Check out our latest community spotlight post! We're celebrating the amazing contributions of our users.",
      link: ""
    },
    {
      id: 4,
      title: "Special Offer",
      message: "Exclusive offer for our loyal users! Get [PERCENTAGE]% off your next purchase. Use code [CODE] at checkout.",
      link: ""
    }
  ];

  // Load recent broadcasts from localStorage or mock data
  useEffect(() => {
    const savedBroadcasts = localStorage.getItem('recentBroadcasts');
    if (savedBroadcasts) {
      setRecentBroadcasts(JSON.parse(savedBroadcasts));
    } else {
      // Mock data for initial display
      setRecentBroadcasts([
        {
          id: 1,
          message: "Welcome to our new community platform! We're excited to have you here.",
          link: "/welcome",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          recipients: 1245
        },
        {
          id: 2,
          message: "Don't forget to check out our recipe contest this month!",
          link: "/contests",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          recipients: 987
        }
      ]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!message) {
      setError('Message cannot be empty.');
      return;
    }
    
    if (message.length > 500) {
      setError('Message is too long. Please keep it under 500 characters.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await adminService.sendBroadcast(message, link);
      setSuccess(response.message);
      
      // Add to recent broadcasts
      const newBroadcast = {
        id: Date.now(),
        message,
        link,
        timestamp: new Date().toISOString(),
        recipients: parseInt(response.message.match(/\d+/)[0]) // Extract number from response
      };
      
      const updatedBroadcasts = [newBroadcast, ...recentBroadcasts].slice(0, 10); // Keep only last 10
      setRecentBroadcasts(updatedBroadcasts);
      localStorage.setItem('recentBroadcasts', JSON.stringify(updatedBroadcasts));
      
      // Reset form
      setMessage('');
      setLink('');
      setActiveTemplate(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template) => {
    setMessage(template.message);
    setLink(template.link);
    setActiveTemplate(template.id);
    setShowTemplates(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const broadcastTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - broadcastTime) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}>
          Broadcast Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Send notifications to all active users and manage your broadcast history.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Broadcast Form */}
        <Grid item size={{ xs: 12, lg: 8 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
                    Create New Broadcast
                  </Typography>
                  
                  <TextField
                    label="Broadcast Message"
                    multiline
                    rows={4}
                    fullWidth
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    helperText={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>HTML tags like &lt;strong&gt; are supported.</span>
                        <span>{message.length}/500</span>
                      </Box>
                    }
                    inputProps={{ maxLength: 500 }}
                    InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      mb: 1
                    }}
                  />
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(message.length / 500) * 100} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: message.length > 450 ? theme.palette.error.main : theme.palette.primary.main
                      }
                    }} 
                  />
                </Box>
                
                <TextField
                  label="Optional Link"
                  fullWidth
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  helperText="An optional URL to include (e.g., /recipes/some-recipe-id or https://externalsite.com)."
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <Box>
                  <Button
                    startIcon={<TemplateIcon />}
                    onClick={() => setShowTemplates(!showTemplates)}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2, 
                      fontFamily: theme.typography.fontFamily,
                      mb: 2
                    }}
                  >
                    {showTemplates ? 'Hide Templates' : 'Show Templates'}
                  </Button>
                  
                  {showTemplates && (
                    <Grid container spacing={2}>
                      {templates.map((template) => (
                        <Grid item size={{ xs: 12, md: 6 }} key={template.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              border: activeTemplate === template.id ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                              borderColor: activeTemplate === template.id ? theme.palette.primary.main : 'divider',
                              '&:hover': {
                                boxShadow: 2
                              }
                            }}
                            onClick={() => applyTemplate(template)}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 1 }}>
                                {template.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                                {template.message}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
                
                {error && <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>{success}</Alert>}
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <Loader size="small" color="inherit" /> : <CampaignIcon />}
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'bold', 
                      borderRadius: '50px', 
                      px: 4,
                      flex: { xs: 1, sm: 'auto' }
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Broadcast'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setPreviewOpen(true)}
                    startIcon={<PreviewIcon />}
                    sx={{ 
                      fontFamily: theme.typography.fontFamily, 
                      fontWeight: 'bold', 
                      borderRadius: '50px', 
                      px: 4,
                      flex: { xs: 1, sm: 'auto' }
                    }}
                  >
                    Preview
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Broadcasts */}
        <Grid item size={{ xs: 12, lg: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                Recent Broadcasts
              </Typography>
            </Box>
            
            {recentBroadcasts.length > 0 ? (
              <Stack spacing={2}>
                {recentBroadcasts.map((broadcast) => (
                  <Card key={broadcast.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                        {broadcast.message}
                      </Typography>
                      {broadcast.link && (
                        <Chip 
                          icon={<LinkIcon />} 
                          label={broadcast.link} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mb: 1, fontFamily: theme.typography.fontFamily }}
                        />
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                          {formatTimeAgo(broadcast.timestamp)}
                        </Typography>
                        <Chip 
                          label={`${broadcast.recipients} recipients`} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontFamily: theme.typography.fontFamily
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                  No broadcast history yet.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Broadcast Tips */}
          <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                Broadcast Tips
              </Typography>
            </Box>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, mt: 0.5, mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Keep messages concise and clear
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, mt: 0.5, mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Personalize with user's name when possible
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, mt: 0.5, mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Include a clear call-to-action
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ErrorIcon sx={{ color: theme.palette.warning.main, mt: 0.5, mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Avoid sending too many broadcasts in a short period
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Preview Dialog */}
      {previewOpen && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.5)', 
            zIndex: 1300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <Box 
            sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: 3, 
              p: 3, 
              maxWidth: 500, 
              width: '100%',
              boxShadow: 24
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, mb: 2 }}>
              Broadcast Preview
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                  {message || 'Your message will appear here'}
                </Typography>
                {link && (
                  <Typography variant="body2" color="primary" sx={{ fontFamily: theme.typography.fontFamily, textDecoration: 'underline' }}>
                    {link}
                  </Typography>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Dismiss
                </Button>
                {link && (
                  <Button size="small" variant="contained" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Visit
                  </Button>
                )}
              </CardActions>
            </Card>
            
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setPreviewOpen(false)}
              sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}
            >
              Close Preview
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default BroadcastPage;