const mongoose = require("mongoose");

const savedItemSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEmail: { type: String, required: true, ref: "User" },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "itemType",
  },
  itemType: {
    type: String,
    enum: ["Recipe", "Blog"],
    required: true,
  },
});

module.exports = mongoose.model("SavedItem", savedItemSchema);

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const SavedItem = require('../models/SavedItem'); // Adjust the path based on your project structure

// // POST route for saving a new SavedItem
// router.post('/saveItem', async (req, res) => {
//   const { userId, itemId, itemType } = req.body;

//   try {
//     // Validate that itemType is either 'Recipe' or 'Blog'
//     if (!['Recipe', 'Blog'].includes(itemType)) {
//       return res.status(400).json({ error: 'Invalid itemType' });
//     }

//     // Create a new SavedItem instance
//     const savedItem = new SavedItem({
//       userId: mongoose.Types.ObjectId(userId),
//       itemId: mongoose.Types.ObjectId(itemId),
//       itemType,
//       // other fields...
//     });

//     // Save the new SavedItem to the database
//     await savedItem.save();

//     res.status(201).json({ message: 'SavedItem saved successfully', savedItem });
//   } catch (error) {
//     console.error('Error saving SavedItem:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// module.exports = router;
