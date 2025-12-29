const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on mimetype
    let resourceType = "auto"; // Cloudinary will auto-detect
    if (mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (mimetype.startsWith("audio/")) {
      resourceType = "video"; // Cloudinary treats audio as video resource
    } else {
      resourceType = "image";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

exports.createBlog = async (req, res) => {
  try {
    let imageUrl = req.body.image;
    let audioUrl = req.body.audio;
    let videoUrl = req.body.video;

    // Handle multiple files from FormData
    // req.files is an object with field names as keys when using upload.fields()
    if (req.files) {
      // Handle image
      if (req.files.image && req.files.image[0]) {
        imageUrl = await uploadToCloudinary(req.files.image[0].buffer, req.files.image[0].mimetype);
      }
      
      // Handle audio
      if (req.files.audio && req.files.audio[0]) {
        audioUrl = await uploadToCloudinary(req.files.audio[0].buffer, req.files.audio[0].mimetype);
      }
      
      // Handle video
      if (req.files.video && req.files.video[0]) {
        videoUrl = await uploadToCloudinary(req.files.video[0].buffer, req.files.video[0].mimetype);
      }
    } else if (req.file) {
      // Fallback for single file upload
      const uploadedUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      if (req.file.mimetype.startsWith("image/")) {
        imageUrl = uploadedUrl;
      } else if (req.file.mimetype.startsWith("audio/")) {
        audioUrl = uploadedUrl;
      } else if (req.file.mimetype.startsWith("video/")) {
        videoUrl = uploadedUrl;
      }
    }

    const blogData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || "Admin",
      image: imageUrl,
      audio: audioUrl,
      video: videoUrl,
      personal: req.body.personal === "true" || req.body.personal === true,
    };

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: error.message || "Failed to create blog" });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    // Only return non-personal blogs for public view
    const blogs = await Blog.find({ personal: { $ne: true } }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

exports.getPersonalBlogs = async (req, res) => {
  try {
    // Return only personal blogs
    const blogs = await Blog.find({ personal: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching personal blogs:", error);
    res.status(500).json({ error: "Failed to fetch personal blogs" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { password } = req.query;
    
    // Check if password is correct
    if (password !== "1947") {
      return res.status(401).json({ error: "Incorrect password. Cannot delete blog." });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully", blog });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};
