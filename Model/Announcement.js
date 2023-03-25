//create schema for announcement
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "announcement must have owner"],
  },
  title: {
    type: String,
    required: [true, "announcement must have a title"],
    unique: false,
  },
  content: {
    type: String,
    required: [true, "announcement must have a content"],
    unique: false,
  },
  job: {
    type: String,
    required: [true, "announcement must have a required job"],
    unique: false,
  },
  address: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//exporting announcement schema
module.exports = mongoose.model("Announcement", announcementSchema);
