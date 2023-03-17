const express = require("express");

const router = express.Router();
const Laboratory = require("../Model/Laboratory");
const User = require("../Model/User");

/////////////// Admin Laboratory Routes //////////////////

//get labs with search
router.route("/").get(async (req, res) => {
  try {
    const labs = await Laboratory.find({ owner: req.user._id }).populate([
      "patients",
      "workers",
    ]);

    res.status(200).json({ user: req.user, labs: labs });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
