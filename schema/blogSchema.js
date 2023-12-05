const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  creatorInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  previewImage: { type: String },
  blogBody: { type: String, required: true },
  status: { type: String, default: "pending" },
  feedback: { type: String, default: "" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tags: [],
  createdAt: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Blog", blogSchema);
