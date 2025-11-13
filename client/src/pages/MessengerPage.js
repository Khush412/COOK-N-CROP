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
  Drawer,
  CircularProgress,
  Fab
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
  Menu as MenuIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Description as DescriptionIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  MusicNote as MusicNoteIcon,
  Edit as EditIcon,
  Replay as ReplayIcon,
  FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import messagingService from '../services/messagingService';
import userService from '../services/userService';
import Loader from '../custom_components/Loader';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

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
  const [messageSearch, setMessageSearch] = useState('');
  const [messageSearchResults, setMessageSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = useState(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMessageDialogOpen, setDeleteMessageDialogOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [processingReactions, setProcessingReactions] = useState({});
  const [messagesOpen, setMessagesOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  const [mediaPreview, setMediaPreview] = useState({
    open: false,
    url: '',
    type: '',
    filename: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, convos: true }));
      const data = await messagingService.getConversations();
      console.log('Fetched conversations:', data);
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

  // Periodically refresh conversations to ensure they stay in sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading.convos) {
        fetchConversations();
      }
    }, 15000); // Refresh every 15 seconds instead of 30

    return () => clearInterval(interval);
  }, [fetchConversations, loading.convos]);

  // Comprehensive validation of all conversations
  useEffect(() => {
    // Only run this validation when we have messages loaded for the selected conversation
    if (selectedConversation && messages.length > 0) {
      setConversations(prev => {
        return prev.map(convo => {
          // If this is the selected conversation, update its lastMessage
          if (convo._id === selectedConversation._id) {
            // If there are no messages, set lastMessage to null
            if (messages.length === 0) {
              return { ...convo, lastMessage: null };
            }
            // Otherwise, set lastMessage to the actual last message
            const lastMessage = messages[messages.length - 1];
            return { ...convo, lastMessage: lastMessage };
          }
          // For other conversations, leave them as they are
          return convo;
        });
      });
    }
  }, [messages, selectedConversation]);

  // Additional validation to ensure conversation list consistency
  useEffect(() => {
    const validateConversations = async () => {
      if (selectedConversation) {
        // If we have a selected conversation, check if it should show "No messages yet"
        setConversations(prev => {
          return prev.map(convo => {
            if (convo._id === selectedConversation._id) {
              // If we have no messages locally, or if the last message has no content
              if (messages.length === 0 || (messages.length > 0 && (!messages[messages.length - 1].content || !messages[messages.length - 1].content.trim()))) {
                return { ...convo, lastMessage: null };
              }
              // If we have messages, make sure the lastMessage is correctly set
              else if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                return { ...convo, lastMessage: lastMessage };
              }
            }
            return convo;
          });
        });
      }
    };

    // Run validation when messages or selectedConversation changes
    validateConversations();
  }, [messages.length, messages, selectedConversation]);

  // Immediate validation when messages change
  useEffect(() => {
    if (selectedConversation) {
      // Update the conversation's lastMessage immediately when messages change
      setConversations(prev => {
        return prev.map(convo => {
          if (convo._id === selectedConversation._id) {
            // If we have no messages, set lastMessage to null
            if (messages.length === 0) {
              return { ...convo, lastMessage: null };
            }
            // If we have messages, set lastMessage to the last message
            const lastMessage = messages[messages.length - 1];
            return { ...convo, lastMessage: lastMessage };
          }
          return convo;
        });
      });
    }
  }, [messages, selectedConversation]);

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
      // Resolve referenced messages to ensure they have full data
      const messagesWithResolvedReferences = data.map(msg => {
        if (msg.referencedMessage && typeof msg.referencedMessage === 'string') {
          // If referencedMessage is just an ID, try to find the full message in the data
          const referencedMsg = data.find(m => m._id === msg.referencedMessage);
          if (referencedMsg) {
            return { ...msg, referencedMessage: referencedMsg };
          }
        }
        return msg;
      });
      setMessages(messagesWithResolvedReferences);
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
          // Resolve referenced message if it's just an ID
          let resolvedMessage = message;
          if (message.referencedMessage && typeof message.referencedMessage === 'string') {
            // Try to find the referenced message in the current messages
            const referencedMsg = messages.find(m => m._id === message.referencedMessage);
            if (referencedMsg) {
              resolvedMessage = { ...message, referencedMessage: referencedMsg };
            }
          }
          setMessages(prev => [...prev, resolvedMessage]);
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

      // Listen for message reactions response
      socket.on('message_reactions_response', (data) => {
        if (selectedConversation && data.conversationId === selectedConversation._id) {
          setMessageReactions(prev => ({
            ...prev,
            ...data.reactions
          }));
        }
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        const { userId, isTyping } = data;
        if (selectedConversation && selectedConversation.participants.some(p => p._id === userId)) {
          setTypingUsers(prev => {
            if (isTyping) {
              // Add user to typing list if not already there
              if (!prev.includes(userId)) {
                return [...prev, userId];
              }
              return prev;
            } else {
              // Remove user from typing list
              return prev.filter(id => id !== userId);
            }
          });
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
        socket.off('message_reactions_response');
        socket.off('user_typing');
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

  // Handle typing indicator
  useEffect(() => {
    let typingTimeout;
    if (socket && selectedConversation && newMessage.trim()) {
      // Send typing indicator
      socket.emit('typing', {
        conversationId: selectedConversation._id,
        userId: user.id,
        isTyping: true
      });

      // Clear typing indicator after delay
      typingTimeout = setTimeout(() => {
        socket.emit('typing', {
          conversationId: selectedConversation._id,
          userId: user.id,
          isTyping: false
        });
      }, 1000);
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        // Send typing stopped indicator
        if (socket && selectedConversation) {
          socket.emit('typing', {
            conversationId: selectedConversation._id,
            userId: user.id,
            isTyping: false
          });
        }
      }
    };
  }, [newMessage, socket, selectedConversation, user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachmentPreviews.length === 0) || !selectedConversation || isSending) return;

    const recipient = selectedConversation.participants?.find(p => p._id !== user.id);
    if (!recipient) {
      return console.error('Could not find a recipient for this message.');
    }

    const isPlaceholder = !!selectedConversation.isPlaceholder;

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage('');
    setReplyingTo(null);
    setAttachmentPreviews([]);

    // Create temp message for immediate UI feedback
    const tempMessage = {
      _id: Date.now(),
      sender: { _id: user.id, username: user.username, profilePic: user.profilePic },
      content: messageContent,
      attachments: attachmentPreviews.map(preview => ({ url: preview.url, type: preview.type })),
      createdAt: new Date().toISOString(),
      isSending: true,
      referencedMessage: replyingTo || null // Add reference to replied message
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      let sentMessage;
      // Check if we have files to upload
      if (attachmentPreviews.length > 0) {
        // If there are attachments, we need to send them via the upload endpoint
        const files = attachmentPreviews.map(preview => preview.file);
        sentMessage = await messagingService.sendAttachment(
          recipient._id, 
          messageContent, 
          files,
          replyingTo ? replyingTo._id : null // Pass the referenced message ID
        );
      } else {
        // Regular text message
        sentMessage = await messagingService.sendMessage(
          recipient._id, 
          messageContent,
          replyingTo ? replyingTo._id : null // Pass the referenced message ID
        );
      }
      
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? {...sentMessage, isSending: false} : m));
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
      // Mark the message as failed to send
      setMessages(prev => prev.map(m => 
        m._id === tempMessage._id ? {...m, isSending: false, failedToSend: true} : m
      ));
    } finally {
      setIsSending(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      console.log('Current reactions for message:', messageId, currentReactions);
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
    if (socket && selectedConversation) {
      socket.emit('add_reaction', {
        messageId,
        reaction,
        conversationId: selectedConversation._id,
        userId: user.id
      });
    } else {
      console.warn('Cannot emit reaction: socket or selectedConversation not available');
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

  const handleAttachmentClick = () => {
    // Remove the type parameter since we'll auto-detect
    fileInputRef.current.accept = '*/*'; // Accept all file types
    fileInputRef.current.click();
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const handleEmojiPickerOpen = (event) => {
    setEmojiAnchorEl(event.currentTarget);
    setEmojiPickerOpen(true);
  };

  // Add the missing handleFileChange function to support multiple attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = [];
      
      files.forEach(file => {
        // Auto-detect file type
        let fileType = 'document'; // default
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
        }
        
        // Additional check for common file extensions if MIME type is generic
        if (fileType === 'document') {
          const fileName = file.name.toLowerCase();
          if (fileName.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/)) {
            fileType = 'audio';
          } else if (fileName.match(/\.(mp4|mov|avi|mkv|webm)$/)) {
            fileType = 'video';
          } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
            fileType = 'image';
          }
        }
        
        // Create preview for images and videos
        if (fileType === 'image' || fileType === 'video') {
          const reader = new FileReader();
          reader.onload = (event) => {
            newPreviews.push({
              url: event.target.result,
              type: fileType,
              file: file,
              name: file.name,
              size: file.size
            });
            
            // Update state when all files are processed
            if (newPreviews.length === files.length) {
              setAttachmentPreviews(prev => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        } else {
          // For documents and audio, just show the filename
          newPreviews.push({
            url: file.name,
            type: fileType,
            file: file,
            name: file.name,
            size: file.size
          });
          
          // Update state when all files are processed
          if (newPreviews.length === files.length) {
            setAttachmentPreviews(prev => [...prev, ...newPreviews]);
          }
        }
      });
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const otherParticipant = convo.participants.find(p => p._id !== user.id);
    return otherParticipant?.username.toLowerCase().includes(convoSearch.toLowerCase());
  });

  const formatMessageTime = (dateString) => {
    // Handle undefined or null dateString
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86600) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (isToday(date)) {
      return format(date, 'p');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getConversationLastMessageText = (convo) => {
    // Special case: if this is the selected conversation and we have messages loaded,
    // always use the actual messages array to determine what to display
    if (selectedConversation && selectedConversation._id === convo._id && messages.length > 0) {
      // Get the actual last message from our loaded messages
      const actualLastMessage = messages[messages.length - 1];
      
      // If the last message has no content, show "No messages yet"
      if (!actualLastMessage.content || !actualLastMessage.content.trim()) {
        return 'No messages yet';
      }
      
      // Otherwise, show the actual content
      return `${actualLastMessage.sender._id === user.id ? 'You: ' : ''}${actualLastMessage.content}`;
    }
    
    // For non-selected conversations or when we don't have messages loaded,
    // fall back to the conversation's lastMessage field
    
    // If there's no lastMessage property at all, it's likely a new conversation
    if (!convo.lastMessage) {
      return 'No messages yet';
    }
    
    // If lastMessage is explicitly null, no messages
    if (convo.lastMessage === null) {
      return 'No messages yet';
    }
    
    // If lastMessage exists but has no content or empty content, no messages
    if (!convo.lastMessage.content || !convo.lastMessage.content.trim()) {
      return 'No messages yet';
    }
    
    // If we have content, format it properly
    if (convo.lastMessage.sender) {
      return `${convo.lastMessage.sender._id === user.id ? 'You: ' : ''}${convo.lastMessage.content}`;
    }
    
    // Fallback to just the content
    return convo.lastMessage.content;
  };

  // Helper function to manually update conversation list after message operations
  const updateConversationAfterMessageChange = async (conversationId) => {
    try {
      // Fetch updated conversations
      const updatedConversations = await fetchConversations();
      
      // If we're viewing this conversation, refresh its messages too
      if (selectedConversation && selectedConversation._id === conversationId) {
        const updatedMessages = await messagingService.getMessages(conversationId);
        // Resolve referenced messages to ensure they have full data
        const messagesWithResolvedReferences = updatedMessages.map(msg => {
          if (msg.referencedMessage && typeof msg.referencedMessage === 'string') {
            // If referencedMessage is just an ID, try to find the full message in the data
            const referencedMsg = updatedMessages.find(m => m._id === msg.referencedMessage);
            if (referencedMsg) {
              return { ...msg, referencedMessage: referencedMsg };
            }
          }
          return msg;
        });
        setMessages(messagesWithResolvedReferences);
        
        // Immediately update the conversation list to reflect the new messages
        setConversations(prev => {
          return prev.map(convo => {
            if (convo._id === conversationId) {
              // If there are no messages, set lastMessage to null
              if (messagesWithResolvedReferences.length === 0) {
                return { ...convo, lastMessage: null };
              }
              // Otherwise, set lastMessage to the new last message
              const newLastMessage = messagesWithResolvedReferences[messagesWithResolvedReferences.length - 1];
              return { ...convo, lastMessage: newLastMessage };
            }
            return convo;
          });
        });
      }
      
      return updatedConversations;
    } catch (err) {
      console.error('Failed to update conversation after message change:', err);
      // Fallback: manually check if the conversation should show "No messages yet"
      setConversations(prev => {
        return prev.map(convo => {
          if (convo._id === conversationId) {
            // If we're viewing this conversation and it has no messages, update the lastMessage
            if (selectedConversation && selectedConversation._id === conversationId && messages.length === 0) {
              return { ...convo, lastMessage: null };
            }
            // Additional check: if we have messages, make sure the lastMessage is correctly set
            else if (selectedConversation && selectedConversation._id === conversationId && messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              return { ...convo, lastMessage: lastMessage };
            }
          }
          return convo;
        });
      });
      return [];
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isMessageRead = (message) => {
    // A message is considered read if it's from the current user or if it's been read by the recipient
    if (!selectedConversation) return false;
    const otherParticipant = selectedConversation.participants?.find(p => p._id !== user.id);
    return message.sender._id === user.id || (otherParticipant && message.readBy && message.readBy.includes(otherParticipant._id));
  };

  const handleSearchMessages = async (query) => {
    if (!query.trim() || !selectedConversation) return;
    
    try {
      const results = await messagingService.searchMessages(selectedConversation._id, query);
      setMessageSearchResults(results);
    } catch (err) {
      console.error('Failed to search messages:', err);
    }
  };

  const handleSelectSearchResult = (message) => {
    // Scroll to the message in the chat
    const element = document.getElementById(`message-${message._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message temporarily
      element.style.backgroundColor = theme.palette.primary.light;
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
    setMessageSearch('');
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
        display: 'flex',
        flexDirection: 'column'
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

      {/* Conversations List - Always visible without dropdown */}
      <List component="div" disablePadding sx={{ 
        transition: 'all 0.3s ease-in-out',
        flexGrow: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        }
      }}>
        {loading.convos ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Loader size="small" />
          </Box>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(convo => {
            const otherParticipant = convo.participants?.find(p => p._id !== user.id);
            const isOnline = onlineUsers[otherParticipant?._id];
            return (
              <ListItemButton
                key={convo._id}
                onClick={() => handleSelectConversation(convo)}
                selected={selectedConversation?._id === convo._id}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  py: 1.5,
                  bgcolor: selectedConversation?._id === convo._id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transition: 'all 0.2s ease'
                  },
                  maxWidth: '100%',
                  overflow: 'hidden',
                  borderLeft: selectedConversation?._id === convo._id ? `3px solid ${theme.palette.primary.main}` : 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedConversation?._id === convo._id ? `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}` : 'none'
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant={isOnline ? "dot" : "standard"}
                    color="success"
                    sx={{
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Avatar 
                      src={otherParticipant?.profilePic && otherParticipant.profilePic.startsWith('http') ? otherParticipant.profilePic : otherParticipant?.profilePic ? `${process.env.REACT_APP_API_URL}${otherParticipant.profilePic}` : undefined} 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        border: isOnline ? `2px solid ${theme.palette.success.main}` : `2px solid ${theme.palette.divider}`,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${otherParticipant?.username}`);
                      }}
                    >
                      {isOnline && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            bgcolor: 'success.main',
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: `0 0 4px ${theme.palette.background.paper}`
                          }}
                        />
                      )}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, ml: 1.5 }}>
                  {/* Primary line - user info and time */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography 
                      variant="subtitle1" 
                      noWrap 
                      sx={{ 
                        fontWeight: selectedConversation?._id === convo._id ? 600 : 500, 
                        fontFamily: theme.typography.fontFamily, 
                        maxWidth: '60%',
                        color: selectedConversation?._id === convo._id ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {otherParticipant?.username || 'Unknown User'}
                    </Typography>
                    {convo.lastMessage?.createdAt && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          flexShrink: 0, 
                          ml: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        {formatMessageTime(convo.lastMessage?.createdAt)}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Secondary line - message content and unread count */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 0.5 }}>
                    <Typography 
                      noWrap 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        maxWidth: '70%', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontSize: '0.85rem'
                      }}
                      component="div"
                    >
                      {getConversationLastMessageText(convo)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 1 }}>
                      {convo.unreadCount > 0 && (
                        <Chip 
                          label={convo.unreadCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            minWidth: 20,
                            borderRadius: '10px', 
                            p: 0,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`
                          }} 
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </ListItemButton>
            );
          })
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No conversations found
          </Typography>
        )}
      </List>
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
      {/* Chat header - Professional style */}
      <Paper sx={{ 
        p: 1.5, 
        borderBottom: 1, 
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {isMobile && (
              <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 0.5 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <ListItemAvatar sx={{ minWidth: 'auto' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant={onlineUsers[selectedConversation?.participants?.find(p => p._id !== user.id)?._id] ? "dot" : "standard"}
                color="success"
              >
                <Avatar 
                  src={selectedConversation?.participants?.find(p => p._id !== user.id)?.profilePic && selectedConversation.participants?.find(p => p._id !== user.id).profilePic.startsWith('http') ? selectedConversation.participants?.find(p => p._id !== user.id).profilePic : selectedConversation?.participants?.find(p => p._id !== user.id)?.profilePic ? `${process.env.REACT_APP_API_URL}${selectedConversation.participants?.find(p => p._id !== user.id).profilePic}` : undefined} 
                  sx={{ width: 40, height: 40, position: 'relative', cursor: 'pointer' }}
                  onClick={() => navigate(`/user/${selectedConversation?.participants?.find(p => p._id !== user.id)?.username}`)}
                >
                  {onlineUsers[selectedConversation?.participants?.find(p => p._id !== user.id)?._id] && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        bgcolor: 'success.main',
                        borderRadius: '50%',
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    />
                  )}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, lineHeight: 1.2 }}>
                {selectedConversation?.participants?.find(p => p._id !== user.id)?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, lineHeight: 1.2, fontSize: '0.75rem' }}>
                {onlineUsers[selectedConversation?.participants?.find(p => p._id !== user.id)?._id] ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              data-message-search-input
              size="small"
              placeholder="Search messages..."
              variant="outlined"
              value={messageSearch}
              onChange={(e) => {
                setMessageSearch(e.target.value);
                if (e.target.value.trim()) {
                  handleSearchMessages(e.target.value);
                }
              }}
              sx={{ 
                width: 180,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  height: 36
                }, 
                '& .MuiInputBase-input': { 
                  fontFamily: theme.typography.fontFamily,
                  py: 0.5,
                  px: 1,
                  fontSize: '0.875rem'
                },
                mr: 1,
                display: { xs: 'none', sm: 'block' }
              }}
              InputProps={
                messageSearchResults.length > 0 && messageSearch.trim() ? {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                      <SearchIcon sx={{ fontSize: 16 }} />
                      <Chip 
                        label={messageSearchResults.length} 
                        size="small" 
                        sx={{ 
                          height: 16, 
                          width: 16, 
                          borderRadius: '50%', 
                          p: 0,
                          minWidth: 16,
                          ml: 0.5,
                          '& .MuiChip-label': {
                            px: 0.25,
                            py: 0,
                            fontSize: '0.6rem'
                          }
                        }} 
                        color="primary" 
                      />
                    </InputAdornment>
                  )
                } : {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                      <SearchIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  )
                }
              }
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Message Search Results */}
      {messageSearchResults.length > 0 && messageSearch.trim() && (
        <Paper 
          data-message-search-results
          sx={{ 
            position: 'absolute', 
            top: 70, 
            right: 16, 
            width: 300, 
            maxHeight: 400, 
            overflowY: 'auto', 
            zIndex: 1000,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[4]
          }}
        >
          <List>
            {messageSearchResults.map((message) => (
              <ListItemButton 
                key={message._id}
                onClick={() => handleSelectSearchResult(message)}
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {message.sender._id === user.id ? 'You' : message.sender.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                  {message.content}
                </Typography>
                {message.attachments && message.attachments.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AttachFileIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                    <Typography variant="caption">
                      {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {/* Messages area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        {loading.messages ? (
          <Loader size="medium" sx={{ display: 'block', m: 'auto', mt: 4 }} />
        ) : (
          <>
            {messages.map((msg, index) => {
              const isSender = msg?.sender?._id === user.id;
              const showAvatar = !isSender && (index === 0 || (messages[index - 1] && messages[index - 1].sender?._id !== msg?.sender?._id));
              const isConsecutive = index > 0 && messages[index - 1] && messages[index - 1].sender?._id === msg?.sender?._id;
              const isRead = isMessageRead(msg);
              const reactions = messageReactions[msg?._id] || {};
              
              // Check if this message is referenced by any other message in the conversation
              const isReferenced = messages.some(m => m?.referencedMessage && m.referencedMessage._id === msg?._id);
              
              return (
                <Box
                  key={msg?._id}
                  sx={{
                    display: 'flex',
                    justifyContent: isSender ? 'flex-end' : 'flex-start',
                    mb: isConsecutive ? 0.5 : 2,
                    gap: 1,
                    alignItems: 'flex-end',
                  }}
                >
                  {!isSender && (
                    <Avatar
                      src={msg.sender.profilePic && msg.sender.profilePic.startsWith('http') ? msg.sender.profilePic : msg.sender.profilePic ? `${process.env.REACT_APP_API_URL}${msg.sender.profilePic}` : undefined}
                      sx={{ width: 32, height: 32, visibility: showAvatar ? 'visible' : 'hidden', position: 'relative', cursor: 'pointer' }}
                      onClick={() => navigate(`/user/${msg.sender.username}`)}
                    >
                      {showAvatar && onlineUsers[msg?.sender?._id] && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            bgcolor: 'success.main',
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.background.paper}`
                          }}
                        />
                      )}
                    </Avatar>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <Paper
                      id={`message-${msg?._id}`}
                      sx={{
                        p: 0.75,
                        bgcolor: isSender ? alpha(theme.palette.primary.main, 0.9) : alpha(theme.palette.background.paper, 0.9),
                        color: isSender ? 'primary.contrastText' : 'text.primary',
                        opacity: msg.isSending ? 0.6 : 1,
                        borderRadius: isSender ? 
                          (isConsecutive ? '10px 2px 10px 2px' : '10px 2px 10px 10px') : 
                          (isConsecutive ? '2px 10px 2px 10px' : '2px 10px 10px 10px'),
                        boxShadow: isSender ? `0 1px 2px ${alpha(theme.palette.primary.main, 0.2)}` : '0 1px 2px rgba(0,0,0,0.05)',
                        position: 'relative',
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        border: msg.failedToSend ? `1px solid ${theme.palette.error.main}` : (isSender ? 'none' : `1px solid ${theme.palette.divider}`),
                        // Add border to indicate this message is referenced by another
                        ...(isReferenced && {
                          borderLeft: `2px solid ${theme.palette.secondary.main}`
                        })
                      }}
                    >
                      {/* Sending indicator */}
                      {msg.isSending && (
                        <CircularProgress 
                          size={16} 
                          sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4,
                            color: isSender ? 'primary.contrastText' : 'primary.main'
                          }} 
                        />
                      )}
                      {/* Failed to send indicator */}
                      {msg.failedToSend && (
                        <Tooltip title="Failed to send. Click to retry" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: theme.palette.error.main,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)'
                              }
                            }}
                            onClick={async () => {
                              // Retry sending the message
                              try {
                                // Check if selectedConversation exists
                                if (!selectedConversation) {
                                  console.error('No selected conversation for retry');
                                  alert('Cannot retry message: No conversation selected.');
                                  return;
                                }
                                
                                const recipient = selectedConversation.participants?.find(p => p._id !== user.id);
                                if (!recipient) {
                                  console.error('No recipient found for retry');
                                  alert('Cannot retry message: No recipient found.');
                                  return;
                                }
                                
                                let sentMessage;
                                if (msg.attachments && msg.attachments.length > 0) {
                                  // If there are attachments, we need to send them via the upload endpoint
                                  // Note: For retry, we might not have the original file objects, so we'll send as regular message
                                  console.warn('Retrying message with attachments as text-only message');
                                  sentMessage = await messagingService.sendMessage(recipient._id, msg.content);
                                } else {
                                  // Regular text message
                                  sentMessage = await messagingService.sendMessage(recipient._id, msg.content);
                                }
                                
                                // Update the message in the local state
                                const updatedMessages = messages.map(m => 
                                  m._id === msg._id ? {...sentMessage, failedToSend: false} : m
                                );
                                setMessages(updatedMessages);
                                
                                // Immediately update the conversation list to reflect the change
                                setConversations(prev => {
                                  return prev.map(convo => {
                                    if (convo._id === selectedConversation._id) {
                                      // Update the lastMessage to the new last message
                                      const newLastMessage = updatedMessages[updatedMessages.length - 1];
                                      return { ...convo, lastMessage: newLastMessage };
                                    }
                                    return convo;
                                  });
                                });
                                
                                // Add a small delay to ensure backend has time to update
                                setTimeout(async () => {
                                  console.log('Refreshing conversations after message retry');
                                  // Update the conversation list and messages
                                  await updateConversationAfterMessageChange(selectedConversation?._id);
                                  
                                  // Additional check: if we retried a message that was the last one,
                                  // ensure the conversation list is properly updated
                                  if (msg && messages.length > 0 && messages[messages.length - 1]._id === msg._id) {
                                    setConversations(prev => {
                                      return prev.map(convo => {
                                        if (convo._id === selectedConversation?._id) {
                                          // If this was the last message, we might need to refresh
                                          return { ...convo };
                                        }
                                        return convo;
                                      });
                                    });
                                  }
                                  
                                  // Also refresh conversations immediately to ensure UI consistency
                                  fetchConversations();
                                }, 500);
                              } catch (err) {
                                console.error('Failed to retry sending message:', err);
                                // Show error to user
                                alert('Failed to send message. Please try again.');
                              }
                            }}
                          >
                            <ReplayIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Referenced message (reply) */}
                      {msg.referencedMessage && (
                        <Paper 
                          sx={{ 
                            p: 1, 
                            mb: 1, 
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1),
                            border: `1px solid ${theme.palette.divider}`,
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            cursor: 'pointer',
                            borderRadius: 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                          onClick={() => {
                            // Scroll to the referenced message
                            const element = document.getElementById(`message-${msg?.referencedMessage?._id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              // Highlight the message temporarily
                              element.style.backgroundColor = alpha(theme.palette.primary.main, 0.2);
                              element.style.transition = 'background-color 0.3s';
                              setTimeout(() => {
                                element.style.backgroundColor = alpha(theme.palette.primary.main, 0.05);
                              }, 2000);
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.mode === 'dark' ? 'primary.contrastText' : 'primary.main',
                                fontSize: '0.75rem',
                                textShadow: theme.palette.mode === 'dark' ? '0 0 2px rgba(0,0,0,0.5)' : 'none'
                              }}
                            >
                              {msg?.referencedMessage?.sender?._id === user.id ? 'You' : msg?.referencedMessage?.sender?.username}
                            </Typography>
                          </Box>
                          {msg?.referencedMessage?.content && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.8125rem',
                                lineHeight: 1.4,
                                color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                                fontWeight: theme.palette.mode === 'dark' ? 500 : 400
                              }}
                            >
                              {msg.referencedMessage.content}
                            </Typography>
                          )}
                          {msg?.referencedMessage?.attachments && msg?.referencedMessage?.attachments.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <AttachFileIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'primary.main' }} />
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'primary.contrastText' : 'primary.main', textShadow: theme.palette.mode === 'dark' ? '0 0 2px rgba(0,0,0,0.5)' : 'none' }}>
                                {msg.referencedMessage.attachments.length} attachment{msg.referencedMessage.attachments.length > 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                      {/* Attachment preview */}
                      {msg.attachments && msg.attachments.length > 0 && msg.attachments.map((attachment, idx) => (
                        <Box key={idx} sx={{ mb: 1 }}>
                          {attachment.type === 'image' && (
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                              <img 
                                src={`${process.env.REACT_APP_API_URL || ''}${attachment.url}`} 
                                alt="Attachment" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: 200, 
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  border: '1px solid rgba(0,0,0,0.05)',
                                  boxSizing: 'border-box'
                                }} 
                                onClick={() => handleMediaPreview(
                                  `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                  'image', 
                                  attachment.filename
                                )}
                              />
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 4, 
                                right: 4 
                              }}>
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(0,0,0,0.5)', 
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(
                                      `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                      attachment.filename
                                    );
                                  }}
                                >
                                  <DownloadIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                          {attachment.type === 'video' && (
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                              <Box sx={{ 
                                position: 'relative', 
                                width: '100%', 
                                maxHeight: 200, 
                                bgcolor: 'black', 
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxSizing: 'border-box'
                              }}>
                                <video 
                                  src={`${process.env.REACT_APP_API_URL || ''}${attachment.url}`} 
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: 200, 
                                    cursor: 'pointer'
                                  }} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMediaPreview(
                                      `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                      'video', 
                                      attachment.filename
                                    );
                                  }}
                                />
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: '50%', 
                                  left: '50%', 
                                  transform: 'translate(-50%, -50%)',
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  borderRadius: '50%',
                                  width: 40,
                                  height: 40,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMediaPreview(
                                    `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                    'video', 
                                    attachment.filename
                                  );
                                }}
                                >
                                  <PlayArrowIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                              </Box>
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 4, 
                                right: 4 
                              }}>
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(0,0,0,0.5)', 
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(
                                      `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                      attachment.filename
                                    );
                                  }}
                                >
                                  <DownloadIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                          {attachment.type === 'document' && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              p: 1, 
                              bgcolor: 'background.paper', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              boxSizing: 'border-box'
                            }}>
                              <DescriptionIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                  {attachment.filename || 'Document'}
                                </Typography>
                                {attachment.size && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {formatFileSize(attachment.size)}
                                  </Typography>
                                )}
                              </Box>
                              <IconButton 
                                size="small"
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  '&:hover': { 
                                    bgcolor: 'primary.dark',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                    attachment.filename
                                  );
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                              </IconButton>
                            </Box>
                          )}
                          {attachment.type === 'audio' && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              p: 1, 
                              bgcolor: 'background.paper', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              boxSizing: 'border-box'
                            }}>
                              <MusicNoteIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                  {attachment.filename || 'Audio'}
                                </Typography>
                                {attachment.size && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {formatFileSize(attachment.size)}
                                  </Typography>
                                )}
                              </Box>
                              <IconButton 
                                size="small"
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  '&:hover': { 
                                    bgcolor: 'primary.dark',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    `${process.env.REACT_APP_API_URL || ''}${attachment.url}`, 
                                    attachment.filename
                                  );
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      ))}
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily, 
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.8125rem',
                          lineHeight: 1.35,
                          fontWeight: 400
                        }}
                      >
                        {msg.content}
                        {msg.updatedAt && msg.updatedAt !== msg.createdAt && (
                          <span style={{ opacity: 0.7, marginLeft: 4, fontSize: '0.65rem' }}>
                            (edited)
                          </span>
                        )}
                      </Typography>
                    </Paper>
                    
                    {/* Reactions */}
                    {messageReactions[msg._id] && Object.keys(messageReactions[msg._id]).length > 0 && (
                      <Box sx={{ display: 'flex', mt: 0.5, gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(messageReactions[msg._id]).reduce((acc, [userId, reaction]) => {
                          // Group reactions by emoji
                          const existingReaction = acc.find(item => item.emoji === reaction);
                          if (existingReaction) {
                            existingReaction.userIds.push(userId);
                            if (userId === user.id) {
                              existingReaction.isSelf = true;
                            }
                          } else {
                            acc.push({
                              emoji: reaction,
                              userIds: [userId],
                              isSelf: userId === user.id
                            });
                          }
                          return acc;
                        }, []).map((reactionGroup) => {
                          const reactionCount = reactionGroup.userIds.length;
                          const isUserReaction = reactionGroup.isSelf;
                          const userNames = reactionGroup.userIds
                            .map(userId => {
                              if (userId === user.id) return 'You';
                              const userObj = selectedConversation?.participants?.find(p => p._id === userId);
                              return userObj ? userObj.username : 'Unknown';
                            })
                            .join(', ');
                          
                          return (
                            <Tooltip key={`${msg._id}-${reactionGroup.emoji}`} title={userNames} arrow>
                              <Chip
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span>{reactionGroup.emoji}</span>
                                    {reactionCount > 1 && (
                                      <Typography variant="caption" component="span">
                                        {reactionCount}
                                      </Typography>
                                    )}
                                    {isUserReaction && (
                                      <Typography variant="caption" component="span">(You)</Typography>
                                    )}
                                  </Box>
                                }
                                size="small"
                                sx={{
                                  height: 20,
                                  borderRadius: '10px',
                                  bgcolor: isUserReaction ? 'primary.light' : 'background.paper',
                                  color: isUserReaction ? 'primary.contrastText' : 'text.primary',
                                  border: `1px solid ${theme.palette.divider}`,
                                  opacity: processingReactions[msg._id] ? 0.7 : 1,
                                  transition: 'opacity 0.2s',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    opacity: 0.8
                                  },
                                  '& .MuiChip-label': {
                                    px: 0.5,
                                    fontSize: '0.7rem'
                                  }
                                }}
                                onClick={() => handleAddReaction(msg._id, reactionGroup.emoji)}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    )}
                    
                    {/* Message actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7, fontFamily: theme.typography.fontFamily, mr: 1, fontSize: '0.7rem' }}>
                        {formatMessageTime(msg.createdAt)}
                      </Typography>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <AttachFileIcon sx={{ fontSize: '0.8rem', opacity: 0.7, mr: 1 }} />
                      )}
                      {isSender && (
                        isRead ? <DoneAllIcon sx={{ fontSize: '1rem', color: 'primary.main' }} /> : 
                        msg.delivered ? <DoneAllIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} /> : 
                        <CheckIcon sx={{ fontSize: '1rem' }} />
                      )}
                      <IconButton 
                        size="small" 
                        sx={{ ml: 0.5, p: 0.25 }}
                        onClick={(e) => {
                          console.log('Setting current message ID for reaction to:', msg._id);
                          setCurrentMessageId(msg._id);
                          setReactionAnchorEl(e.currentTarget);
                        }}
                        disabled={processingReactions[msg._id]}
                      >
                        <AddReactionIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      {isSender && (
                        <IconButton 
                          size="small" 
                          sx={{ ml: 0.25, p: 0.25 }}
                          onClick={(e) => {
                            // Open message context menu
                            console.log('Setting current message ID to:', msg._id);
                            setCurrentMessageId(msg._id);
                            setMessageAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: '0.875rem' }} />
                        </IconButton>
                      )}
                      {/* Add reference button for all messages */}
                      <IconButton 
                        size="small" 
                        sx={{ ml: 0.25, p: 0.25 }}
                        onClick={() => {
                          // Set this message as the one we're referencing
                          setReplyingTo(msg);
                        }}
                      >
                        <ReplyIcon sx={{ fontSize: '0.875rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} style={{ marginTop: 'auto' }} />
          </>
        )}
      </Box>

      {/* Typing indicator - fix HTML validation errors */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ fontSize: '0.7rem' }}>
            {typingUsers.length === 1 
              ? `${selectedConversation?.participants?.find(p => p._id === typingUsers[0])?.username || 'User'} is typing...`
              : `${typingUsers.length} people are typing...`}
          </Typography>
          <CircularProgress size={8} sx={{ ml: 0.75 }} />
        </Box>
      )}

      {/* Message input area - Professional style */}
      <Paper sx={{ 
        p: 0.75, 
        borderTop: 1, 
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.paper'
      }}>
        {replyingTo && (
          <Paper 
            sx={{ 
              p: 1,
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${theme.palette.divider}`,
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              borderRadius: 1
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                Replying to {replyingTo.sender?._id === user.id ? 'yourself' : replyingTo.sender?.username}
              </Typography>
              <IconButton size="small" onClick={() => setReplyingTo(null)}>
                <CloseIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontSize: '0.8125rem'
              }}
            >
              {replyingTo.content}
            </Typography>
          </Paper>
        )}
        
        {attachmentPreviews.map((preview, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'action.hover', 
            borderRadius: 0.25, 
            p: 0.5, 
            mb: 0.5 
          }}>
            {preview.type === 'image' && (
              <Box sx={{ position: 'relative', mr: 1 }}>
                <img 
                  src={preview.url} 
                  alt="Preview" 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    objectFit: 'cover', 
                    borderRadius: 2 
                  }} 
                />
              </Box>
            )}
            {preview.type === 'video' && (
              <Box sx={{ 
                position: 'relative', 
                mr: 1, 
                width: 36, 
                height: 36, 
                bgcolor: 'black', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PlayArrowIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
            )}
            {preview.type === 'audio' && (
              <Box sx={{ 
                position: 'relative', 
                mr: 1, 
                width: 36, 
                height: 36, 
                bgcolor: 'primary.main', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MusicNoteIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
            )}
            {preview.type === 'document' && (
              <Box sx={{ mr: 1 }}>
                <DescriptionIcon sx={{ fontSize: '1.2rem' }} />
              </Box>
            )}
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem' }} noWrap>
                {preview.type === 'image' && 'Image: '}
                {preview.type === 'video' && 'Video: '}
                {preview.type === 'audio' && 'Audio: '}
                {preview.type === 'document' && 'Document: '}
                {preview.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {preview.size && formatFileSize(preview.size)}
              </Typography>
            </Box>
            <IconButton size="small" sx={{ width: 28, height: 28 }} onClick={() => {
              setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
              // Check if fileInputRef and files exist before trying to modify them
              if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > index) {
                // Create a new FileList without the removed file
                const dt = new DataTransfer();
                const currentFiles = Array.from(fileInputRef.current.files);
                currentFiles.splice(index, 1);
                currentFiles.forEach(file => dt.items.add(file));
                fileInputRef.current.files = dt.files;
              }
            }}>
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        ))}
        
        <Stack direction="row" spacing={0.5} alignItems="center">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          
          <IconButton 
            size="small" 
            onClick={handleAttachmentClick}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={handleEmojiPickerOpen}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
          
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
                borderRadius: 16,
                bgcolor: 'background.default',
                minHeight: 32,
                '&:hover': {
                  bgcolor: 'background.default',
                },
                '&.Mui-focused': {
                  bgcolor: 'background.default',
                }
              }, 
              '& .MuiInputBase-input': { 
                fontFamily: theme.typography.fontFamily,
                py: 0.5,
                px: 1.25,
                fontSize: '0.8125rem'
              } 
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    size="small"
                    onClick={handleSendMessage} 
                    disabled={isSending || (!newMessage.trim() && attachmentPreviews.length === 0)}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      minWidth: 32,
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'action.disabled', color: 'action.disabled' }
                    }}
                  >
                    {isSending ? <Loader size="small" color="inherit" /> : <SendIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            multiline
            maxRows={3}
          />
        </Stack>
      </Paper>
    </Box>
  ) : NoConversationSelected;

  // Add media preview handler
  const handleMediaPreview = (url, type, filename) => {
    setMediaPreview({
      open: true,
      url,
      type,
      filename
    });
  };

  // Add download handler
  const handleDownload = async (url, filename) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || 'attachment';
      
      // Add to DOM, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if download fails
      window.open(url, '_blank');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      bgcolor: theme.palette.background.default,
      pt: 8,
      overflow: 'hidden'
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
          position: 'relative'
        }}
      >
        <Paper sx={{ 
          height: '100%', 
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          margin: 0
        }}>
          {ChatWindow}
        </Paper>
      </Box>

      {/* Menus and dialogs */}
      {/* Header Menu */}
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

      {/* Message Context Menu */}
      <Menu
        anchorEl={messageAnchorEl}
        open={Boolean(messageAnchorEl)}
        onClose={() => setMessageAnchorEl(null)}
      >
        {/* Copy Text - only show if message has content */}
        {messages.find(msg => msg._id === currentMessageId)?.content && (
          <MenuItem onClick={() => {
            const messageToCopy = messages.find(msg => msg._id === currentMessageId);
            if (messageToCopy && messageToCopy.content) {
              navigator.clipboard.writeText(messageToCopy.content)
                .then(() => {
                  // Optional: Show a success message
                  console.log('Message copied to clipboard');
                })
                .catch(err => {
                  console.error('Failed to copy message: ', err);
                });
              setMessageAnchorEl(null);
            }
          }}>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Text</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          // Find the message to edit
          const messageToEdit = messages.find(msg => msg._id === currentMessageId);
          if (messageToEdit) {
            setEditingMessage(messageToEdit);
            setEditMessageContent(messageToEdit.content);
            setMessageAnchorEl(null);
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Message</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { 
          setDeleteMessageDialogOpen(true); 
          setMessageAnchorEl(null); 
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Message</ListItemText>
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

      {/* Delete Message Confirmation Dialog */}
      <Dialog
        open={deleteMessageDialogOpen}
        onClose={() => setDeleteMessageDialogOpen(false)}
        aria-labelledby="delete-message-dialog-title"
        aria-describedby="delete-message-dialog-description"
      >
        <DialogTitle id="delete-message-dialog-title">
          {"Delete Message?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMessageDialogOpen(false)} color="primary">
            No
          </Button>
          <Button 
            onClick={async () => {
              console.log('Deleting message with ID:', currentMessageId);
              try {
                await messagingService.deleteMessage(currentMessageId);
                console.log('Message deleted successfully, ID:', currentMessageId);
                // Remove the message from the local state
                const updatedMessages = messages.filter(msg => msg._id !== currentMessageId);
                setMessages(updatedMessages);
                setDeleteMessageDialogOpen(false);
                
                // Immediately update the conversation list to reflect the change
                setConversations(prev => {
                  return prev.map(convo => {
                    if (convo._id === selectedConversation._id) {
                      // If there are no messages left, set lastMessage to null
                      if (updatedMessages.length === 0) {
                        return { ...convo, lastMessage: null };
                      } else {
                        // Otherwise, set lastMessage to the new last message
                        const newLastMessage = updatedMessages[updatedMessages.length - 1];
                        return { ...convo, lastMessage: newLastMessage };
                      }
                    }
                    return convo;
                  });
                });
                
                // Add a small delay to ensure backend has time to update
                setTimeout(async () => {
                  console.log('Refreshing conversations after message deletion');
                  // Update the conversation list and messages
                  await updateConversationAfterMessageChange(selectedConversation?._id);
                  
                  // Additional check: if we're viewing this conversation and it now has no messages,
                  // manually update the conversation to show "No messages yet"
                  if (selectedConversation && selectedConversation._id === currentMessageId?.split('-')[0] && messages.length === 1) {
                    setConversations(prev => {
                      return prev.map(convo => {
                        if (convo._id === selectedConversation._id) {
                          return { ...convo, lastMessage: null };
                        }
                        return convo;
                      });
                    });
                  }
                  
                  // Also refresh conversations immediately to ensure UI consistency
                  fetchConversations();
                }, 500);
              } catch (err) {
                console.error('Failed to delete message:', err);
                // Show error to user
                alert('Failed to delete message. Please try again.');
              }
            }} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog
        open={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        aria-labelledby="edit-message-dialog-title"
      >
        <DialogTitle id="edit-message-dialog-title">
          Edit Message
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="edit-message-content"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editMessageContent}
            onChange={(e) => setEditMessageContent(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                bgcolor: 'background.paper'
              }, 
              '& .MuiInputBase-input': { 
                fontFamily: theme.typography.fontFamily 
              } 
            }}
            InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMessage(null)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              console.log('Editing message:', editingMessage);
              console.log('Edit content:', editMessageContent);
              
              // Validate inputs
              if (!editMessageContent || !editMessageContent.trim()) {
                alert('Message content cannot be empty.');
                return;
              }
              
              if (!editingMessage || !editingMessage._id) {
                console.error('No message selected for editing');
                alert('No message selected for editing. Please try again.');
                return;
              }
              
              try {
                // Call the API to update the message
                const updatedMessage = await messagingService.updateMessage(editingMessage._id, editMessageContent.trim());
                console.log('Updated message response:', updatedMessage);
                
                // Check if the update was successful
                if (!updatedMessage || !updatedMessage._id) {
                  throw new Error('Invalid response from server');
                }
                
                // Update the message in the local state
                const updatedMessages = messages.map(msg => 
                  msg._id === editingMessage._id ? {...msg, content: editMessageContent.trim(), updatedAt: new Date().toISOString()} : msg
                );
                setMessages(updatedMessages);
                
                // Immediately update the conversation list to reflect the change
                setConversations(prev => {
                  return prev.map(convo => {
                    if (convo._id === selectedConversation._id) {
                      // Update the lastMessage to the new last message
                      const newLastMessage = updatedMessages[updatedMessages.length - 1];
                      return { ...convo, lastMessage: newLastMessage };
                    }
                    return convo;
                  });
                });
                
                // Close the dialog
                setEditingMessage(null);
                setEditMessageContent('');
                // Add a small delay to ensure backend has time to update
                setTimeout(async () => {
                  console.log('Refreshing conversations after message edit');
                  // Update the conversation list and messages
                  await updateConversationAfterMessageChange(selectedConversation?._id);
                  
                  // Additional check: if we edited the last message and it's now empty,
                  // manually update the conversation to show "No messages yet"
                  if (editingMessage && messages.length > 0) {
                    const updatedMessages = messages.map(msg => 
                      msg._id === editingMessage._id ? {...msg, content: editMessageContent.trim(), updatedAt: new Date().toISOString()} : msg
                    );
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    if (lastMessage && (!lastMessage.content || !lastMessage.content.trim())) {
                      setConversations(prev => {
                        return prev.map(convo => {
                          if (convo._id === selectedConversation?._id) {
                            return { ...convo, lastMessage: null };
                          }
                          return convo;
                        });
                      });
                    }
                  }
                  
                  // Also refresh conversations immediately to ensure UI consistency
                  fetchConversations();
                }, 500);
              } catch (err) {
                console.error('Failed to update message:', err);
                // Show error to user
                alert('Failed to update message. Please try again.');
              }
            }} 
            color="primary" 
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Preview Dialog - REMOVED as we now support multiple attachments directly */}

      {/* Media Preview Dialog */}
      <Dialog
        open={mediaPreview.open}
        onClose={() => setMediaPreview({ open: false, url: '', type: '', filename: '' })}
        maxWidth="md"
        fullWidth
        sx={{ 
          '& .MuiDialog-paper': { 
            bgcolor: 'background.default',
            color: 'text.primary',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          } 
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {mediaPreview.filename || 'Media Preview'}
          </Typography>
          <IconButton 
            onClick={() => setMediaPreview({ open: false, url: '', type: '', filename: '' })}
            sx={{ 
              color: 'text.primary',
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
          {mediaPreview.type === 'image' && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img 
                src={mediaPreview.url} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
            </Box>
          )}
          {mediaPreview.type === 'video' && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <video 
                src={mediaPreview.url} 
                controls 
                autoPlay
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={() => {
              handleDownload(mediaPreview.url, mediaPreview.filename);
              setMediaPreview({ open: false, url: '', type: '', filename: '' });
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Download
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
        <Picker 
          data={data}
          onEmojiSelect={(emoji) => {
            if (currentMessageId) {
              handleAddReaction(currentMessageId, emoji.native);
            }
            setReactionAnchorEl(null);
          }}
          emojiSize={20}
          emojiButtonSize={28}
          navPosition="bottom"
          previewPosition="none"
          skinTonePosition="none"
          theme={theme.palette.mode}
        />
      </Popover>

      <Popover
        open={emojiPickerOpen}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiPickerOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Picker 
          data={data}
          onEmojiSelect={(emoji) => {
            handleEmojiClick(emoji.native);
          }}
          emojiSize={20}
          emojiButtonSize={28}
          navPosition="bottom"
          previewPosition="none"
          skinTonePosition="none"
          theme={theme.palette.mode}
        />
      </Popover>
    </Box>
  );
};

export default MessengerPage;
