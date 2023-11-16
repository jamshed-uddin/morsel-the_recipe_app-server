const express = require("express");
const router = express.Router();
const SavedItem = require("../schema/savedItemSchema");
const mongoose = require("mongoose");

router.get("/savedItem", async (req, res) => {
  const userId = req.query.userId;
  const itemType = req.query.itemType;

  //item type for filtering item with Recipe/Blog/All

  try {
    if (itemType === "All") {
      const savedItems = await SavedItem.find({ userId }).populate({
        path: "item",
        select: "recipeName recipeImages ingredients prepTime ",
      });
      return res.status(201).json(savedItems);
    }

    const savedItems = await SavedItem.find({
      $and: [{ userId }, { itemType }],
    }).populate({
      path: "item",
      select: "recipeName recipeImages ingredients prepTime",
    });
    // const populatedItem = savedItem.populate("item");
    res.status(201).json(savedItems);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Something went wrong" });
  }
});

router.post("/saveNewItem/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const { userId, userEmail, itemType } = req.body;
  // itemId here is the original item(recipe/blog) id that has in their own collection
  try {
    // checking if the same user trying to save a item twice.
    const isItemExisting = await SavedItem.findOne({ userEmail, item: itemId });
    if (isItemExisting) {
      return res.status(401).json({ error: `${itemType} already selected` });
    }

    // if the item user saving is unique to the user's savedItem collection
    const savedItem = new SavedItem({
      userId: new mongoose.Types.ObjectId(userId),
      item: new mongoose.Types.ObjectId(itemId),
      userEmail,
      itemType,
    });
    await savedItem.save();

    res.status(201).json({ message: "Item saved successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// savedBy length
router.get("/savedByLength/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  // itemId here is the original item(recipe/blog) id that has in their own collection

  try {
    const savedItems = await SavedItem.find({ item: itemId });
    const savedItemsLength = savedItems.length;

    res.status(201).json({ timesSaved: parseInt(savedItemsLength) });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//delete saved item
router.delete("/deleteSavedItem/:itemId", async (req, res) => {
  try {
    await SavedItem.deleteOne({ _id: req.params.itemId });

    res.status(201).json({ message: "Deleted successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

module.exports = router;
