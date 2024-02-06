const mongoose = require("mongoose");

const savedItemSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEmail: { type: String, required: true, ref: "User" },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "itemType",
  },
  itemType: {
    type: String,
    enum: ["Recipe", "Blog"],
    required: true,
  },
});

module.exports = mongoose.model("SavedItem", savedItemSchema);
