const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to ensure directory exists
const ensureDirExists = (dirPath) => {
  // Use path.resolve to get an absolute path from the project root
  const absolutePath = path.resolve(dirPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
};

// Define storage for different upload types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    // Route-specific subdirectories
    if (req.baseUrl.includes('/users')) {
      uploadPath = 'uploads/profilePics/';
    } else if (req.baseUrl.includes('/products')) {
      uploadPath = 'uploads/productImages/';
    } else {
      // Fallback directory
      uploadPath = 'uploads/general/';
    }
    
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;