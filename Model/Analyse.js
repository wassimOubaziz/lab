const mongoose = require("mongoose");

const analyseSchema = new mongoose.Schema({
  laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Laboratory",
    required: true,
    index: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  auditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    default: null,
  },
  doctorNote: {
    default: null,
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },

  selectedTests: [
    {
      testType: {
        type: String,
        required: true,
        uppercase: true,
      },
      result: {
        type: Number,
        default: null,
      },
    },
  ],
  time: {
    type: String,
    required: [true, "Appointment must have a time"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isHere: {
    type: Boolean,
    default: false,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: undefined,
  },
});

module.exports = mongoose.model("Analyse", analyseSchema);
