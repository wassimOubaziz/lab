const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//sign up a user
router.route("/").post(async (req, res) => {
  const body = req.body;
  if (body.role == "") {
    body.role = ["patient"];
    body.labs = [{ lab: ["idlab1", "idlab2"] }];
    console.log(body);
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
    const user = await User.create(body);

    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
