const express = require("express");
const router = express.Router();
const Blog = require("../schema/blogSchema");
const User = require("../schema/userSchema");
const SavedItem = require("../schema/savedItemSchema");
const { createNotification } = require("./notificationHandler");

//post/create a blog
router.post("/createBlog", async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    const savedBlog = await newBlog.save();
    res.status(201).json({
      message: "Blog created successfully",
      id: savedBlog._id,
    });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get all blog
router.get("/allBlogs", async (req, res) => {
  try {
    const result = await Blog.find(
      {},
      "title previewImage creatorInfo status feedback createdAt"
    )
      .populate("creatorInfo")
      .sort({ createdAt: -1 });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});
router.get("/allBlogs/approved", async (req, res) => {
  try {
    const result = await Blog.find(
      { status: "approved" },
      "title previewImage creatorInfo status feedback createdAt"
    )
      .populate("creatorInfo")
      .sort({ createdAt: -1 });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.get("/myBlogs", async (req, res) => {
  try {
    const userId = req.query.userId;
    const result = await Blog.find(
      { creatorInfo: userId },
      "title previewImage status feedback"
    );
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get a single blog
router.get("/singleBlog/:blogId", async (req, res) => {
  const blogId = req.params.blogId;

  try {
    const result = await Blog.findOne({ _id: blogId }).populate("creatorInfo");
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// update status (by admin)
// we will check first if the the user updating the status is admin or not.
router.patch("/updateBlogStatus/:adminEmail", async (req, res) => {
  const adminEmail = req.params.adminEmail;
  const { creatorEmail, blogId, status, feedback } = req.body;
  try {
    const currentUser = await User.findOne({ email: adminEmail });
    if (currentUser.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await Blog.updateOne({ _id: blogId }, { status, feedback });

    if (status !== "pending") {
      const savedNotification = await createNotification(
        creatorEmail,
        "blog",
        blogId,
        `Your blog has been ${status}.`
      );
    }

    res.status(201).json({ message: "Blog status changed successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.put("/updateBlog/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const updatedBlogBody = req.body;
  const { _id, creatorInfo } = updatedBlogBody;

  try {
    const creator = await User.findOne({ _id: creatorInfo });

    if (userEmail !== creator.email) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id },
      { ...updatedBlogBody, updatedAt: new Date().toString() },
      {
        new: true,
      }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(201).json({
      message: "Updated Successfully",
      id: updatedBlog._id,
    });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.delete("/deleteBlog", async (req, res) => {
  const deletingBlogId = req.query.itemId;
  const currentUserEmail = req.query.userEmail;
  try {
    const deletingItem = await Blog.findOne({ _id: deletingBlogId }).populate(
      "creatorInfo"
    );

    if (deletingItem.creatorInfo.email !== currentUserEmail) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await SavedItem.deleteMany({
      item: deletingBlogId,
    });
    await Blog.deleteOne({ _id: deletingBlogId });
    res.status(201).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});
module.exports = router;
