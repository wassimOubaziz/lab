//create schema for MessageToAdmin
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageToAdminSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "message must have owner"],
  },
  title: {
    type: String,
    required: [true, "message must have a title"],
    unique: false,
  },
  content: {
    type: String,
    required: [true, "message must have a content"],
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sendTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "message must have a sendTo"],
    unique: false,
  },
  replied: {
    type: String,
    default: "Not Yet",
  },
});

//exporting message schema
module.exports = mongoose.model("MessageToAdmin", messageToAdminSchema);
