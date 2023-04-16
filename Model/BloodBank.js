//create schema for BloodBank
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bloodBankSchema = new Schema({
  id_lab: {
    type: Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, "BloodBank must belong to a lab"],
  },
  lab_owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "BloodBank must have a lab owner"],
  },
  bloodType: {
    type: [String],
    required: [true, "BloodBank must have a blood type"],
    default: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    enum: {
      values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      message: "BloodBank must have a valid blood type",
    },
  },
  amount: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0, 0],
    required: [true, "BloodBank must have an amount on Liters"],
  },
});

//exporting blood bank schema
module.exports = mongoose.model("BloodBank", bloodBankSchema);
