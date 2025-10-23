/**
 * Image and media helper utilities
 */

/**
 * Get full URL for image path
 * Handles both external URLs (OAuth) and local uploads
 * @param {string} imagePath - Image path or URL
 * @returns {string|undefined} - Full image URL or undefined
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return undefined;
  
  // If already a full URL (OAuth avatars from Google, GitHub, LinkedIn)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Local upload - prepend API URL
  return `${process.env.REACT_APP_API_URL}${imagePath}`;
};

/**
 * Get avatar URL with fallback
 * @param {Object} user - User object
 * @returns {string|undefined} - Avatar URL or undefined for default avatar
 */
export const getAvatarUrl = (user) => {
  if (!user) return undefined;
  return getImageUrl(user.profilePic);
};

/**
 * Get product image URL with placeholder fallback
 * @param {Object} product - Product object
 * @returns {string} - Product image URL or placeholder
 */
export const getProductImageUrl = (product) => {
  if (!product || !product.image) {
    return `${process.env.PUBLIC_URL}/images/placeholder.png`;
  }
  return getImageUrl(product.image);
};

/**
 * Get media URL (for posts)
 * @param {string} mediaPath - Media file path
 * @returns {string} - Full media URL
 */
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return '';
  return getImageUrl(mediaPath);
};

/**
 * Validate image file type
 * @param {File} file - File object
 * @returns {boolean} - True if valid image
 */
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Validate video file type
 * @param {File} file - File object
 * @returns {boolean} - True if valid video
 */
export const isValidVideoFile = (file) => {
  const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
  return validTypes.includes(file.type);
};

/**
 * Validate media file (image or video)
 * @param {File} file - File object
 * @returns {boolean} - True if valid media file
 */
export const isValidMediaFile = (file) => {
  return isValidImageFile(file) || isValidVideoFile(file);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
