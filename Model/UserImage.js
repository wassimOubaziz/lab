const mongoose = require("mongoose");

const userImageSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  descriptors: [[[Number]]], // Use nested array to enforce Float32Array
});

const UserImage = mongoose.model("UserImage", userImageSchema);

module.exports = UserImage;
