const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user (inbox)
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('blockedUsers');
    const blockedIds = currentUser.blockedUsers;

    const conversations = await Conversation.find({ participants: req.user.id, 'participants': { $nin: blockedIds } })
      .populate('participants', 'username profilePic')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });

    // Add unread count to each conversation
    const conversationsWithUnread = await Promise.all(conversations.map(async (convo) => {
      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        readBy: { $ne: req.user.id }
      });
      // Mongoose documents are immutable, so we convert to a plain object
      const convoObj = convo.toObject();
      convoObj.unreadCount = unreadCount;
      return convoObj;
    }));

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
router.get('/conversations/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(404).json({ message: 'Conversation not found or you are not a participant.' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'username profilePic')
      .sort({ createdAt: 'asc' });

    // Mark messages as read by the current user
    await Message.updateMany(
      { conversation: req.params.conversationId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Send a new message (creates conversation if it doesn't exist)
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user.id;

  if (!recipientId || !content) {
    return res.status(400).json({ message: 'Recipient and content are required.' });
  }

  // Check if either user has blocked the other
  const recipient = await User.findById(recipientId).select('blockedUsers');
  if (recipient.blockedUsers.includes(senderId) || req.user.blockedUsers.includes(recipientId)) {
    return res.status(403).json({ message: 'You cannot send a message to this user.' });
  }

  try {
    // Find a conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 }
    });

    if (!conversation) {
      // If no conversation exists, create a new one
      conversation = await Conversation.create({ participants: [senderId, recipientId] });
    }

    const newMessage = new Message({
      conversation: conversation._id,
      sender: senderId,
      content,
      readBy: [senderId], // Sender has read it by default
    });

    await newMessage.save();

    // Update the lastMessage in the conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save(); // This will also update the `updatedAt` timestamp

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username profilePic');

    // Emit real-time event to the recipient
    const recipientSocketId = req.onlineUsers[recipientId];
    if (recipientSocketId) {
      req.io.to(recipientSocketId).emit('new_private_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get unread message count for the current user
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    // Find all conversations the user is in, excluding those with blocked users
    const conversations = await Conversation.find({
      participants: req.user.id,
      'participants': { $nin: req.user.blockedUsers || [] }
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    // Count messages in those conversations that are not sent by the user and not read by the user
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;