const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, immutable: true },
  photoURL: String,
  role: { type: String, default: "creator" },
});

module.exports = mongoose.model("user", userSchema);
