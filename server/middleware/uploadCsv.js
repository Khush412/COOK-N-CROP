const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage path for CSV files
const csvUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'csv');

// Ensure directory exists
fs.mkdirSync(csvUploadDir, { recursive: true });

const csvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, csvUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'products-' + uniqueSuffix + path.extname(file.originalname));
  }
});

function checkCsvFileType(file, cb) {
  // Allow only CSV files
  const filetypes = /csv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: CSV Files Only!'));
  }
}

const uploadCsv = multer({
  storage: csvStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    checkCsvFileType(file, cb);
  }
});

module.exports = uploadCsv;