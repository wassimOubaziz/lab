const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//update user mode to true
router.route("/").put(async (req, res) => {
  try {
    //get role of the user and reverse it
    req.user.role.reverse();
    await User.findByIdAndUpdate(req.user._id, { role: req.user.role });
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

//export
module.exports = router;
