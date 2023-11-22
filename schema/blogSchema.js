const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  creatorInfo: {
    creatorName: String,
    creatorId: String,
    creatorEmail: String,
    creatorPhoto: String,
  },
  previewImage: { type: String },
  blogBody: { type: String, required: true },
  status: { type: String, default: "pending" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, refPath: "User" }],
  tags: [],
  createdAt: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Blog", blogSchema);
