const express = require("express");
const router = express.Router();
const Blog = require("../schema/blogSchema");
const User = require("../schema/userSchema");

//post/create a blog
router.post("/createBlog", async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get all blog
router.get("/allBlogs", async (req, res) => {
  try {
    await Blog.find();
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get a single blog
router.get("/singleRecipe/:blogId", async (req, res) => {
  const blogId = req.params.blogId;

  try {
    await Blog.findOne({ _id: blogId });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// update status (by admin)
// we will check first if the the user updating the status is admin or not.
router.patch("/updateStatus/:adminEmail", async (req, res) => {
  const adminEmail = req.params.adminEmail;
  const { blogId, status } = req.body;
  try {
    const currentUser = await User.findOne({ email: adminEmail });
    if (currentUser.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await Blog.updateOne({ _id: blogId }, { $set: { status } });
    res.status(201).json({ message: "Blog status changed successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.put("updateBlog/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const updatedBlogBody = req.body;
  const {
    _id,
    creatorInfo: { creatorEmail },
  } = updatedBlogBody;

  try {
    if (userEmail !== creatorEmail) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    const updatedBlog = await Blog.findOneAndUpdate({ _id }, updatedBlogBody, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(201).json({ message: "Updated Successfully", updatedBlog });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

router.delete("/deleteBlog/:id", async (req, res) => {
  const deletingBlogId = req.params.id;
  try {
    await Blog.deleteOne({ _id: deletingBlogId });
    res.status(201).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});
module.exports = router;
