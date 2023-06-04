const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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

  ////////////////////
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SECRET, // replace with your actual email address
      pass: process.env.PASSWORD_SECRET, // replace with your actual email password
    },
  });

  try {
    const user = await User.findOne({ email: body.email });
    let token;
    if (!user) {
      token = jwt.sign({ email: body.email }, process.env.JWT_SECRET);
      body.validationToken = token;
      await User.create(body);
      ///this will change in deployment
      const validationLink = `http://localhost:4000/validate/${token}`;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_SECRET, // replace with your actual email address
          to: body.email, // replace with the new user's email address
          subject: "Please validate your account",
          text: `Click this link to validate your account: ${validationLink}`,
          html: `<div style="background-color: #f2f2f2; padding: 20px;">
          <h2>Thanks for registering!</h2>
          <p>Please click the button below to validate your account:</p>
          <a href="${validationLink}" style="background-color: #4CAF50; border: none; color: white; padding: 12px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin-top: 20px;">Validate Account</a>
      </div>
      `,
        });
      } catch (e) {
        if (e) await User.deleteOne({ email: body.email });
        return res.status(400).json({ message: e.message });
      }
    }

    res.status(200).json({
      message: "Validation Email succesfully sended plz check your email",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//////////////////

router.route("/signupPatient").post(async (req, res) => {
  const body = req.body;
  body.role = ["patient"];
  try {
    const user = new User(body);
    user.isValide = true;
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
