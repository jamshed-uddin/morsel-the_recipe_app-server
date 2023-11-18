const express = require("express");
const router = express.Router();
const Recipe = require("../schema/recipeSchema");
const Blog = require("../schema/blogSchema");
const User = require("../schema/userSchema");

//post a recipe
router.post("/createRecipe", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe created successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get all recipes
router.get("/recipes", async (req, res) => {
  try {
    await Recipe.find();
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get a single recipe
router.get("/singleRecipe/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    await Recipe.findOne({ _id: recipeId });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// update status (by admin)
// we will check first if the the user updating the status is admin or not.
router.patch("/updateStatus/:adminEmail", async (req, res) => {
  const adminEmail = req.params.adminEmail;
  const { recipeId, status } = req.body;
  try {
    const currentUser = await User.findOne({ email: adminEmail });
    if (currentUser.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await Recipe.updateOne({ _id: recipeId }, { $set: { status } });
    res.status(201).json({ message: "Recipe status changed successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//update recipe (by user/creator)

router.put("updateRecipe/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const updatedRecipeBody = req.body;
  const {
    _id,
    creatorInfo: { creatorEmail },
  } = updatedRecipeBody;

  try {
    if (userEmail !== creatorEmail) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id },
      updatedRecipeBody,
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(201).json({ message: "Updated Successfully", updatedRecipe });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

module.exports = router;
