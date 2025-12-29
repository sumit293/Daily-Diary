const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    audio: String,
    video: String,
    author: { type: String, default: "Admin" },
    personal: { type: Boolean, default: false }
  },
  { timestamps: true }  
);

module.exports = mongoose.model("Blog", blogSchema);
