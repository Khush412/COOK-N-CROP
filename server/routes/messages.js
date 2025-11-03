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
    const currentUserId = req.user._id;
    const myBlockedUsersIds = (req.user.blockedUsers || []).map(id => id.toString());

    // 1. Get all conversations the user is a participant in.
    // We populate 'blockedUsers' on the other participants to check for blocks against the current user.
    const allMyConversations = await Conversation.find({ participants: currentUserId })
      .populate('participants', 'username profilePic blockedUsers')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });

    // 2. Filter out conversations with users who have blocked the current user, or whom the current user has blocked.
    const filteredConversations = allMyConversations.filter(convo => {
      const otherParticipant = convo.participants.find(p => p._id.toString() !== currentUserId.toString());
      if (!otherParticipant) return false; // Should not happen in a 2-person convo

      const iBlockedThem = myBlockedUsersIds.includes(otherParticipant._id.toString());
      const theyBlockedMe = (otherParticipant.blockedUsers || []).some(blockedId => blockedId.toString() === currentUserId.toString());

      return !iBlockedThem && !theyBlockedMe;
    });

    // 3. Add unread count to each valid conversation
    const conversationsWithUnread = await Promise.all(filteredConversations.map(async (convo) => {
      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        sender: { $ne: currentUserId }, // Only count messages from others
        readBy: { $ne: currentUserId }
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
    const currentUserId = req.user._id;
    const conversation = await Conversation.findById(req.params.conversationId).populate('participants', 'blockedUsers');

    if (!conversation || !conversation.participants.some(p => p._id.equals(currentUserId))) {
      return res.status(404).json({ message: 'Conversation not found or you are not a participant.' });
    }

    // --- Security Check: Ensure neither user has blocked the other ---
    const otherParticipant = conversation.participants.find(p => !p._id.equals(currentUserId));
    if (otherParticipant) {
      // Check if the current user has blocked the other participant
      if (req.user.blockedUsers.some(blockedId => blockedId.equals(otherParticipant._id))) {
        return res.status(403).json({ message: 'You have blocked this user and cannot view the conversation.' });
      }
      // Check if the other participant has blocked the current user
      if (otherParticipant.blockedUsers.some(blockedId => blockedId.equals(currentUserId))) {
        return res.status(403).json({ message: 'You cannot view this conversation.' });
      }
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'username profilePic')
      .sort({ createdAt: 'asc' });

    // Mark messages as read by the current user
    await Message.updateMany({ conversation: req.params.conversationId, readBy: { $ne: currentUserId } }, { $addToSet: { readBy: currentUserId } });

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
    const currentUserId = req.user._id;
    const myBlockedUsersIds = (req.user.blockedUsers || []).map(id => id.toString());

    // Get all conversations the user is a participant in
    const allMyConversations = await Conversation.find({ participants: currentUserId })
      .populate('participants', 'blockedUsers');

    // Filter out conversations with blocked users (in either direction)
    const validConversationIds = allMyConversations
      .filter(convo => {
        const otherParticipant = convo.participants.find(p => p._id.toString() !== currentUserId.toString());
        if (!otherParticipant) return false;

        const iBlockedThem = myBlockedUsersIds.includes(otherParticipant._id.toString());
        const theyBlockedMe = (otherParticipant.blockedUsers || []).some(blockedId => blockedId.toString() === currentUserId.toString());

        return !iBlockedThem && !theyBlockedMe;
      })
      .map(convo => convo._id);

    // Count messages in those conversations that are not sent by the user and not read by the user
    const unreadCount = await Message.countDocuments({
      conversation: { $in: validConversationIds },
      sender: { $ne: currentUserId },
      readBy: { $ne: currentUserId }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a conversation
// @route   DELETE /api/messages/conversations/:conversationId
// @access  Private
router.delete('/conversations/:conversationId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Check if the current user is a participant in the conversation
    if (!conversation.participants.some(participant => participant.equals(currentUserId))) {
      return res.status(403).json({ message: 'You are not authorized to delete this conversation.' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: req.params.conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(req.params.conversationId);

    res.json({ message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;