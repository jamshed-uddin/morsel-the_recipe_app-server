const express = require("express");
const router = express.Router();
const User = require("../schema/userSchema");
const Recipe = require("../schema/recipeSchema");
const Blog = require("../schema/blogSchema");
const SavedItem = require("../schema/savedItemSchema");
const { verifyJwt, verifyAdmin } = require("../middlewares/verifyMids");
const errorResponse = require("../utils/errorResponse");

//create a user
router.post("/newUser", async (req, res) => {
  const { email } = req.body;
  try {
    //checking if user with same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ error: "User with this email already exists" });
    }

    // if not create a new user
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(200).json({
      message: "User registered successfully",
    });
  } catch (error) {
    errorResponse(res, error);
  }
});

//get all users
router.get("/users", verifyJwt, verifyAdmin, async (req, res) => {
  try {
    const result = await User.find().sort({ createdAt: -1, role: 1 });
    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

//get a single user
router.get("/singleUser/:email", verifyJwt, async (req, res) => {
  const userEmail = req.params.email;

  try {
    const result = await User.findOne({ email: userEmail });
    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

// get a user
router.get("/getUser", async (req, res) => {
  const userId = req.query.userId;

  try {
    const result = await User.findOne({ _id: userId });
    res.status(201).json(result);
  } catch (error) {
    errorResponse(res, error);
  }
});

//update user (by user)
router.put("/updateUser/:email", verifyJwt, async (req, res) => {
  const userEmail = req.params.email;
  const { name, photoURL, bio } = req.body;

  try {
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(401).json({ error: "User not found" });
    }

    await User.updateOne(
      { email: userEmail },
      {
        $set: {
          name: name || existingUser.name,
          photoURL: photoURL,
          bio: bio || existingUser.bio,
        },
      }
    );
    res.status(201).json({ message: "User updated successfully" });
  } catch (error) {
    errorResponse(res, error);
  }
});

//update user role(by admin)
//we will check first if the current user is admin.if the user is admin only then the updating block will work.

router.patch(
  "/updateRole/:adminEmail",
  verifyJwt,
  verifyAdmin,
  async (req, res) => {
    const adminEmail = req.params.adminEmail;
    const { role, userEmail } = req.body;
    try {
      const currentUser = await User.findOne({ email: adminEmail });

      if (currentUser.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized action" });
      }
      await User.updateOne({ email: userEmail }, { $set: { role } });
      res.status(201).json({ message: "User role changed" });
    } catch (error) {
      errorResponse(res, error);
    }
  }
);

// deleting user (only admin action )
router.delete("/deleteUser", verifyJwt, async (req, res) => {
  const userEmail = req.query.userEmail;
  const deletingUserId = req.query.userId;

  try {
    const currentUser = await User.findOne({ email: userEmail });

    if (!currentUser) {
      return res.status(401).json({ error: "User not found" });
    }

    if (currentUser.email !== userEmail) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await User.deleteOne({ _id: deletingUserId });
    await Recipe.deleteMany({ creatorInfo: deletingUserId });
    await Blog.deleteMany({ creatorInfo: deletingUserId });
    await SavedItem.deleteMany({ userId: deletingUserId, userEmail });

    res.status(201).json({ message: "User deleted successfully" });
  } catch (error) {
    errorResponse(res, error);
  }
});

module.exports = router;
