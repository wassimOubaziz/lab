//create schema for Donation
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const donationSchema = new Schema({
  id_user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Donation must belong to a user"],
  },
  id_lab: {
    type: Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, "Donation must belong to a lab"],
  },
  bloodType: {
    type: String,
    required: [true, "Donation must have a blood type"],
    enum: {
      values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      message: "Donation must have a valid blood type",
    },
  },
  amount: {
    type: Number,
    enum: {
      values: [0.25, 0.5, 0.75, 1, 5],
      message: "Donation must have a valid amount",
    },
    required: [true, "Donation must have an amount on Liters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//when i save or delete donation i need to update the blood bank
donationSchema.post(["remove", "save"], async function (doc, next) {
  try {
    //update the blood bank
    const bloodBank = await this.model("BloodBank").findOne({
      id_lab: doc.id_lab,
    });

    //update the blood bank
    if (doc.bloodType == "A+") {
      bloodBank.amount[0] += doc.amount;
    } else if (doc.bloodType == "A-") {
      bloodBank.amount[1] += doc.amount;
    } else if (doc.bloodType == "B+") {
      bloodBank.amount[2] += doc.amount;
    } else if (doc.bloodType == "B-") {
      bloodBank.amount[3] += doc.amount;
    } else if (doc.bloodType == "AB+") {
      bloodBank.amount[4] += doc.amount;
    } else if (doc.bloodType == "AB-") {
      bloodBank.amount[5] += doc.amount;
    } else if (doc.bloodType == "O+") {
      bloodBank.amount[6] += doc.amount;
    } else if (doc.bloodType == "O-") {
      bloodBank.amount[7] += doc.amount;
    }
    await bloodBank.save();
    next();
  } catch (err) {
    next(err);
  }
});

//exporting donation schema
module.exports = mongoose.model("Donation", donationSchema);
