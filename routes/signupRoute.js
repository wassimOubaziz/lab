const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//sign up a user
router.route("/").post(async (req, res) => {
  const body = req.body;
  console.log(body);
  if (body.role == "") {
    body.role = ["patient"];
  }
  try {
    const user = await User.create(body);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
