const express = require("express");
const router = express.Router();
const User = require("../schema/userSchema");

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
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get all users
router.get("/users", async (req, res) => {
  try {
    const result = await User.find();
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//get a single user
router.get("/singleUser/:email", async (req, res) => {
  const userEmail = req.params.email;

  try {
    const result = await User.findOne({ email: userEmail });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//update user (by user)
router.put("/updateUser/:email", async (req, res) => {
  const userEmail = req.params.email;
  const { name, photoURL } = req.body;

  try {
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(401).json({ error: "User not found" });
    }
    await User.updateOne({ email: userEmail }, { $set: { name, photoURL } });
    res.status(201).json({ message: "User updated successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

//update user role(by admin)
//we will check first if the current user is admin.if the user is admin only then the updating block will work.

router.patch("/updateRole/:adminEmail", async (req, res) => {
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
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

// deleting user (only admin action )
router.delete("/deleteUser", async (req, res) => {
  const adminEmail = req.query.adminEmail;
  const deletingUserId = req.query.userId;

  try {
    const currentUser = await User.findOne({ email: adminEmail });

    if (currentUser.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    await User.deleteOne({ _id: deletingUserId });
    res.status(201).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Something went wrong", message: error.message });
  }
});

module.exports = router;
