const express = require("express");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");
const Analyse = require("../Model/Analyse");
//multer is for uploading files(images)
const multer = require("multer");
const path = require("path");
const Announcement = require("../Model/Announcement");
const Complaint = require("../Model/Complaint");
const MessageToAdmin = require("../Model/MessageToAdmin");
const BloodBank = require("../Model/BloodBank");
const Donation = require("../Model/Donation");
const User = require("../Model/User");

//get all the requests analyse for patients in the same lab
router.get("/", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "-workers -patients -img -avgRating -numRates -owner"
    );
    const requests = await Analyse.find({ laboratory: lab._id }).populate(
      "patient",
      "name surname email"
    );
    res.status(200).json({
      status: "success",
      data: {
        requests,
        hasJob: req.user.hasJob,
        user: {
          name: req.user.name,
          surname: req.user.surname,
          email: req.user.email,
        },
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get analyse by id
router.get("/analyse/:id", async (req, res) => {
  // return only the analyse that belong to the lab of the nurse works in
  try {
    const analyse = await Analyse.findById(req.params.id).populate(
      "patient",
      "name surname email phone -_id dateOfBirth"
    );

    //check if the analyse belong to the lab of the nurse
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );
    if (analyse.laboratory.toString() !== lab._id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "this analyse does not belong to your lab",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        analyse,
        lab,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//update analyse save the results of the analyse
router.put("/analyse/:id", async (req, res) => {
  try {
    const analyse = await Analyse.findById(req.params.id).select(
      "isCompleted priority _id selectedTests laboratory patient isHere"
    );

    if (!analyse.isHere) {
      return res.status(400).json({
        status: "fail",
        message: "the patient is not here",
      });
    }
    //check if the analyse belong to the lab of the nurse
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );
    if (analyse.laboratory.toString() !== lab._id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "this analyse does not belong to your lab",
      });
    }

    //check if the analyse is req.body.results and selectedTests are the same and not empty and check if they have same testType

    if (
      req.body.results.length !== analyse.selectedTests.length ||
      req.body.results.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "the results must be the same length as the selected tests",
      });
    }

    for (let i = 0; i < req.body.results.length; i++) {
      if (
        req.body.results[i].testType !== analyse.selectedTests[i].testType ||
        !req.body.results[i].result
      ) {
        return res.status(400).json({
          status: "fail",
          message: "the results must have the same testType",
        });
      }
    }
    analyse.selectedTests = req.body.results;
    analyse.isCompleted = true;
    analyse.save();
    res.status(200).json({
      status: "success",
      message: "the results have been saved successfully",
      data: {
        analyse,
        lab,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get all the tests of the lab
router.get("/tests", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );
    res.status(200).json({
      status: "success",
      data: {
        tests: lab.tests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//create a new test to the lab
router.post("/tests", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );
    const test = lab.tests.find((test) => test.testType === req.body.testType);
    if (test) {
      return res.status(400).json({
        status: "fail",
        message: "this test already exist",
      });
    }
    const {
      testType,
      testPrice,
      description,
      minRange,
      maxRange,
      unit,
      lowAdvice,
      highAdvice,
    } = req.body;

    lab.tests.push({
      testType,
      reference: {
        min: minRange,
        max: maxRange,
        unit,
        description,
        lowAdvice,
        highAdvice,
        price: testPrice,
      },
    });
    await lab.save();
    res.status(200).json({
      status: "success",
      data: {
        tests: lab.tests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get one test of the lab by id
router.get("/tests/:id", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );

    const test = lab.tests.find((test) => {
      return test._id.toString() === req.params.id;
    });
    if (!test) {
      return res.status(400).json({
        status: "fail",
        message: "this test does not exist",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        test,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//update test of the lab by id

router.patch("/tests/:id", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );

    const test = lab.tests.find((test) => {
      return test._id.toString() === req.params.id;
    });
    if (!test) {
      return res.status(400).json({
        status: "fail",
        message: "this test does not exist",
      });
    }
    const {
      testType,
      testPrice,
      description,
      minRange,
      maxRange,
      unit,
      lowAdvice,
      highAdvice,
    } = req.body;

    test.testType = testType;
    test.reference.min = minRange;
    test.reference.max = maxRange;
    test.reference.unit = unit;
    test.reference.description = description;
    test.reference.lowAdvice = lowAdvice;
    test.reference.highAdvice = highAdvice;
    test.reference.price = testPrice;

    await lab.save();
    res.status(200).json({
      status: "success",
      data: {
        test,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//delete test
router.delete("/tests/:id", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "_id tests"
    );

    const test = lab.tests.find((test) => {
      return test._id.toString() === req.params.id;
    });
    if (!test) {
      return res.status(400).json({
        status: "fail",
        message: "this test does not exist",
      });
    }
    lab.tests = lab.tests.filter((test) => {
      return test._id.toString() !== req.params.id;
    });

    await lab.save();
    res.status(200).json({
      status: "success",
      message: "test has been deleted succesfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get the lab of the nurse
router.get("/lab", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id })
      .select("_id workers patients")
      .populate("workers", "name surname")
      .populate("patients", "name surname");
    res.status(200).json({
      status: "success",
      lab,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

module.exports = router;
