import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, TextField, IconButton, CircularProgress, Alert, useTheme, useMediaQuery, InputAdornment, alpha, Stack, Grid } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import messagingService from '../services/messagingService';

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
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [convoSearch, setConvoSearch] = useState('');
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
      setError('Failed to load conversations.');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, convos: false }));
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = useCallback(async (convo) => {
    setSelectedConversation(convo);
    setMessages([]);
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
      setError('Failed to load messages.');
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
  }, [location.state, user, loading.convos, conversations, navigate, handleSelectConversation]);

  useEffect(() => {
    if (socket) {
      socket.on('new_private_message', (message) => {
        if (selectedConversation && message.conversation === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      return () => socket.off('new_private_message');
    }
  }, [socket, selectedConversation, fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const recipient = selectedConversation.participants.find(p => p._id !== user.id);
    if (!recipient) {
      setError('Could not find a recipient for this message.');
      return;
    }

    const isPlaceholder = !!selectedConversation.isPlaceholder;

    setIsSending(true);
    setNewMessage('');

    const tempMessage = {
      _id: Date.now(),
      sender: { _id: user.id, username: user.username, profilePic: user.profilePic },
      content: newMessage,
      createdAt: new Date().toISOString(),
      isSending: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const sentMessage = await messagingService.sendMessage(recipient._id, tempMessage.content);
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
      setError('Failed to send message.');
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const otherParticipant = convo.participants.find(p => p._id !== user.id);
    return otherParticipant?.username.toLowerCase().includes(convoSearch.toLowerCase());
  });

  const ConversationListContent = (
    <>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>Inbox</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          variant="outlined"
          value={convoSearch}
          onChange={(e) => setConvoSearch(e.target.value)}
          sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '50px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
          InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
        />
      </Box>
      {loading.convos ? <CircularProgress sx={{ m: 'auto' }} /> : (
        <List sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
          {filteredConversations.map(convo => {
            const otherParticipant = convo.participants.find(p => p._id !== user.id);
            return (
              <ListItemButton
                key={convo._id}
                onClick={() => handleSelectConversation(convo)}
                selected={selectedConversation?._id === convo._id}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemAvatar><Avatar src={otherParticipant?.profilePic ? `${process.env.REACT_APP_API_URL}${otherParticipant.profilePic}` : undefined} /></ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{otherParticipant?.username || 'Unknown User'}</Typography>}
                  secondary={
                    <Typography noWrap variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {convo.lastMessage?.sender ? `${convo.lastMessage.sender._id === user.id ? 'You: ' : ''}${convo.lastMessage.content}` : convo.lastMessage?.content || 'No messages yet'}
                    </Typography>
                  }
                />
                {convo.unreadCount > 0 && <Box sx={{ bgcolor: 'secondary.main', color: 'white', borderRadius: '50%', px: 1, fontSize: '0.75rem' }}>{convo.unreadCount}</Box>}
              </ListItemButton>
            );
          })}
        </List>
      )}
    </>
  );

  const ChatWindow = (
    <>
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        {isMobile && (
          <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 1.5 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar src={selectedConversation?.participants.find(p => p._id !== user.id)?.profilePic ? `${process.env.REACT_APP_API_URL}${selectedConversation.participants.find(p => p._id !== user.id).profilePic}` : undefined} sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}>
          {selectedConversation?.participants.find(p => p._id !== user.id)?.username}
        </Typography>
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
        {loading.messages ? <CircularProgress sx={{ display: 'block', m: 'auto' }} /> : (
          messages.map((msg, index) => {
            const isSender = msg.sender._id === user.id;
            const showAvatar = !isSender && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
            return (
              <Box
                key={msg._id}
                sx={{
                  display: 'flex',
                  justifyContent: isSender ? 'flex-end' : 'flex-start',
                  mb: 1,
                  gap: 1,
                  alignItems: 'flex-end',
                }}
              >
                {!isSender && (
                  <Avatar
                    src={msg.sender.profilePic ? `${process.env.REACT_APP_API_URL}${msg.sender.profilePic}` : undefined}
                    sx={{ width: 32, height: 32, visibility: showAvatar ? 'visible' : 'hidden' }}
                  />
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isSender ? 'primary.main' : 'background.paper',
                    color: isSender ? 'primary.contrastText' : 'text.primary',
                    opacity: msg.isSending ? 0.6 : 1,
                    borderRadius: isSender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    boxShadow: theme.shadows[1],
                  }}
                >
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7, fontFamily: theme.typography.fontFamily }}>
                    {format(new Date(msg.createdAt), 'p')}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="filled"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            sx={{ '& .MuiFilledInput-root': { borderRadius: '50px', '&:before, &:after': { display: 'none' } }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
          />
          <IconButton type="submit" color="primary" sx={{ ml: 1 }} disabled={isSending || !newMessage.trim()}>
            {isSending ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </>
  );

  return (
    <Box sx={{ mt: 8, height: 'calc(100vh - 64px)' }}>
      {isMobile ? (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? ChatWindow : ConversationListContent}
        </Box>
      ) : (
        <Grid container sx={{ height: '100%' }}>
          <Grid size={{ md: 4, lg: 3 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
            {ConversationListContent}
          </Grid>
          <Grid size={{ md: 8, lg: 9 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedConversation ? ChatWindow : (
              <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
                <Stack alignItems="center" spacing={2}>
                  <ChatIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  <Typography variant="h5" sx={{ fontFamily: theme.typography.fontFamily }}>Select a conversation</Typography>
                  <Typography sx={{ fontFamily: theme.typography.fontFamily }}>or start a new one from a user's profile.</Typography>
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MessengerPage;