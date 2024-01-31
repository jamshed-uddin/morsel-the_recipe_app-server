const mongoose = require("mongoose");

// Define the schema for the categories collection
const categorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  photoURL: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Category", categorySchema);
