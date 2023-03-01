const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchima = new Schema({
  name: {
    type: String,
    required: [true, "user must have a name"],
  },
  username: {
    type: String,
    required: [true, "user must have an username"],
  },
  phone: {
    type: String,
    required: [true, "user must have a phone number"],
  },
  email: {
    type: String,
    required: [true, "user must have an email"],
    unique: [true, "email must be unique"],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "user must have a password"],
    min: 8,
    max: 20,
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
    },
  ],
  dateOfBirth: {
    type: Date,
    required: [true, "user must have a date of birth"],
  },
  labs: [
    {
      lab: {
        type: String,
        default: [],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

const User = mongoose.model("User", userSchima);

module.exports = User;
