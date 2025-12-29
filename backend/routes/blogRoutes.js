const express = require("express");
const { createBlog, getBlogs, getBlogById, deleteBlog, getPersonalBlogs } = require("../controllers/blogController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 }
]), createBlog);
router.get("/personal", getPersonalBlogs);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.delete("/:id", deleteBlog);

module.exports = router;
