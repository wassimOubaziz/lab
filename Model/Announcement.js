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
    minLength: [100, "announcement content must be at least 100 characters"],
    maxLength: [500, "announcement content must be at most 500 characters"],
  },
  job: {
    type: String,
    required: [true, "announcement must have a required job"],
    enum: ["nurse", "receptionist", "auditor"],
    unique: false,
  },
  lab: {
    type: Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, "announcement must have a laboratory"],
  },
  jobRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "JobRequest",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

//exporting announcement schema
module.exports = mongoose.model("Announcement", announcementSchema);
