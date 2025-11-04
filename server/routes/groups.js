const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const Post = require('../models/Post');
const slugify = require('slugify');
const upload = require('../middleware/upload');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const { name, description, isPrivate, rules, flairs } = req.body; // Added flairs

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    // Generate slug to check for uniqueness before creating the group
    const slug = slugify(name, { lower: true, strict: true });

    const existingGroupByName = await Group.findOne({ name });
    if (existingGroupByName) {
      return res.status(400).json({ message: 'A group with that name already exists.' });
    }
    const existingGroupBySlug = await Group.findOne({ slug });
    if (existingGroupBySlug) {
      return res.status(400).json({ message: 'A group with a similar name already exists, resulting in a duplicate URL.' });
    }

    const group = new Group({
      name,
      description,
      creator: req.user.id,
      isPrivate: isPrivate === 'true',
      rules: rules ? JSON.parse(rules) : [],
      flairs: flairs ? JSON.parse(flairs) : [], // Added flairs
      moderators: [req.user.id],
      members: [req.user.id],
    });

    if (req.file) {
      group.coverImage = `/uploads/groupCovers/${req.file.filename}`;
    }

    const createdGroup = await group.save();

    // Also add this group to the user's subscriptions
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { subscriptions: createdGroup._id } });

    res.status(201).json(createdGroup);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all groups for discovery
// @route   GET /api/groups
// @access  Public
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().sort({ memberCount: -1 }).select('name slug description coverImage memberCount');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single group by slug
// @route   GET /api/groups/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const group = await Group.findOne({ slug: req.params.slug }) // Populate bannedUsers and joinRequests for frontend checks
      .populate('bannedUsers', 'username profilePic')
      .populate('creator', 'username profilePic')
      .populate('moderators', 'username profilePic')
      .populate('joinRequests', 'username profilePic');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a group's members for management
// @route   GET /api/groups/:id/members
// @access  Private (Group Moderator or Admin)
router.get('/:id/members', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'username profilePic');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Authorization check
    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to view members' });
    }

    res.json(group.members);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a member's role (promote/demote)
// @route   PUT /api/groups/:id/members/:memberId
// @access  Private (Group Moderator or Admin)
router.put('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const { role } = req.body; // 'moderator' or 'member'
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Authorization: Must be creator or admin to promote/demote
    if (group.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the group creator can manage moderators.' });
    }

    if (role === 'moderator') {
      await Group.findByIdAndUpdate(req.params.id, { $addToSet: { moderators: req.params.memberId } });
    } else { // demote to member
      // Prevent creator from being demoted
      if (group.creator.toString() === req.params.memberId) {
        return res.status(400).json({ message: 'The group creator cannot be demoted.' });
      }
      await Group.findByIdAndUpdate(req.params.id, { $pull: { moderators: req.params.memberId } });
    }

    res.json({ success: true, message: 'Member role updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Remove (ban) a member from a group
// @route   DELETE /api/groups/:id/members/:memberId
// @access  Private (Group Moderator or Admin)
router.delete('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Prevent creator from being removed
    if (group.creator.toString() === req.params.memberId) {
      return res.status(400).json({ message: 'The group creator cannot be removed.' });
    }

    await Group.findByIdAndUpdate(req.params.id, { $pull: { members: req.params.memberId, moderators: req.params.memberId } });
    // Also remove from user's subscriptions
    await User.findByIdAndUpdate(req.params.memberId, { $pull: { subscriptions: group._id } });
    // If banning, add to bannedUsers list
    if (req.body.action === 'ban') {
      await Group.findByIdAndUpdate(req.params.id, { $addToSet: { bannedUsers: req.params.memberId } });
    }
    res.json({ success: true, message: 'Member removed from group.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a group's details
// @route   PUT /api/groups/:id
// @access  Private (Group Moderator or Admin)
router.put('/:id', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const { description, isPrivate, rules, flairs } = req.body; // Added flairs
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Authorization check: User must be a moderator or an admin
    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to edit this group' });
    }

    group.description = description || group.description;
    if (isPrivate !== undefined) {
      group.isPrivate = isPrivate === 'true';
    }
    if (rules) {
      group.rules = JSON.parse(rules);
    }
    if (flairs) { // Added flairs update
      group.flairs = JSON.parse(flairs);
    }
    if (req.file) {
      group.coverImage = `/uploads/groupCovers/${req.file.filename}`;
    }

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Group Creator or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Authorization: Must be creator or admin
    if (group.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the group creator or an admin can delete this group.' });
    }

    const groupId = group._id;

    // 1. Find all posts in the group
    const postsInGroup = await Post.find({ group: groupId }).select('_id');
    const postIds = postsInGroup.map(p => p._id);

    // 2. Delete all posts and their comments (if any - though Post model doesn't store comments directly, this is good practice)
    await Post.deleteMany({ group: groupId });

    // 3. Remove group from all users' subscriptions
    await User.updateMany({ subscriptions: groupId }, { $pull: { subscriptions: groupId } });

    // 4. Delete the group itself
    await group.deleteOne();

    res.json({ success: true, message: 'Group and all its content have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Join or leave a group
// @route   POST /api/groups/:id/toggle-membership
// @access  Private
router.post('/:id/toggle-membership', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if user is banned
    if (group.bannedUsers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are banned from this group.' });
    }

    // If group is private and user is not a member, check join requests
    if (group.isPrivate && !group.members.includes(req.user.id)) {
      if (group.joinRequests.includes(req.user.id)) {
        return res.status(400).json({ message: 'You have already requested to join this group.' });
      }
      group.joinRequests.push(req.user.id);
      await group.save();
      return res.json({ message: 'Your request to join has been sent.' });
    }

    const isMember = group.members.includes(req.user.id);
    if (isMember) {
      // Leave group
      // Prevent creator from leaving
      if (group.creator.equals(req.user.id)) {
        return res.status(400).json({ message: 'As the creator, you cannot leave the group. You can delete it instead.' });
      }
      // Prevent moderators from leaving
      if (group.moderators.includes(req.user.id)) {
        return res.status(400).json({ message: 'Moderators cannot leave the group. You must be demoted to a member first.' });
      }
      group.members.pull(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $pull: { subscriptions: group._id } });
    } else {
      // Join group
      group.members.push(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { subscriptions: group._id } });
    }
    group.memberCount = group.members.length;
    await group.save();
    res.json({ memberCount: group.memberCount, isMember: !isMember });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a group's posts
// @route   GET /api/groups/:slug/posts
// @access  Public
router.get('/:slug/posts', async (req, res) => {
  try {
    const { sort = 'new', page = 1, limit = 10, search, isRecipe } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const group = await Group.findOne({ slug: req.params.slug });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const matchConditions = { group: group._id };
    if (search) {
      // Add text search condition if a search term is provided
      matchConditions.$text = { $search: search };
    }
    
    // Add isRecipe filter if provided
    if (isRecipe !== undefined) {
      matchConditions.isRecipe = isRecipe === 'true';
    }

    let sortOption = { createdAt: -1 }; // Default to 'new'
    if (sort === 'top') {
      sortOption = { voteScore: -1, createdAt: -1 };
    }

    const pipeline = [{ $match: matchConditions }];

    if (sort === 'top') {
      pipeline.push({ $sort: { isPinned: -1, voteScore: -1, createdAt: -1 } });
    } else if (sort === 'discussed') {
      pipeline.push({ $addFields: { commentCount: { $size: { $ifNull: ['$comments', []] } } } });
      pipeline.push({ $sort: { isPinned: -1, commentCount: -1, createdAt: -1 } });
    } else if (sort === 'hot') {
      const gravity = 1.8;
      pipeline.push({ $addFields: { ageInHours: { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 3600000] } } });
      pipeline.push({ $addFields: { hotScore: { $divide: ['$voteScore', { $pow: [{ $add: ['$ageInHours', 2] }, gravity] }] } } });
      pipeline.push({ $sort: { isPinned: -1, hotScore: -1 } });
    } else {
      pipeline.push({ $sort: { isPinned: -1, createdAt: -1 } });
    }

    // Add the group info to each post so the frontend knows who the moderators are
    pipeline.push({ $addFields: {
      group: { _id: group._id, name: group.name, slug: group.slug, moderators: group.moderators, creator: group.creator }
    }});
    // Add pagination, lookup, and projection stages
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          title: 1,
          content: 1,
          media: 1,
          tags: 1,
          isRecipe: 1,
          isFeatured: 1,
          isPinned: 1, // This was missing
          createdAt: 1,
          upvotes: 1,
          user: { _id: '$user._id', username: '$user.username', profilePic: '$user.profilePic' },
          flair: 1, // Include flair in post projection
          // We need to re-assert the group field here after the lookups
          group: '$group',
          upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
          commentCount: { $size: { $ifNull: ['$comments', []] } },
        }
      }
    );

    const posts = await Post.aggregate(pipeline);

    const totalPosts = await Post.countDocuments(matchConditions);

    res.json({
      posts,
      page: pageNum,
      pages: Math.ceil(totalPosts / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get pending join requests for a group
// @route   GET /api/groups/:id/requests
// @access  Private (Group Moderator or Admin)
router.get('/:id/requests', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('joinRequests', 'username profilePic');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Authorization check: User must be a moderator or an admin
    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to view join requests' });
    }

    res.json(group.joinRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Approve or deny a join request
// @route   PUT /api/groups/:id/requests/:userId
// @access  Private (Group Moderator or Admin)
router.put('/:id/requests/:userId', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'deny'
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Authorization check: User must be a moderator or an admin
    const isModerator = group.moderators.some(modId => modId.equals(req.user.id));
    if (!isModerator && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to handle join requests' });
    }

    // Check if user has requested to join
    const hasRequested = group.joinRequests.includes(req.params.userId);
    if (!hasRequested) {
      return res.status(400).json({ message: 'User has not requested to join this group' });
    }

    if (action === 'approve') {
      // Add user to members
      group.members.push(req.params.userId);
      await User.findByIdAndUpdate(req.params.userId, { $addToSet: { subscriptions: group._id } });
    }

    // Remove from join requests (whether approved or denied)
    group.joinRequests.pull(req.params.userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ success: true, message: `Join request ${action}d.` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
