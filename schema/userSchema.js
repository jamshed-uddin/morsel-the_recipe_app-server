const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, immutable: true },
  photoURL: {
    type: String,
    default: "https://i.ibb.co/Twp960D/default-profile-400x400.png",
  },
  bio: { type: String, default: "" },
  role: { type: String, default: "creator" },
  createdAt: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("User", userSchema);
