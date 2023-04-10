const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "complaint must have owner"],
  },
  type: {
    type: String,
    required: [true, "complaint must have a type"],
    unique: false,
  },
  reported: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  complainer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "complaint must have owner"],
  },
  title: {
    type: String,
    required: [true, "complaint must have a title"],
    unique: false,
  },
  content: {
    type: String,
    required: [true, "complaint must have a content"],
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  deletedByAdmin: {
    type: Boolean,
    default: false,
  },
});

//exporting complaint schema
module.exports = mongoose.model("Complaint", complaintSchema);
