const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const signInControler = require("../controllers/signInControler");

////signInControler.checkSignIn
router.route("/").post(async (req, res) => {
  try {
    const body = req.body;
    let user = await User.findOne({
      email: body.email,
      password: body.password,
    });
    user = await User.findByIdAndUpdate(
      user._id,
      { acitve: true },
      { new: true }
    );
    res.status(200).json(user);
  } catch (e) {
    res
      .status(400)
      .json({ message: "your email or password are wrong please check!" });
  }
});

module.exports = router;
