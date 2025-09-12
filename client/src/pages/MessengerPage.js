import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, Grid, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, IconButton, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import messagingService from '../services/messagingService';

const MessengerPage = () => {
  const { user } = useAuth();
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
    setLoading(prev => ({ ...prev, messages: true }));
    try {
      const data = await messagingService.getMessages(convo._id);
      setMessages(data);
      // Mark conversation as read locally
      setConversations(prev => prev.map(c => c._id === convo._id ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, []);

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

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', mt: 8 }}>
      <Paper sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>Inbox</Typography>
        {loading.convos ? <CircularProgress sx={{ m: 'auto' }} /> : (
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {conversations.map(convo => {
              const otherParticipant = convo.participants.find(p => p._id !== user.id);
              return (
                <ListItemButton
                  key={convo._id}
                  onClick={() => handleSelectConversation(convo)}
                  selected={selectedConversation?._id === convo._id}
                >
                  <ListItemAvatar><Avatar src={otherParticipant?.profilePic} /></ListItemAvatar>
                  <ListItemText
                    primary={otherParticipant?.username || 'Unknown User'}
                    secondary={
                      <Typography noWrap variant="body2" color="text.secondary">
                        {convo.lastMessage?.sender
                          ? `${convo.lastMessage.sender.username}: ${convo.lastMessage.content}`
                          : convo.lastMessage?.content || 'No messages yet'}
                      </Typography>
                    }
                  />
                  {convo.unreadCount > 0 && <Box sx={{ bgcolor: 'secondary.main', color: 'white', borderRadius: '50%', px: 1, fontSize: '0.75rem' }}>{convo.unreadCount}</Box>}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Paper>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedConversation ? (
          <>
            <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
              <Avatar src={selectedConversation.participants.find(p => p._id !== user.id)?.profilePic} sx={{ mr: 2 }} />
              <Typography variant="h6">{selectedConversation.participants.find(p => p._id !== user.id)?.username}</Typography>
            </Paper>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
              {loading.messages ? <CircularProgress sx={{ display: 'block', m: 'auto' }} /> : (
                messages.map(msg => (
                  <Box
                    key={msg._id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender._id === user.id ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '70%',
                        bgcolor: msg.sender._id === user.id ? 'primary.main' : 'background.paper',
                        color: msg.sender._id === user.id ? 'primary.contrastText' : 'text.primary',
                        opacity: msg.isSending ? 0.6 : 1,
                      }}
                      elevation={2}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                        {format(new Date(msg.createdAt), 'p')}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <IconButton type="submit" color="primary" sx={{ ml: 1 }} disabled={isSending || !newMessage.trim()}>
                  {isSending ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </Box>
            </Paper>
          </>
        ) : (
          <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h5">Select a conversation to start chatting</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessengerPage;