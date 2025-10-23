/**
 * Application-wide constants
 */

// Pagination defaults
const PAGINATION = {
  POSTS_PER_PAGE: 9,
  PRODUCTS_PER_PAGE: 12,
  USERS_PER_PAGE: 12,
  SEARCH_RESULTS_LIMIT: 5,
  COMMENTS_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  DEFAULT_PAGE: 1,
};

// File upload limits
const FILE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_POST: 10,
  MAX_PRODUCT_IMAGES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm', 'video/ogg'],
};

// Content limits
const CONTENT_LIMITS = {
  POST_TITLE_MIN: 3,
  POST_TITLE_MAX: 200,
  POST_CONTENT_MIN: 10,
  POST_CONTENT_MAX: 10000,
  COMMENT_MIN: 1,
  COMMENT_MAX: 2000,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PASSWORD_MIN: 6,
  BIO_MAX: 500,
  MAX_TAGS_PER_POST: 5,
  MAX_MENTIONS: 10,
  MAX_HASHTAGS: 20,
};

// Rate limiting
const RATE_LIMITS = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GENERAL_MAX_REQUESTS_PROD: 200,
  GENERAL_MAX_REQUESTS_DEV: 10000,
  AUTH_MAX_REQUESTS_PROD: 30,
  AUTH_MAX_REQUESTS_DEV: 1000,
  UPLOAD_MAX_REQUESTS_PROD: 20,
  UPLOAD_MAX_REQUESTS_DEV: 100,
};

// Token/Session settings
const AUTH = {
  JWT_EXPIRE: '7d',
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Notification settings
const NOTIFICATIONS = {
  DEDUPLICATION_WINDOW_MS: 5 * 60 * 1000, // 5 minutes - prevent spam
  MAX_UNREAD: 100, // Archive old notifications
};

// Socket.IO settings
const SOCKET = {
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
};

// Search settings
const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  TRENDING_TAGS_LIMIT: 10,
  TRENDING_DAYS: 30,
};

module.exports = {
  PAGINATION,
  FILE_LIMITS,
  CONTENT_LIMITS,
  RATE_LIMITS,
  AUTH,
  NOTIFICATIONS,
  SOCKET,
  SEARCH,
};
