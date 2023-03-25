const express = require("express");
const router = express.Router();

//making sign out route jwt
router.route("/").get((req, res) => {
  res.clearCookie("jwt", { maxAge: 0 });
  res.status(200).json({
    status: "success",
    message: "sign out successfully",
  });
});

module.exports = router;
