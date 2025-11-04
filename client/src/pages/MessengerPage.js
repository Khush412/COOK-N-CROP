import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  TextField, 
  IconButton, 
  CircularProgress, 
  useTheme, 
  useMediaQuery, 
  InputAdornment, 
  Stack, 
  Grid,
  Badge,
  Divider,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  ListItemIcon,
  Popover,
  alpha,
  Collapse,
  Drawer
} from '@mui/material';
import { 
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  ThumbUp as ThumbUpIcon,
  Favorite as FavoriteIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  SentimentVerySatisfied as SentimentVerySatisfiedIcon,
  Mood as MoodIcon,
  AddReaction as AddReactionIcon,
  Reply as ReplyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Forum as ForumIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import messagingService from '../services/messagingService';
import userService from '../services/userService';

const MessengerPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, fetchUnreadMessageCount } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState({ convos: true, messages: false });
  const [isSending, setIsSending] = useState(false);
  const [convoSearch, setConvoSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [processingReactions, setProcessingReactions] = useState({});
  const [messagesOpen, setMessagesOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, convos: true }));
      const data = await messagingService.getConversations();
      setConversations(data);
      return data;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, convos: false }));
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch online users from socket
  useEffect(() => {
    if (socket) {
      socket.emit('request_online_users');
      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });
      
      return () => {
        socket.off('online_users');
      };
    }
  }, [socket]);

  const handleSelectConversation = useCallback(async (convo) => {
    setSelectedConversation(convo);
    setMessages([]);
    setReplyingTo(null);
    if (convo.isPlaceholder) {
      return; // Don't fetch messages for a placeholder
    }
    setConversations(prev => prev.filter(c => !c.isPlaceholder));
    setLoading(prev => ({ ...prev, messages: true }));
    try {
      const data = await messagingService.getMessages(convo._id);
      setMessages(data);
      // Mark conversation as read locally and refetch global count
      setConversations(prev => prev.map(c => c._id === convo._id ? { ...c, unreadCount: 0 } : c));
      fetchUnreadMessageCount();
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [fetchUnreadMessageCount]);

  // This effect handles starting a new conversation from a user profile
  useEffect(() => {
    const newConvoUser = location.state?.newConversationWith;
    if (newConvoUser && user && !loading.convos) {
      const existingConvo = conversations.find(c =>
        c.participants.length === 2 && c.participants.some(p => p._id === newConvoUser._id)
      );

      if (existingConvo) {
        handleSelectConversation(existingConvo);
      } else {
        const placeholderConvo = {
          _id: `temp_${newConvoUser._id}`,
          participants: [
            { _id: user.id, username: user.username, profilePic: user.profilePic },
            { _id: newConvoUser._id, username: newConvoUser.username, profilePic: newConvoUser.profilePic }
          ],
          lastMessage: { content: `Start a conversation with ${newConvoUser.username}` },
          isPlaceholder: true,
          unreadCount: 0,
        };
        setConversations(prev => [placeholderConvo, ...prev.filter(c => !c.isPlaceholder)]);
        setSelectedConversation(placeholderConvo);
        setMessages([]);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, user, loading.convos, conversations, navigate, handleSelectConversation, location.pathname]);

  useEffect(() => {
    if (socket) {
      socket.on('new_private_message', (message) => {
        if (selectedConversation && message.conversation === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      // Listen for message reactions
      socket.on('message_reaction', (data) => {
        console.log('Received reaction update:', data);
        if (selectedConversation && data.conversationId === selectedConversation._id) {
          setMessageReactions(prev => ({
            ...prev,
            [data.messageId]: {
              ...prev[data.messageId],
              [data.userId]: data.reaction
            }
          }));
        }
      });

      // Add this to request initial reactions for messages
      if (selectedConversation && messages.length > 0) {
        socket.emit('request_message_reactions', {
          conversationId: selectedConversation._id,
          messageIds: messages.map(m => m._id)
        });
      }

      return () => {
        socket.off('new_private_message');
        socket.off('message_reaction');
      };
    }
  }, [socket, selectedConversation, fetchConversations, messages]);

  // Add this effect to request reactions when messages change
  useEffect(() => {
    if (socket && selectedConversation && messages.length > 0) {
      socket.emit('request_message_reactions', {
        conversationId: selectedConversation._id,
        messageIds: messages.map(m => m._id)
      });
    }
  }, [socket, selectedConversation, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const recipient = selectedConversation.participants.find(p => p._id !== user.id);
    if (!recipient) {
      return console.error('Could not find a recipient for this message.');
    }

    const isPlaceholder = !!selectedConversation.isPlaceholder;

    setIsSending(true);
    const messageContent = replyingTo ? `Reply to: ${replyingTo.content}\n\n${newMessage}` : newMessage;
    setNewMessage('');
    setReplyingTo(null);

    const tempMessage = {
      _id: Date.now(),
      sender: { _id: user.id, username: user.username, profilePic: user.profilePic },
      content: messageContent,
      createdAt: new Date().toISOString(),
      isSending: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const sentMessage = await messagingService.sendMessage(recipient._id, messageContent);
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? sentMessage : m));
      if (isPlaceholder) {
        // If it was a placeholder, we need to fetch the new conversations and select the real one.
        const newConversations = await fetchConversations();
        const newConvo = newConversations.find(c => c._id === sentMessage.conversation);
        if (newConvo) {
          setSelectedConversation(newConvo);
        }
      } else {
        // If it's an existing conversation, just refresh the list to update last message and order.
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    } finally {
      setIsSending(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      const recipient = selectedConversation.participants.find(p => p._id !== user.id);
      await userService.blockUser(recipient._id);
      setBlockDialogOpen(false);
      // Remove conversation from list
      setConversations(prev => prev.filter(c => c._id !== selectedConversation._id));
      setSelectedConversation(null);
      fetchConversations();
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleDeleteConversation = async () => {
    try {
      // Call the API to delete the conversation from the database
      await messagingService.deleteConversation(selectedConversation._id);
      
      // Remove conversation from local state
      setConversations(prev => prev.filter(c => c._id !== selectedConversation._id));
      setSelectedConversation(null);
      setDeleteDialogOpen(false);
      
      // Refresh the conversations list
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setDeleteDialogOpen(false);
      // Show error to user with a snackbar or alert
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleAddReaction = (messageId, reaction) => {
    console.log(`Adding reaction ${reaction} to message ${messageId}`);
    
    // Set processing state
    setProcessingReactions(prev => ({
      ...prev,
      [messageId]: true
    }));
    
    // Update local state immediately for responsive UI
    setMessageReactions(prev => {
      const currentReactions = prev[messageId] || {};
      // Toggle reaction - if user already reacted with same emoji, remove it
      if (currentReactions[user.id] === reaction) {
        const newReactions = { ...currentReactions };
        delete newReactions[user.id];
        return {
          ...prev,
          [messageId]: newReactions
        };
      }
      // Otherwise, set the new reaction
      return {
        ...prev,
        [messageId]: {
          ...currentReactions,
          [user.id]: reaction
        }
      };
    });
    
    // Emit to socket for real-time updates
    if (socket) {
      socket.emit('add_reaction', {
        messageId,
        reaction,
        conversationId: selectedConversation._id,
        userId: user.id
      });
    }
    
    // Clear processing state after a short delay
    setTimeout(() => {
      setProcessingReactions(prev => ({
        ...prev,
        [messageId]: false
      }));
    }, 500);
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const filteredConversations = conversations.filter(convo => {
    const otherParticipant = convo.participants.find(p => p._id !== user.id);
    return otherParticipant?.username.toLowerCase().includes(convoSearch.toLowerCase());
  });

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'p');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const isMessageRead = (message) => {
    // A message is considered read if it's from the current user or if it's been read by the recipient
    return message.sender._id === user.id || message.readBy.includes(selectedConversation.participants.find(p => p._id !== user.id)?._id);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation sidebar component similar to Community.js
  const NavigationSidebar = (
    <Paper
      sx={{
        height: '100%',
        borderRadius: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.default,
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
          Messages
        </Typography>
        <IconButton onClick={toggleSidebar} size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search conversations..."
        variant="outlined"
        value={convoSearch}
        onChange={(e) => setConvoSearch(e.target.value)}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': { 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }, 
          '& .MuiInputBase-input': { 
            fontFamily: theme.typography.fontFamily 
          },
          maxWidth: '100%',
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment>,
        }}
        InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
      />

      {/* Messages Section - Collapsible */}
      <ListItemButton 
        onClick={() => setMessagesOpen(!messagesOpen)}
        sx={{ 
          borderRadius: 2, 
          mb: 1,
          backgroundColor: messagesOpen ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }
        }}
      >
        <ListItemIcon>
          <ChatIcon sx={{ color: theme.palette.primary.main }} />
        </ListItemIcon>
        <ListItemText 
          primary="Conversations" 
          primaryTypographyProps={{ fontWeight: 700, color: 'primary.main' }} 
        />
        {messagesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>
      <Collapse in={messagesOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {loading.convos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(convo => {
              const otherParticipant = convo.participants.find(p => p._id !== user.id);
              const isOnline = onlineUsers[otherParticipant?._id];
              return (
                <ListItemButton
                  key={convo._id}
                  onClick={() => handleSelectConversation(convo)}
                  selected={selectedConversation?._id === convo._id}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 0.5,
                    pl: 4,
                    py: 1,
                    bgcolor: selectedConversation?._id === convo._id ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedConversation?._id === convo._id ? 'action.selected' : 'action.hover'
                    },
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant={isOnline ? "dot" : "standard"}
                      color="success"
                    >
                      <Avatar 
                        src={otherParticipant?.profilePic && otherParticipant.profilePic.startsWith('http') ? otherParticipant.profilePic : otherParticipant?.profilePic ? `${process.env.REACT_APP_API_URL}${otherParticipant.profilePic}` : undefined} 
                        sx={{ width: 32, height: 32 }}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} component="div">
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, maxWidth: '60%' }}>
                          {otherParticipant?.username || 'Unknown User'}
                        </Typography>
                        {convo.lastMessage && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, flexShrink: 0, ml: 1 }}>
                            {formatMessageTime(convo.lastMessage.createdAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} component="div">
                        <Typography noWrap variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} component="div">
                          {convo.lastMessage?.sender ? `${convo.lastMessage.sender._id === user.id ? 'You: ' : ''}${convo.lastMessage.content}` : convo.lastMessage?.content || 'No messages yet'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 1 }} component="div">
                          {convo.unreadCount > 0 && (
                            <Chip 
                              label={convo.unreadCount} 
                              size="small" 
                              sx={{ 
                                height: 18, 
                                width: 18, 
                                borderRadius: '50%', 
                                p: 0,
                                minWidth: 18,
                                '& .MuiChip-label': {
                                  px: 0.5,
                                  fontSize: '0.6rem'
                                }
                              }} 
                              color="secondary" 
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />

                </ListItemButton>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No conversations found
            </Typography>
          )}
        </List>
      </Collapse>
    </Paper>
  );

  // No conversation selected view
  const NoConversationSelected = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      p: 3,
      textAlign: 'center'
    }}>
      <ChatIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        Welcome to Messages
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        Select a conversation from the list to start chatting, or navigate to a user's profile to start a new conversation.
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<PersonAddIcon />} 
        onClick={() => navigate('/community')}
        sx={{ borderRadius: 2 }}
      >
        Find Users to Message
      </Button>
    </Box>
  );

  // Main chat window
  const ChatWindow = selectedConversation ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat header */}
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            {isMobile && (
              <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant={onlineUsers[selectedConversation?.participants.find(p => p._id !== user.id)?._id] ? "dot" : "standard"}
                color="success"
              >
                <Avatar 
                  src={selectedConversation?.participants.find(p => p._id !== user.id)?.profilePic && selectedConversation.participants.find(p => p._id !== user.id).profilePic.startsWith('http') ? selectedConversation.participants.find(p => p._id !== user.id).profilePic : selectedConversation?.participants.find(p => p._id !== user.id)?.profilePic ? `${process.env.REACT_APP_API_URL}${selectedConversation.participants.find(p => p._id !== user.id).profilePic}` : undefined} 
                  sx={{ width: 40, height: 40 }}
                />
              </Badge>
            </ListItemAvatar>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
                {selectedConversation?.participants.find(p => p._id !== user.id)?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                {onlineUsers[selectedConversation?.participants.find(p => p._id !== user.id)?._id] ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Messages area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
        {loading.messages ? (
          <CircularProgress sx={{ display: 'block', m: 'auto', mt: 4 }} />
        ) : (
          <>
            {messages.map((msg, index) => {
              const isSender = msg.sender._id === user.id;
              const showAvatar = !isSender && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
              const isRead = isMessageRead(msg);
              const reactions = messageReactions[msg._id] || {};
              
              return (
                <Box
                  key={msg._id}
                  sx={{
                    display: 'flex',
                    justifyContent: isSender ? 'flex-end' : 'flex-start',
                    mb: 2,
                    gap: 1,
                    alignItems: 'flex-end',
                  }}
                >
                  {!isSender && (
                    <Avatar
                      src={msg.sender.profilePic && msg.sender.profilePic.startsWith('http') ? msg.sender.profilePic : msg.sender.profilePic ? `${process.env.REACT_APP_API_URL}${msg.sender.profilePic}` : undefined}
                      sx={{ width: 32, height: 32, visibility: showAvatar ? 'visible' : 'hidden' }}
                    />
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: isSender ? 'primary.main' : 'background.paper',
                        color: isSender ? 'primary.contrastText' : 'text.primary',
                        opacity: msg.isSending ? 0.6 : 1,
                        borderRadius: isSender ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        boxShadow: theme.shadows[1],
                        position: 'relative',
                        maxWidth: '100%',
                        wordBreak: 'break-word'
                      }}
                    >
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                    
                    {/* Reactions */}
                    {Object.keys(reactions).length > 0 && (
                      <Box sx={{ display: 'flex', mt: 0.5, gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(reactions).map(([userId, reaction]) => (
                          <Chip
                            key={`${msg._id}-${userId}`}
                            label={
                              <span>
                                {reaction} {userId === user.id ? '(You)' : ''}
                              </span>
                            }
                            size="small"
                            sx={{
                              height: 24,
                              borderRadius: '12px',
                              bgcolor: userId === user.id ? 'primary.light' : 'background.paper',
                              color: userId === user.id ? 'primary.contrastText' : 'text.primary',
                              border: `1px solid ${theme.palette.divider}`,
                              opacity: processingReactions[msg._id] ? 0.7 : 1,
                              transition: 'opacity 0.2s',
                              '& .MuiChip-label': {
                                px: 0.75,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {/* Message actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7, fontFamily: theme.typography.fontFamily, mr: 1 }}>
                        {format(new Date(msg.createdAt), 'p')}
                      </Typography>
                      {isSender && (
                        isRead ? <DoneAllIcon sx={{ fontSize: '1rem', color: 'primary.main' }} /> : <CheckIcon sx={{ fontSize: '1rem' }} />
                      )}
                      <IconButton 
                        size="small" 
                        sx={{ ml: 1, p: 0.5 }}
                        onClick={(e) => {
                          setCurrentMessageId(msg._id);
                          setReactionAnchorEl(e.currentTarget);
                        }}
                        disabled={processingReactions[msg._id]}
                      >
                        <AddReactionIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message input area */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {replyingTo && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'action.hover', 
            borderRadius: 1, 
            p: 1, 
            mb: 1 
          }}>
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Replying to: {replyingTo.content.substring(0, 30)}...
            </Typography>
            <IconButton size="small" onClick={() => setReplyingTo(null)}>
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 3,
                bgcolor: 'background.paper'
              }, 
              '& .MuiInputBase-input': { 
                fontFamily: theme.typography.fontFamily 
              } 
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage} 
                    disabled={isSending || !newMessage.trim()}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'action.disabled', color: 'action.disabled' }
                    }}
                  >
                    {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            multiline
            maxRows={4}
          />
        </Stack>
      </Paper>
    </Box>
  ) : NoConversationSelected;

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      pt: 8
    }}>
      {/* Mobile sidebar toggle button - always visible on mobile */}
      <IconButton
        onClick={() => setMobileDrawerOpen(true)}
        sx={{
          position: 'fixed',
          left: 8,
          top: 72,
          zIndex: 1200,
          width: 40,
          height: 40,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '50%',
          boxShadow: 2,
          '&:hover': {
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
          },
          display: { xs: 'flex', md: 'none' } // Only show on mobile
        }}
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {/* Left sidebar toggle button - desktop only */}
      {!sidebarOpen && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1200,
            width: 24,
            height: 24,
            minHeight: 0,
            minWidth: 0,
            p: 0,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '50%',
            boxShadow: 2,
            '&:hover': {
              bgcolor: theme.palette.background.paper,
              boxShadow: 4,
            },
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* Left sidebar - desktop version */}
      {sidebarOpen && (
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            top: 64,
            left: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 1100,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
            boxSizing: 'border-box',
            display: { xs: 'none', md: 'block' },
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'transparent',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
            },
          }}
        >
          {NavigationSidebar}
        </Box>
      )}

      {/* Mobile drawer for sidebar */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{
          sx: {
            width: 300,
            maxWidth: '90vw',
            bgcolor: theme.palette.background.default,
          }
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {NavigationSidebar}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { xs: 0, md: sidebarOpen ? '300px' : 0 },
          transition: 'margin 0.3s ease',
          height: 'calc(100vh - 64px)',
          pt: 2,
        }}
      >
        <Paper sx={{ 
          height: '100%', 
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {ChatWindow}
        </Paper>
      </Box>

      {/* Menus and dialogs */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setBlockDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setDeleteDialogOpen(true); setAnchorEl(null); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Conversation</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Block User?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to block this user? You won't be able to see their messages or start a conversation with them.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBlockUser} color="primary" autoFocus>
            Block
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Conversation?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConversation} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        onClose={() => setReactionAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack direction="row" spacing={1} p={1}>
          <IconButton onClick={() => handleAddReaction(currentMessageId, '👍')}>
            <ThumbUpIcon />
          </IconButton>
          <IconButton onClick={() => handleAddReaction(currentMessageId, '❤️')}>
            <FavoriteIcon />
          </IconButton>
          <IconButton onClick={() => handleAddReaction(currentMessageId, '😊')}>
            <SentimentSatisfiedIcon />
          </IconButton>
          <IconButton onClick={() => handleAddReaction(currentMessageId, '😄')}>
            <SentimentVerySatisfiedIcon />
          </IconButton>
          <IconButton onClick={() => handleAddReaction(currentMessageId, '😂')}>
            <MoodIcon />
          </IconButton>
        </Stack>
      </Popover>
    </Box>
  );
};

export default MessengerPage;