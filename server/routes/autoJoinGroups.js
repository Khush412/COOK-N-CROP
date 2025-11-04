const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const AutoJoinGroups = require('../models/AutoJoinGroups');
const Group = require('../models/Group');

// @desc    Get auto-join groups configuration
// @route   GET /api/auto-join-groups
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    let config = await AutoJoinGroups.findOne({ isActive: true });
    
    // If no configuration exists, create a default one
    if (!config) {
      config = new AutoJoinGroups({ groups: [] });
      await config.save();
    }
    
    // Populate group details
    if (config.groups.length > 0) {
      await config.populate('groups');
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get auto-join config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update auto-join groups configuration
// @route   PUT /api/auto-join-groups
// @access  Private/Admin
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { groups } = req.body;
    
    // Validate that all group IDs are valid
    if (groups && groups.length > 0) {
      for (const groupId of groups) {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid group ID: ${groupId}`
          });
        }
        
        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
          return res.status(400).json({
            success: false,
            message: `Group not found with ID: ${groupId}`
          });
        }
      }
    }
    
    // Deactivate existing configuration
    await AutoJoinGroups.updateMany({ isActive: true }, { isActive: false });
    
    // Create new active configuration
    const config = new AutoJoinGroups({
      groups: groups || [],
      isActive: true
    });
    
    await config.save();
    
    // Populate group details
    if (config.groups.length > 0) {
      await config.populate('groups');
    }
    
    res.status(200).json({
      success: true,
      data: config,
      message: 'Auto-join configuration updated successfully'
    });
  } catch (error) {
    console.error('Update auto-join config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get all public groups for selection
// @route   GET /api/auto-join-groups/all-groups
// @access  Private/Admin
router.get('/all-groups', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all public groups
    const groups = await Group.find({ isPrivate: false })
      .select('name slug description memberCount coverImage')
      .sort({ memberCount: -1 });
    
    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Get all groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

module.exports = router;