const express = require("express");
const router = express.Router();
const Recipe = require("../schema/recipeSchema");
const User = require("../schema/userSchema");
const SavedItem = require("../schema/savedItemSchema");
const { createNotification } = require("./notificationHandler");
const { verifyJwt, verifyAdmin } = require("../middlewares/verifyMids");
const errorResponse = require("../utils/errorResponse");

//post a recipe
router.post("/createRecipe", verifyJwt, async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json({
      message: "Recipe created successfully",
      id: savedRecipe._id,
    });
  } catch (error) {
    errorResponse(res, error);
  }
});

//get all recipes
router.get("/allRecipes", verifyJwt, verifyAdmin, async (req, res) => {
  try {
    const result = await Recipe.find(
      {},
      "recipeName creatorInfo recipeImages  ingredients prepTime cookTime status feedback createdAt"
    )
      .populate("creatorInfo")
      .sort({ createdAt: -1 });
    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

router.get("/allRecipes/approved", async (req, res) => {
  const categoryQuery = req.query.category;
  const pageNumber = req.query.page || 1;
  const dataPerPage = 2;

  try {
    const filter = { status: "approved" };

    if (categoryQuery) {
      filter.$and = [{ categories: { $in: categoryQuery } }];
    }

    let query = Recipe.find(
      filter,
      "recipeName creatorInfo recipeImages  ingredients prepTime cookTime categories status feedback createdAt"
    ).sort({ createdAt: -1 });

    if (req.query.page) {
      query = query
        .populate({ path: "creatorInfo", select: "name email photoURL" })
        .skip((pageNumber - 1) * dataPerPage)
        .limit(dataPerPage);
    }

    const result = await query.exec();

    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

// userSpecific recipes
router.get("/myRecipes", async (req, res) => {
  try {
    const userId = req.query.userId;
    const result = await Recipe.find(
      { creatorInfo: userId },
      "recipeName recipeImages  ingredients prepTime cookTime status feedback"
    );
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
    const result = await Recipe.findOne({ _id: recipeId }).populate(
      "creatorInfo"
    );
    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

// update status (by admin)
// we will check first if the the user updating the status is admin or not.
router.patch(
  "/updateRecipeStatus/:adminEmail",
  verifyJwt,
  verifyAdmin,
  async (req, res) => {
    const adminEmail = req.params.adminEmail;
    const { creatorEmail, recipeId, status, feedback } = req.body;
    try {
      const currentUser = await User.findOne({ email: adminEmail });
      if (currentUser.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized action" });
      }

      await Recipe.updateOne({ _id: recipeId }, { status, feedback });

      if (status !== "pending") {
        const savedNotification = await createNotification(
          creatorEmail,
          "recipe",
          recipeId,
          `Your recipe has been ${status}.`
        );
      }

      res.status(201).json({ message: "Recipe status changed successfully" });
    } catch (error) {
      errorResponse(res, error);
    }
  }
);

//update recipe (by user/creator)

router.put("/updateRecipe/:userEmail", verifyJwt, async (req, res) => {
  const userEmail = req.params.userEmail;
  const updatedRecipeBody = req.body;

  const { _id, creatorInfo } = updatedRecipeBody;

  try {
    const creator = await User.findOne({ _id: creatorInfo });

    if (userEmail !== creator.email) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id },
      { ...updatedRecipeBody, updatedAt: new Date().toString() },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(201).json({
      message: "Updated Successfully",
      id: updatedRecipe._id,
    });
  } catch (error) {
    errorResponse(res, error);
  }
});

router.delete("/deleteRecipe", verifyJwt, async (req, res) => {
  const deletingRecipeId = req.query.itemId;
  const currentUserEmail = req.query.userEmail;
  try {
    const deletingItem = await Recipe.findOne({
      _id: deletingRecipeId,
    }).populate("creatorInfo");

    if (deletingItem.creatorInfo.email !== currentUserEmail) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await SavedItem.deleteMany({
      item: deletingRecipeId,
    });

    await Recipe.deleteOne({ _id: deletingRecipeId });
    res.status(201).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    errorResponse(res, error);
  }
});

module.exports = router;
