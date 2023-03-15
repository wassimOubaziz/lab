const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const signInControler = require("../controllers/signInControler");

////signInControler.checkSignIn
router.route("/").post(async (req, res) => {
  try {
    //geting data from client side
    const { email, password } = req.body;

    //checking if email or password are empty
    if (email == "" || password == "") {
      return res
        .status(400)
        .json({ message: "your email or password must not be empty" });
    }
    //checking if the email is valide
    let user = await User.findOne({
      email: email,
    }).select("+password");
    //checking if the password is valide
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res
        .status(401)
        .json({ message: "your email or password are invalide plz check!" });
    }

    //creating a web token for the valid user login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });
    // sending to data the response if everything is correct
    res.status(200).json({
      status: "success",
      token,
      user,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
