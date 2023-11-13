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
    res.status(401).json({ error: "Something went wrong" });
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
    res.status(201).json(updatedRecipe);
  } catch (error) {
    res.status(401).json({ error: "Something went wrong" });
  }
});

//update liked by
router.patch("/changeReaction/:id", async (req, res) => {
  const id = req.params.id; //this id may come from recipe or blog
  const { userId, action, actionFrom } = req.body;

  try {
    //if action from recipe
    if (actionFrom === "recipe") {
      //checking if the recipe is available
      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ error: "Item not found" });
      }
      //if the recipe available the like/dislike operation will execute
      if (action === "like") {
        await Recipe.findByIdAndUpdate(id, {
          $push: { likedBy: userId },
        });

        return res.status(201).json({ message: "Liked successfully" });
      }
      if (action === "dislike") {
        await Recipe.findByIdAndUpdate(id, {
          $pull: { likedBy: userId },
        });

        return res.status(201).json({ message: "Disliked successfully" });
      }
      return;
    }

    //if action from blog
    if (actionFrom === "blog") {
      //checking if the blog is available
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ error: "Item not found" });
      }
      //if the blog available the like/dislike operation will execute
      if (action === "like") {
        await Blog.findByIdAndUpdate(id, {
          $push: { likedBy: userId },
        });

        return res.status(201).json({ message: "Liked successfully" });
      }
      if (action === "dislike") {
        await Blog.findByIdAndUpdate(id, {
          $pull: { likedBy: userId },
        });

        return res.status(201).json({ message: "Disliked successfully" });
      }
      return;
    }
  } catch (error) {
    res.status(401).json({ error: "Something went wrong" });
  }
});

module.exports = router;
