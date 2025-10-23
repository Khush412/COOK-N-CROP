const User = require('../models/User');

// Limits to prevent abuse
const MAX_MENTIONS = 10;
const MAX_HASHTAGS = 20;

/**
 * Extract mentions (@username) from text
 * @param {String} text - The text to parse
 * @returns {Array} - Array of usernames mentioned (limited to MAX_MENTIONS)
 */
const extractMentions = (text) => {
  if (!text) return [];
  // Match @username (letters, numbers, underscores, 3-30 chars)
  const mentionRegex = /@([a-zA-Z0-9_]{3,30})\b/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // match[1] is the username without @
  }
  
  // Remove duplicates and limit to MAX_MENTIONS
  return [...new Set(mentions)].slice(0, MAX_MENTIONS);
};

/**
 * Extract hashtags (#tag) from text
 * @param {String} text - The text to parse
 * @returns {Array} - Array of hashtags (lowercase, without #, limited to MAX_HASHTAGS)
 */
const extractHashtags = (text) => {
  if (!text) return [];
  // Match #hashtag (letters, numbers, underscores, at least 2 chars)
  const hashtagRegex = /#([a-zA-Z0-9_]{2,50})\b/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase()); // Lowercase for consistency
  }
  
  // Remove duplicates and limit to MAX_HASHTAGS
  return [...new Set(hashtags)].slice(0, MAX_HASHTAGS);
};

/**
 * Validate and get user IDs from mentioned usernames
 * @param {Array} usernames - Array of usernames
 * @returns {Array} - Array of valid user IDs
 */
const validateMentions = async (usernames) => {
  if (!usernames || usernames.length === 0) return [];
  
  try {
    const users = await User.find({ username: { $in: usernames } }).select('_id');
    return users.map(user => user._id);
  } catch (error) {
    console.error('Error validating mentions:', error);
    return [];
  }
};

/**
 * Convert text with mentions and hashtags to HTML with links
 * @param {String} text - The text to convert
 * @param {String} baseUrl - Base URL for links (e.g., http://localhost:3000)
 * @returns {String} - HTML string with clickable links
 */
const linkifyText = (text, baseUrl = '') => {
  if (!text) return '';
  
  let linkedText = text;
  
  // Convert mentions to links
  linkedText = linkedText.replace(
    /@([a-zA-Z0-9_]{3,30})\b/g,
    `<a href="${baseUrl}/user/$1" class="mention">@$1</a>`
  );
  
  // Convert hashtags to links
  linkedText = linkedText.replace(
    /#([a-zA-Z0-9_]{2,50})\b/g,
    `<a href="${baseUrl}/search?q=%23$1" class="hashtag">#$1</a>`
  );
  
  return linkedText;
};

module.exports = {
  extractMentions,
  extractHashtags,
  validateMentions,
  linkifyText,
};
