const express = require("express");
const router = express.Router();
const SavedItem = require("../schema/savedItemSchema");
const mongoose = require("mongoose");

router.get("/savedItem", async (req, res) => {
  const userId = req.query.userId;
  const itemType = req.query.itemType;

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

  try {
    const userSpecificItem = await SavedItem.find({
      $and: [{ userEmail }, { itemId }],
    });
    if (userSpecificItem) {
      return res.status(401).json({ error: "Item already saved" });
    }

    const savedItem = new SavedItem({
      userId: new mongoose.Types.ObjectId(userId),
      item: new mongoose.Types.ObjectId(itemId),
      userEmail,
      itemType,
    });
    await savedItem.save();

    res.status(201).json({ message: "Item saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Something went wrong" });
  }
});

module.exports = router;
