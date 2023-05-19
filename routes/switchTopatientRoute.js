const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//update user mode to true
router.route("/").put(async (req, res) => {
  try {
    if (req.user.mode) throw new Error("you are already in patient mode");
    await User.findByIdAndUpdate(req.user._id, { mode: true });
    res.status(200).json({
      status: "success",
      message: "switch to patient successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

// update to false

router.route("/").delete(async (req, res) => {
  try {
    if (!req.user.mode) throw new Error("you are already in work mode");
    await User.findByIdAndUpdate(req.user._id, { mode: false });
    res.status(200).json({
      status: "success",
      message: "switch to doctor successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//export
module.exports = router;
