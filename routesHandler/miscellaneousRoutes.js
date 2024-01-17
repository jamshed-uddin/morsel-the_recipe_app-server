const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Recipe = require("../schema/recipeSchema");
const Blog = require("../schema/blogSchema");
const User = require("../schema/userSchema");
const SavedItem = require("../schema/savedItemSchema");
const errorResponse = require("../utils/errorResponse");

// getting count of users, recipes and blogs
const getDocumentCount = async (model, query = {}) => {
  try {
    return await model.countDocuments(query);
  } catch (error) {
    throw error;
  }
};

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
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.get("/isLikedAndSaved", async (req, res) => {
  const userEmail = req.query.userEmail;
  const itemId = req.query.itemId;
  const itemType = req.query.itemType;

  try {
    const isItemExisting = await SavedItem.findOne({ userEmail, item: itemId });
    const isSaved = isItemExisting !== null;

    if (itemType === "recipe") {
      const item = await Recipe.findOne({ _id: itemId }).populate({
        path: "likedBy",
        select: "_id email ",
      });
      const userExistsInLikedBy = item.likedBy.find(
        (obj) => obj.email === userEmail
      );
      const isLiked = userExistsInLikedBy !== undefined;

      return res.status(201).json({ isSaved, isLiked });
    }

    if (itemType === "blog") {
      const item = await Blog.findOne({ _id: itemId }).populate({
        path: "likedBy",
        select: "_id email ",
      });

      const userExistsInLikedBy = item.likedBy.find(
        (obj) => obj.email === userEmail
      );

      const isLiked = userExistsInLikedBy !== undefined;

      return res.status(201).json({ isSaved, isLiked });
    }
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// dashboard overview
router.get("/overviewStates", async (req, res) => {
  try {
    const [totalUsers, admins, creators] = await Promise.all([
      getDocumentCount(User),
      getDocumentCount(User, { role: "admin" }),
      getDocumentCount(User, { role: "creator" }),
    ]);
    const [totalRecipes, approvedRecipes, pendingRecipes, deniedRecipes] =
      await Promise.all([
        getDocumentCount(Recipe),
        getDocumentCount(Recipe, { status: "approved" }),
        getDocumentCount(Recipe, { status: "pending" }),
        getDocumentCount(Recipe, { status: "denied" }),
      ]);
    const [totalBlogs, approvedBlogs, pendingBlogs, deniedBlogs] =
      await Promise.all([
        getDocumentCount(Blog),
        getDocumentCount(Blog, { status: "approved" }),
        getDocumentCount(Blog, { status: "pending" }),
        getDocumentCount(Blog, { status: "denied" }),
      ]);

    const overviewStates = {
      recipes: {
        total: totalRecipes,
        approved: approvedRecipes,
        pending: pendingRecipes,
        denied: deniedRecipes,
      },
      blogs: {
        total: totalBlogs,
        approved: approvedBlogs,
        pending: pendingBlogs,
        denied: deniedBlogs,
      },
      users: {
        total: totalUsers,
        admins: admins,
        creators: creators,
      },
    };

    res.status(200).send(overviewStates);
  } catch (error) {
    errorResponse(res, error);
  }
});

// quick recipe and trending recipe

router.get("/trendingQuickVoices", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).limit(6).exec();
  const recipes = await Recipe.find().sort({ createdAt: -1 });
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try {
    const trending = await Recipe.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $sort: {
          likedBy: -1,
        },
      },
    ]);

    const quickAndEasyRecipes = recipes.filter((recipe) => {
      return (
        recipe.ingredients.length < 8 ||
        parseInt(recipe.prepTime.hours) * 60 +
          parseInt(recipe.prepTime.minutes) <
          30 ||
        parseInt(recipe.prepTime.minutes) < 20
      );
    });

    const trendingQuickVoices = {
      trending,
      quickAndEasyRecipes,
      voices: blogs,
    };

    res.status(201).send(trendingQuickVoices);
  } catch (error) {
    errorResponse(res, error);
  }
});

// const recentRecipes = recipes?.filter((recipe) => {
//   const timeDifference = new Date() - new Date(recipe.createdAt);
//   const differenceInDays = parseInt(timeDifference / (1000 * 60 * 60 * 24));

//   return differenceInDays <= 7;
// });

// const sortedTrendingRecipes = recentRecipes?.sort(
//   (a, b) => b.likedBy?.length - a.likedBy?.length
// );

// // filtering for quick and easy recipes
// const filteredQuickRecipes = recipes?.filter((recipe) => {
//   return recipe.ingredients.length <= 7 || recipe.prepTime.minutes <= 20;
// });

// search route

router.get("/search", async (req, res) => {
  const searchQuery = req.query.q;

  try {
    if (!searchQuery) {
      return res.status(404).send({ error: "Search field is empty" });
    }
    const recipeData = await Recipe.find({
      $or: [{ recipeName: { $regex: new RegExp(searchQuery, "i") } }],
    });
    const blogData = await Blog.find({
      $or: [{ title: { $regex: new RegExp(searchQuery, "i") } }],
    });

    const searchResult = [...recipeData, ...blogData];

    res.status(201).send(searchResult);
  } catch (error) {
    errorResponse(res, error);
  }
});

// jwt
router.post("/jwt", async (req, res) => {
  const email = req.body;
  const token = jwt.sign(email, process.env.JWT_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  res.send({ token });
});

module.exports = router;
