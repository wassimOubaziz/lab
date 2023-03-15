const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//sign up a user
router.route("/").post(async (req, res) => {
  const body = req.body;
  if (body.role == "" || body.role == ["patient"]) {
    body.role = ["patient"];
  } else if (body.role == "admin") {
    body.role = ["patient", "admin"];
  } else if (body.role == "receptionist") {
    body.role = ["patient", "receptionist"];
  } else if (body.role == "nurse") {
    body.role = ["patient", "nurse"];
  } else if (body.role == "auditor") {
    body.role = ["patient", "auditor"];
  }
  try {
    await User.create(body);
    res.status(200).json({ message: "You seccesfull signed up" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
