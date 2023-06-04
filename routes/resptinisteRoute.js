const express = require("express");
const User = require("../Model/User");
const Laboratory = require("../Model/Laboratory");
const Analyse = require("../Model/Analyse");
const Review = require("../Model/Review");
const Complaint = require("../Model/Complaint");

const router = express.Router();
router.post("/addAnalpatient", async (req, res) => {
  try {
    const patient = req.user._id;
    const { date, time, selectedTests, isPaid, isHere, name, priority } =
      req.body;

    let fixedLaboratory;

    // Find the laboratory based on the worker's ID and assign it to fixedLaboratory
    const laboratory = await Laboratory.findOne({ workers: patient });
    if (laboratory) {
      fixedLaboratory = laboratory._id;
    } else {
      return res.status(400).json({ message: "Laboratory not found." });
    }
    const existingAppointment = await Analyse.findOne({
      patient,
      laboratory: fixedLaboratory,
      date,
      time,
    });
    if (existingAppointment) {
      return res.status(409).json({
        message: "Appointment already exists. Please select another time.",
      });
    }

    const enteredDate = new Date(date);
    const currentDate = new Date();
    if (enteredDate < currentDate) {
      return res
        .status(400)
        .json({ message: "Invalid date. Please select a future date." });
    }

    const formattedSelectedTests = selectedTests.map((test) => ({
      testType: test.testType.testType,
    }));

    const newAnalyse = new Analyse({
      patient,
      laboratory: fixedLaboratory,
      date,
      time,
      selectedTests: formattedSelectedTests,
      isPaid,
      isHere,
      name,
      priority,
    });

    const savedAnalyse = await newAnalyse.save();
    res.status(201).json(savedAnalyse);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

/// find test of lab
router.get("/gettests", async (req, res) => {
  const workerID = req.user._id;

  try {
    // Find all labs
    const labs = await Laboratory.find().exec();

    let found = false;
    let tests = [];

    // Iterate through each lab
    for (const lab of labs) {
      // Check if the worker ID exists in the lab's workers array
      if (lab.workers.includes(workerID)) {
        found = true;
        tests = lab.tests;
        break;
      }
    }

    if (found) {
      res.json({ tests });
    } else {
      res.status(404).json({ message: "Worker ID not found in any lab." });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

// find the analyse of lab

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

module.exports = router;
