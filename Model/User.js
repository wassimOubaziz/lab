const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchima = new Schema({
  name: {
    type: String,
    required: [true, "user must have a name"],
    lowercase: true,
  },
  surname: {
    type: String,
    required: [true, "user must have an surname"],
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "user must have a phone number"],
    minlength: [9, "number must be at least 9"],
    maxlength: [10, "number must be at most 10"],
  },
  email: {
    type: String,
    required: [true, "user must have an email"],
    unique: [true, "email must be unique"],
    lowercase: true,
    validate: [validator.isEmail, "plz provide a valide email"],
  },
  password: {
    type: String,
    required: [true, "user must have a password"],
    minlength: 8,
  },
  role: [
    {
      type: String,
      default: "patient",
      enum: [
        "superadmin",
        "patient",
        "admin",
        "receptionist",
        "nurse",
        "auditor",
      ],
      lowercase: true,
    },
  ],
  dateOfBirth: {
    type: Date,
    required: [true, "user must have a date of birth"],
    validate: [
      function (el) {
        const Birthyear = new Date(el).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - Birthyear >= 8) return true;
        return false;
      },
      "you must be at least 8 years old",
    ],
  },
  labs: [
    {
      lab: {
        type: String,
        default: [],
      },
    },
  ],
  acitve: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

//this will work when i update the password and when i create new user
userSchima.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchima);

module.exports = User;
