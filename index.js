const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const routesHandler = require("./routesHandler/routesHandler");

const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

try {
  mongoose.connect(process.env.URI).then(() => {
    console.log("db connected");
  });
} catch (error) {
  console.log(error);
}

app.use("/morsel", routesHandler);

app.get("/", (req, res) => {
  res.send("morsel server is on");
});

app.listen(port, () => {
  console.log("morsel server is running");
});
