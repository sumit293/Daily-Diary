const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video/audio
  },
  fileFilter: (req, file, cb) => {
    // Accept image, audio, and video files
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image, audio, and video files are allowed!"), false);
    }
  },
});

module.exports = upload;

