const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage paths
const profilePicsDir = path.join(__dirname, '..', 'public', 'uploads', 'profilePics');
const productImagesDir = path.join(__dirname, '..', 'public', 'uploads', 'productImages');
const recipeMediaDir = path.join(__dirname, '..', 'public', 'uploads', 'recipes');
const groupCoversDir = path.join(__dirname, '..', 'public', 'uploads', 'groupCovers');

// Ensure directories exist
fs.mkdirSync(profilePicsDir, { recursive: true });
fs.mkdirSync(productImagesDir, { recursive: true });
fs.mkdirSync(recipeMediaDir, { recursive: true });
fs.mkdirSync(groupCoversDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dynamically set destination based on the fieldname of the upload
    if (file.fieldname === 'profilePic') {
      cb(null, profilePicsDir);
    } else if (file.fieldname === 'images') { // Updated to handle multiple images
      cb(null, productImagesDir);
    } else if (file.fieldname === 'media') {
      cb(null, recipeMediaDir);
    } else if (file.fieldname === 'coverImage') {
      cb(null, groupCoversDir);
    } else {
      // Fallback or error
      cb(new Error('Invalid upload fieldname for file storage.'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm|ogg/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;