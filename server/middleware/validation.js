const { body, validationResult } = require('express-validator');
const { CONTENT_LIMITS } = require('../config/constants');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for post creation/update
 */
const postValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: CONTENT_LIMITS.POST_TITLE_MIN, max: CONTENT_LIMITS.POST_TITLE_MAX })
    .withMessage(`Title must be between ${CONTENT_LIMITS.POST_TITLE_MIN} and ${CONTENT_LIMITS.POST_TITLE_MAX} characters`),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: CONTENT_LIMITS.POST_CONTENT_MIN, max: CONTENT_LIMITS.POST_CONTENT_MAX })
    .withMessage(`Content must be between ${CONTENT_LIMITS.POST_CONTENT_MIN} and ${CONTENT_LIMITS.POST_CONTENT_MAX} characters`),
  
  body('group')
    .notEmpty().withMessage('Group is required')
    .isMongoId().withMessage('Invalid group ID'),
];

/**
 * Validation rules for comment creation/update
 */
const commentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: CONTENT_LIMITS.COMMENT_MIN, max: CONTENT_LIMITS.COMMENT_MAX })
    .withMessage(`Comment must be between ${CONTENT_LIMITS.COMMENT_MIN} and ${CONTENT_LIMITS.COMMENT_MAX} characters`),
];

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: CONTENT_LIMITS.USERNAME_MIN, max: CONTENT_LIMITS.USERNAME_MAX })
    .withMessage(`Username must be between ${CONTENT_LIMITS.USERNAME_MIN} and ${CONTENT_LIMITS.USERNAME_MAX} characters`)
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: CONTENT_LIMITS.PASSWORD_MIN }).withMessage(`Password must be at least ${CONTENT_LIMITS.PASSWORD_MIN} characters`),
];

/**
 * Validation rules for product creation/update
 */
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  
  body('countInStock')
    .notEmpty().withMessage('Stock count is required')
    .isInt({ min: 0 }).withMessage('Stock count must be a positive integer'),
];

/**
 * Validation rules for reporting
 */
const reportValidation = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
];

module.exports = {
  validate,
  postValidation,
  commentValidation,
  registerValidation,
  productValidation,
  reportValidation,
};
