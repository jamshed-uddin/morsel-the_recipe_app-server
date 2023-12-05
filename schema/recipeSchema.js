const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
  recipeName: { type: String, required: true },
  creatorInfo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipeImages: [],
  description: String,
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  serving: { type: Number, required: true },
  prepTime: { hours: Number, minutes: { type: Number, required: true } },
  cookTime: { hours: Number, minutes: Number },
  tags: [],
  status: { type: String, default: "pending" },
  feedback: { type: String, default: "" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Recipe", recipeSchema);
