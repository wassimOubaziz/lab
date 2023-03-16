const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  name: {
    type: String,
    min: 3,
    max: 15,
    required: [true, "Contact must have Name"],
  },
  email: {
    type: String,
    required: [true, "Contact must belong to a user"],
  },
  subject: {
    type: String,
    min: 3,
    max: 100,
    required: [true, "Contact must have subject"],
  },
  message: {
    type: String,
    required: [true, "Contact must have a message"],
  },
  timeSpan: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("Message", messageSchema);
