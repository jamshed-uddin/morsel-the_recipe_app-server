const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  notificationTo: { type: String, required: true },
  notificationFor: { type: String },
  itemId: { type: mongoose.Schema.Types.ObjectId },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  time: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Notifications", notificationSchema);
