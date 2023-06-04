const express = require("express");
const User = require("../Model/User");
const Laboratory = require("../Model/Laboratory");
const Analyse = require("../Model/Analyse");
const Review = require("../Model/Review");
const Complaint = require("../Model/Complaint");

const router = express.Router();

router.get("/getanalyse", async (req, res) => {
  const workerID = req.user._id;

  try {
    // Find the lab that the worker belongs to
    const lab = await Laboratory.findOne({ workers: workerID }).exec();

    if (lab) {
      // Find all analyses associated with the lab and populate the patient and tests fields
      const analyses = await Analyse.find({ laboratory: lab._id })
        .populate("patient", "username surname")
        .exec();

      res.json({ analyses });
    } else {
      res.status(404).json({ message: "Worker ID not found in any lab." });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

// get all analyse of lab
router.route("/analyses/").get(async (req, res) => {
  const workerID = req.user._id;

  const lab = await Laboratory.findOne({ workers: workerID }).exec();
  //console.log(lab);
  const analyses = await Analyse.find({ laboratory: lab._id })
    .populate("patient", "username surname")
    .exec();
  //console.log(analyses);
  res.status(200).json(analyses);
});

module.exports = router;
