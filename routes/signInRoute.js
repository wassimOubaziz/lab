const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const signInControler = require("../controllers/signInControler");

//getSignInPage
router.route("/").post(async (req, res) => {
  try {
    const body = req.body;
    const user = await User.findOne({
      email: body.email,
      password: body.password,
    });

    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log("yes");
  }
});
//signInControler.checkSignIn

module.exports = router;
