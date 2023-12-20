const express = require("express");
const notificationRouter = express.Router();
const Notification = require("./../schema/notificationSchema");

async function createNotification(
  notificationTo,
  notificationFor,
  itemId,
  text
) {
  try {
    const notification = new Notification({
      notificationTo: notificationTo,
      notificationFor: notificationFor,
      itemId: itemId,
      text: text,
    });

    const savedNotification = await notification.save();
    return savedNotification;
  } catch (error) {
    throw error;
  }
}

notificationRouter.get("/myNotifications/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  try {
    const myNotifications = await Notification.find({
      notificationTo: userEmail,
    }).sort({ time: -1 });

    if (!myNotifications) {
      return res.status(404).json({ error: "No notifications found" });
    }

    res.status(201).json(myNotifications);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

notificationRouter.patch("/notificationRead/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;

  try {
    const myNotifications = await Notification.find({
      notificationTo: userEmail,
    });
    if (!myNotifications) {
      return res.status(404).json({ error: "No notifications found" });
    }

    await Notification.updateMany({ notificationTo: userEmail, read: true });
    res.status(201).json({ message: "Notifications have been read" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

notificationRouter.delete(
  "/deleteMyNotification/:userEmail",
  async (req, res) => {
    const userEmail = req.params.userEmail;
    try {
      await Notification.deleteMany({
        notificationTo: userEmail,
      });

      res.status(201).json({ message: "Notifications deleted successfully" });
    } catch (error) {
      res
        .status(401)
        .json({ error: "Something went wrong", message: error.message });
    }
  }
);

module.exports = { createNotification, notificationRouter };

// notificationTo: { type: String, required: true },
// notificationFor: { type: String },
// itemId: { type: mongoose.Schema.Types.ObjectId },
// text: { type: String, required: true },
// read: { type: Boolean, default: false},
// time: { type: Date, default: () => Date.now() },
