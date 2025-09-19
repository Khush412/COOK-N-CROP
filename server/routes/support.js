const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { body, validationResult } = require('express-validator');

// @desc    Create a new support message
// @route   POST /api/support
// @access  Public
router.post('/', optionalAuth, [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('subject').not().isEmpty().withMessage('Subject is required'),
    body('message').not().isEmpty().withMessage('Message is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { name, email, subject, message } = req.body;

        const supportMessage = await SupportMessage.create({
            name,
            email,
            subject,
            message,
            user: req.user ? req.user.id : null, // Associate with logged-in user if available
        });

        // Notify admins via socket.io
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('new_activity', {
                type: 'support',
                id: supportMessage._id,
                title: `New support ticket: ${subject}`,
                timestamp: supportMessage.createdAt
            });
        }

        res.status(201).json({ success: true, data: supportMessage });
    } catch (error) {
        console.error('Support message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all support messages
// @route   GET /api/support
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const { search, status, subject } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const count = await SupportMessage.countDocuments(query);
    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true, data: messages, page, pages: Math.ceil(count / pageSize), count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get tickets for the logged-in user
// @route   GET /api/support/my-tickets
// @access  Private
router.get('/my-tickets', protect, async (req, res) => {
    try {
        const messages = await SupportMessage.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get a single support ticket by ID (for the user who created it or admin)
// @route   GET /api/support/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const message = await SupportMessage.findById(req.params.id)
            .populate('user', 'username')
            .populate('replies.user', 'username profilePic');

        if (!message) {
            return res.status(404).json({ success: false, message: 'Support ticket not found.' });
        }

        // Ensure the user owns the ticket or is an admin
        if (message.user?.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this ticket.' });
        }

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Update support message status
// @route   PUT /api/support/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Open', 'In Progress', 'Closed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }

        const message = await SupportMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!message) {
            return res.status(404).json({ success: false, message: 'Support message not found.' });
        }
        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    User replies to their own support message
// @route   POST /api/support/:id/user-reply
// @access  Private
router.post('/:id/user-reply', protect, async (req, res) => {
    try {
        const { replyContent } = req.body;
        if (!replyContent) {
            return res.status(400).json({ success: false, message: 'Reply content is required.' });
        }

        const message = await SupportMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Support message not found.' });
        }

        // Ensure the user owns the ticket
        if (message.user?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to reply to this ticket.' });
        }

        if (message.status === 'Closed') {
            return res.status(400).json({ success: false, message: 'Cannot reply to a closed ticket.' });
        }

        const reply = {
            user: req.user.id,
            content: replyContent,
        };
        message.replies.push(reply);
        await message.save();

        // Notify admins via socket.io
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('new_activity', {
                type: 'support',
                id: message._id,
                title: `User reply on ticket: ${message.subject}`,
                timestamp: new Date()
            });
        }
        
        const populatedMessage = await SupportMessage.findById(message._id).populate('replies.user', 'username profilePic');
        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while sending reply.' });
    }
});

// @desc    Reply to a support message
// @route   POST /api/support/:id/reply
// @access  Private/Admin
router.post('/:id/reply', protect, authorize('admin'), async (req, res) => {
    try {
        const { replyContent } = req.body;
        if (!replyContent) {
            return res.status(400).json({ success: false, message: 'Reply content is required.' });
        }

        const message = await SupportMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Support message not found.' });
        }

        // Add reply to the message
        const reply = {
            user: req.user.id,
            content: replyContent,
        };
        message.replies.push(reply);

        const ticketUrl = `${process.env.CLIENT_URL}/support/ticket/${message._id}`;
        const emailSubject = `Re: Your Support Ticket - ${message.subject}`;
        const emailMessage = `
            <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background-color: #800000; color: white; padding: 20px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 28px; font-family: 'Cinzel', serif;">Update on Your Support Ticket</h1>
                </div>
                <div style="padding: 30px 40px; color: #333; line-height: 1.6;">
                    <h2 style="color: #333333; font-weight: 600;">Hi ${message.name},</h2>
                    <p>A member of our team has replied to your support ticket regarding: <strong>"${message.subject}"</strong>.</p>
                    <div style="border-left: 4px solid #e8eb14; padding-left: 20px; margin: 25px 0; background-color: #fdfdfd;">
                    <p style="margin: 0; font-style: italic;">${replyContent}</p>
                    <p style="margin-top: 10px; font-size: 12px; color: #777;">- Replied by ${req.user.username} (Admin)</p>
                    </div>
                    <p>You can view the full conversation and reply by clicking the button below.</p>
                    <div style="text-align: center; margin: 40px 0;">
                    <a href="${ticketUrl}" style="background-color: #e8eb14; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid #d7d911;">View Your Ticket</a>
                    </div>
                    <p>Thank you for your patience.</p>
                    <p><em>- The Cook'N'Crop Team</em></p>
                </div>
                <div style="background-color: #fafafa; color: #777; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0;">Ticket ID: ${message._id}</p>
                    <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} Cook'N'Crop. All rights reserved.</p>
                </div>
                </div>
            </div>
        `;

        await sendEmail({ email: message.email, subject: emailSubject, message: emailMessage });

        if (message.status === 'Open') {
            message.status = 'In Progress';
        }
        await message.save();
        
        const populatedMessage = await SupportMessage.findById(message._id).populate('replies.user', 'username profilePic');

        res.status(200).json({ success: true, message: 'Reply sent successfully.', data: populatedMessage });
    } catch (error) {
        console.error('Reply to support message error:', error);
        res.status(500).json({ success: false, message: 'Server error while sending reply.' });
    }
});

module.exports = router;
