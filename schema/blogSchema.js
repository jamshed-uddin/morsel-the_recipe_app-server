const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  creatorInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  previewImage: { type: String },
  blogBody: { type: String, required: true },
  status: { type: String, default: "approved" },
  feedback: { type: String, default: "" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tags: [],
  createdAt: { type: Date, default: () => Date.now() },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("Blog", blogSchema);
