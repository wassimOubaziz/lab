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
    if (!user) {
      const token = jwt.sign({ email: body.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME_FOR_VALIDATION,
      });

      body.validationToken = token;
      const validationLink = `http://localhost:4000/validate/${token}`;
      await transporter.sendMail({
        from: process.env.EMAIL_SECRET, // replace with your actual email address
        to: body.email, // replace with the new user's email address
        subject: "Please validate your account",
        text: `Click this link to validate your account: ${validationLink}`,
        html: `Click <a href="${validationLink}">this link</a> to validate your account.`,
      });
    }
    await User.create(body);

    res.status(200).json({
      message: "Validation Email succesfully sended plz check your email",
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
