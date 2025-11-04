const mongoose = require('mongoose');

const AutoJoinGroupsSchema = new mongoose.Schema({
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one document exists for auto-join configuration
AutoJoinGroupsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AutoJoinGroups', AutoJoinGroupsSchema);