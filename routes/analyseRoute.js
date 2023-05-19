const express = require("express");
const Analyse = require("../Model/Analyse");
const router = express.Router();

// ...
// get all annalyse high
router.route("/H").get(async (req, res) => {
  const analyse = await Analyse.find({}).populate("patient", "username"); //.select("-_id -auditor -patient -laboratory -tests._id");
  res.status(200).json(analyse);
});

//get all anaaylyse
/*router.route("/").get(async (req, res) => {
    const analyse = await Analyse.find({}).select("-_id -auditor -patient -laboratory -tests._id");
    res.status(200).json(analyse);
  });*/
//get analyseby id for high position user not client
router.route("/:id").get(async (req, res) => {
  const id = req.params.id;
  const anls = await Analyse.findById(id);
  res.status(200).json(anls);
});

//add analyse
router.post("/addAnalpatient", async (req, res) => {
  try {
    const { laboratory, date, time } = req.body;
    const existingAppointment = await Analyse.findOne({
      laboratory,
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
    const newAnalyse = new Analyse(req.body);
    const savedAnalyse = await newAnalyse.save();
    res.status(201).json(savedAnalyse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//delete analyse
router.delete("/Del/:id", getAnalyse, async (req, res) => {
  try {
    await res.analyse.remove();
    res.json({ message: "Analyse deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//update analyse
router.put("/UPD/:id", getAnalyse, async (req, res) => {
  if (req.body.laboratory != null) {
    res.analyse.laboratory = req.body.laboratory;
  }

  if (req.body.patient != null) {
    res.analyse.patient = req.body.patient;
  }

  if (req.body.doctorNote != null) {
    res.analyse.doctorNote = req.body.doctorNote;
  }

  if (req.body.date != null) {
    res.analyse.date = req.body.date;
  }
  if (req.body.time != null) {
    res.analyse.time = req.body.time;
  }

  if (req.body.selectedTests != null) {
    res.analyse.selectedTests = req.body.selectedTests;
  }

  if (req.body.isHere != null) {
    res.analyse.isHere = req.body.isHere;
  }
  if (req.body.isPaid != null) {
    res.analyse.isPaid = req.body.isPaid;
  }
  if (req.body.priority != null) {
    res.analyse.priority = req.body.priority;
  }

  try {
    const updatedAnalyse = await res.analyse.save();
    res.json(updatedAnalyse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//get an analyse by ID
async function getAnalyse(req, res, next) {
  try {
    const analyse = await Analyse.findById(req.params.id);
    if (analyse == null) {
      return res.status(404).json({ message: "Analyse not found" });
    }
    res.analyse = analyse;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
// filter analyst

router.route("/Fanal/:patient").get(async (req, res) => {
  const patient = req.params.patient;
  const body = req.body;
  const date = new Date(body.date);
  const arr = [];
  const anls = await Analyse.find({ date }).select("-_id -tests._id");
  anls.forEach((d) => {
    if (d.patient == patient) {
      arr.push(d);
    }
  });
  res.status(200).json(arr);
});

// result specified analies
router.route("/Ranal/:id").get(async (req, res) => {
  const id = req.params.id;
  const anls = await Analyse.findById(id).select(
    "-_id -patient -laboratory -tests._id"
  );
  res.status(200).json(anls);
});

// get test for each analyse

router.route("/Ranal/test/:id").get(async (req, res) => {
  const id = req.params.id;
  const anls = await Analyse.findById(id).select(
    "-_id -patient -laboratory -tests._id"
  );
  res.status(200).json(anls);
});

module.exports = router;
