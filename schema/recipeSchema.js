const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
  recipeName: { type: String, required: true },
  creatorName: String,
  creatorId: String,
  recipeImages: [],
  description: String,
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  serving: { type: Number, required: true },
  prepTime: { hours: Number, minutes: { type: Number, required: true } },
  cookTime: { hours: Number, minutes: Number },
  tags: [],
  status: { type: String, default: "pending" },
  likedBy: [],
  savedBy: [],
  createdAt: { type: Date, default: () => Date.now.toString() },
});

module.exports = mongoose.model("recipe", recipeSchema);
