const express = require("express");
const router = express.Router();
const Recipe = require("../schema/recipeSchema");
const Blog = require("../schema/blogSchema");

//update liked by for both blog and recipe
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
    }
  } catch (error) {
    res.status(401).json({ error: "Something went wrong" });
  }
});

module.exports = router;
