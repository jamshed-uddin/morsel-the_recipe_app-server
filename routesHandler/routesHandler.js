const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../schema/userSchema");

//create a user
router.post("/newUser", async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(401)
      .json({ message: "User with this email already exists" });
  }

  const newUser = new User(req.body);

  await newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((error) => {
      console.log(error);

      res.status(401).json({ error: "Something went wrong" });
    });
});

//get all users
router.get("/users", async (req, res) => {
  await User.find()
    .then((result) => res.status(201).json(result))
    .catch((error) => res.status(401).json({ error: "Something went wrong" }));
});

//get a single user
router.get("/singleUser/:email", async (req, res) => {
  const userEmail = req.params.email;
  await User.findOne({ email: userEmail })
    .then((result) => res.status(201).json(result))
    .catch((error) =>
      res.status(401).json({ message: "Something went wrong" })
    );
});

//update user (by user)
router.put("/updateUser/:email", async (req, res) => {
  const userEmail = req.params.email;
  const { name, photoURL } = req.body;

  try {
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }
    await User.updateOne({ email: userEmail }, { $set: { name, photoURL } });
    res.status(201).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(401).json({ message: "Something went wrong" });
  }
});

module.exports = router;
