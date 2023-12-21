const express = require("express");
const notificationRouter = express.Router();
const Notification = require("./../schema/notificationSchema");
const errorResponse = require("../utils/errorResponse");

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
    errorResponse(res, error);
  }
});

notificationRouter.put("/notificationRead/:userEmail", async (req, res) => {
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
    errorResponse(res, error);
  }
});

// delete specific users notification
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
      errorResponse(res, error);
    }
  }
);

module.exports = { createNotification, notificationRouter };
