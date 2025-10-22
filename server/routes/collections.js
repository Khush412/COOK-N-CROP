const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Collection = require('../models/Collection');
const Post = require('../models/Post');

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Collection name is required.' });
    }
    const collection = new Collection({
      name,
      description,
      isPublic,
      user: req.user.id,
    });
    const createdCollection = await collection.save();
    res.status(201).json(createdCollection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all collections for the logged-in user
// @route   GET /api/collections/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('name postCount posts description');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single collection by ID
// @route   GET /api/collections/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate({
        path: 'posts',
        populate: { path: 'user', select: 'username profilePic' }
      });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a collection's details
// @route   PUT /api/collections/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    collection.name = name || collection.name;
    collection.description = description !== undefined ? description : collection.description;
    if (isPublic !== undefined) {
      collection.isPublic = isPublic;
    }

    const updatedCollection = await collection.save();
    res.json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add or remove a post from multiple collections
// @route   PUT /api/collections/posts/:postId
// @access  Private
router.put('/posts/:postId', protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const { collectionIds } = req.body; // An array of collection IDs this post should be in

    if (!Array.isArray(collectionIds)) {
      return res.status(400).json({ message: 'collectionIds must be an array.' });
    }

    // Get all of the user's collections
    const userCollections = await Collection.find({ user: req.user.id });

    const updatePromises = userCollections.map(collection => {
      const collectionIdStr = collection._id.toString();
      const shouldHavePost = collectionIds.includes(collectionIdStr);
      const hasPost = collection.posts.includes(postId);

      if (shouldHavePost && !hasPost) {
        // Add post to collection
        collection.posts.push(postId);
        return collection.save();
      } else if (!shouldHavePost && hasPost) {
        // Remove post from collection
        collection.posts.pull(postId);
        return collection.save();
      }
      return Promise.resolve(); // No change needed
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Collections updated.' });
  } catch (error) {
    console.error('Update collections error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await collection.deleteOne();
    res.json({ message: 'Collection removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get public collections for a specific user
// @route   GET /api/collections/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.params.userId, isPublic: true })
      .sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;