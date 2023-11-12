const express = require("express");
const router = express.Router();
const Recipe = require("../schema/recipeSchema");

//post a recipe
router.post("/createRecipe", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe created successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Something went wrong" });
  }
});

//get all recipes
router.get("/recipes", async (req, res) => {
  await Recipe.find()
    .then((result) => res.status(201).json(result))
    .catch((error) => res.status(401).json({ error: "Something went wrong" }));
});

//get a single recipe
router.get("/singleRecipe/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;
  await Recipe.findOne({ _id: recipeId })
    .then((result) => res.status(201).json(result))
    .catch((error) => res.status(401).json({ error: "Something went wrong" }));
});

// update status (by admin)
// we will check first if the the user updating the status is admin or not.

//update recipe (by user/creator)

module.exports = router;