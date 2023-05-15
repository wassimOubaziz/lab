const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paimentSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Payment must belong to a user"],
    unique: false,
  },
  laboratory: {
    type: Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, "Payment must belong to a laboratory"],
    unique: false,
  },
  cardNumber: {
    type: String,
    required: [true, "Card number is required"],
  },
  cardHolder: {
    type: String,
    required: [true, "Card holder name is required"],
  },
  expirationMM: {
    type: String,
    required: [true, "Expiration month is required"],
  },
  expirationYY: {
    type: String,
    required: [true, "Expiration year is required"],
  },
  cvv: {
    type: String,
    required: [true, "CVV is required"],
  },
});

const Paiment = mongoose.model("Paiment", paimentSchema);

module.exports = Paiment;
