import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, IconButton, Typography, TextField, Fab, Stack, alpha, Slide, Avatar, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import api from '../config/axios';
import { useCart } from '../contexts/CartContext';
import Loader from '../custom_components/Loader';

const TypingIndicator = () => {
  const theme = useTheme();
  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
    animation: 'typing-blink 1.4s infinite both',
    margin: '0 2px',
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
      <style>{`
        @keyframes typing-blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
      <Box sx={{ ...dotStyle, animationDelay: '0s' }} />
      <Box sx={{ ...dotStyle, animationDelay: '0.2s' }} />
      <Box sx={{ ...dotStyle, animationDelay: '0.4s' }} />
    </Box>
  );
};

const MessageContent = ({ text }) => {
  const theme = useTheme();
  // Regex to find markdown links: [text](url)
  const parts = text.split(/(\[.*?\]\(.*?\))/g);

  return (
    <Typography variant="body2" sx={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const linkText = match[1];
          const linkUrl = match[2];
          return (
            <RouterLink
              key={index}
              to={linkUrl}
              style={{
                color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.primary.dark,
                fontWeight: 'bold',
              }}
            >
              {linkText}
            </RouterLink>
          );
        }
        return part;
      })}
    </Typography>
  );
};

const Chatbot = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { fetchCart } = useCart(); // Get the function to refresh the cart
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm CropMate, your culinary assistant. How can I help you find products or recipes today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [size, setSize] = useState({ width: 360, height: 500 });
  const [isVisible, setIsVisible] = useState(() => localStorage.getItem('showChatbot') !== 'false');
  const isResizing = useRef(false);
  const resizeRef = useRef(null);

  useEffect(() => {
    const handleToggle = (event) => {
      if (open && !event.detail.visible) {
        setOpen(false);
      }
      setIsVisible(event.detail.visible);
    };
    window.addEventListener('chatbot-toggle', handleToggle);
    return () => window.removeEventListener('chatbot-toggle', handleToggle);
  }, [open]);

  const handleResizeMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const { initialX, initialY, initialWidth, initialHeight } = resizeRef.current;
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;

    const newWidth = initialWidth - dx;
    const newHeight = initialHeight - dy;

    const minWidth = 320;
    const maxWidth = window.innerWidth - 50;
    const minHeight = 400;
    const maxHeight = window.innerHeight - 130;

    setSize({
      width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
      height: Math.max(minHeight, Math.min(newHeight, maxHeight)),
    });
  }, []);

  const handleResizeMouseUp = useCallback(() => {
    isResizing.current = false;
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  }, [handleResizeMouseMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const suggestions = [
    "What's in my cart?",
    "Are mangoes in stock?",
    "Show me top rated recipes",
    "I have chicken and tomatoes",
  ];

  const handleSend = async (e, textToSend) => {
    if (e) e.preventDefault();
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = { sender: 'user', text: query };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    if (!textToSend) {
      setInput('');
    }
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', {
        query: query,
        history: currentMessages.slice(-6), // Send the last 6 messages for context
      });
      const aiMessage = { sender: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);

      // If the backend signals a cart update, refresh the cart context
      if (res.data.cartUpdated) {
        fetchCart();
      }
    } catch (error) {
      const errorMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    resizeRef.current = {
      initialX: e.clientX,
      initialY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
    };
    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Fab
        color="secondary"
        aria-label="open chatbot"
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 32 },
          right: { xs: 16, sm: 32 },
          zIndex: 1500,
          boxShadow: theme.shadows[6],
          display: { xs: 'none', sm: 'flex' } // Hide on mobile
        }}
      >
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 112 },
            right: { xs: 16, sm: 32 },
            width: { xs: 'calc(100vw - 32px)', sm: size.width },
            height: { xs: '70vh', sm: size.height },
            maxHeight: 'calc(100vh - 130px)',
            zIndex: 1499,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: theme.typography.fontFamily,
            display: { xs: 'none', sm: 'flex' } // Hide on mobile
          }}
        >
          {!isMobile && (
            <Box
              onMouseDown={handleResizeMouseDown}
              sx={{
                position: 'absolute',
                top: -2,
                left: -2,
                width: 12,
                height: 12,
                cursor: 'nwse-resize',
                zIndex: 1,
                borderTop: `3px solid ${alpha(theme.palette.primary.contrastText, 0.5)}`,
                borderLeft: `3px solid ${alpha(theme.palette.primary.contrastText, 0.5)}`,
                borderTopLeftRadius: '4px',
                '&:hover': { borderColor: alpha(theme.palette.primary.contrastText, 0.9) }
              }}
            />
          )}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <SmartToyIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>CropMate</Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <Paper
                    sx={{
                      p: 1.5, maxWidth: '80%',
                      bgcolor: msg.sender === 'user' ? 'secondary.main' : alpha(theme.palette.primary.main, 0.1),
                      color: msg.sender === 'user' ? 'secondary.contrastText' : 'text.primary',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}
                  >
                    <MessageContent text={msg.text} />
                  </Paper>
                </Box>
              ))}
              {messages.length === 1 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, pt: 1 }}>
                  {suggestions.map((suggestion, i) => (
                    <Chip
                      key={i}
                      label={suggestion}
                      onClick={() => handleSend(null, suggestion)}
                      clickable
                      sx={{ fontFamily: theme.typography.fontFamily }}
                    />
                  ))}
                </Stack>
              )}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '16px 16px 16px 4px' }}>
                    <Loader size="small" />
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          <Box component="form" onSubmit={handleSend} sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
            <TextField
              fullWidth variant="outlined" size="small" placeholder="Ask about products or recipes..."
              value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
              InputProps={{
                endAdornment: <IconButton type="submit" color="primary" disabled={loading || !input.trim()}><SendIcon /></IconButton>
              }}
            />
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default Chatbot;