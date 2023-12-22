const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
  recipeName: { type: String, required: true },
  creatorInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipeImages: [],
  description: String,
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  serving: { type: Number, required: true },
  prepTime: { hours: String, minutes: { type: String, required: true } },
  cookTime: { hours: String, minutes: String },
  tags: [],
  categories: [],
  status: { type: String, default: "approved" },
  feedback: { type: String, default: "" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: () => Date.now() },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("Recipe", recipeSchema);
