const express = require("express");
const router = express.Router();
const User = require("../Model/User");

//making sign out route jwt
router.route("/").get(async (req, res) => {
  req.user.acitve = false;
  await req.user.save({ validateBeforeSave: false });
  res.clearCookie("jwt", { maxAge: 0 });
  res.clearCookie("role", { maxAge: 0 });
  res.status(200).json({
    status: "success",
    message: "sign out successfully",
  });
});

module.exports = router;
