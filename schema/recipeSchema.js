const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
  recipeName: { type: String, required: true },
  creatorInfo: {
    creatorName: String,
    creatorId: String,
    creatorEmail: String,
    creatorPhoto: String,
  },
  recipeImages: [],
  description: String,
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  serving: { type: Number, required: true },
  prepTime: { hours: Number, minutes: { type: Number, required: true } },
  cookTime: { hours: Number, minutes: Number },
  tags: [],
  status: { type: String, default: "pending" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Recipe", recipeSchema);
