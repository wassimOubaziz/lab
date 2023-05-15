const express = require("express");
const User = require("../Model/User");
const Laboratory = require("../Model/Laboratory");
const Analyse = require("../Model/Analyse");
const Review = require("../Model/Review");
const Complaint = require("../Model/Complaint");

const router = express.Router();

// patient info
router.route("/:id").get(async (req, res) => {
  const id = req.params.id;
  const patient = await User.findById(id).select(
    "-role -dateOfBirth -createdAt"
  );
  res.status(200).json(patient);
});
//inscrit patient labos abonment
/* router.route("/labs/:id").get(async (req, res) => {
    try {
      const patient = await User.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      const labs = patient.labs
      console.log(labs)
      const labsSUB= await Laboratory.findById(labs).select('-_id -workers -owner')

      res.json({ labsSUB });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });*/
//get labs patients
router.route("/labs/:id").get(async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    const labIds = patient.labs;
    const labs = await Laboratory.find({ _id: { $in: labIds } });
    res.json(labs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//get anaylse patient
router.route("/anals/:id").get(async (req, res) => {
  const patientId = req.params.id;
  const analyses = await Analyse.find({ patient: patientId });
  res.status(200).json(analyses);
});

// update patient
router.route("/Upatient/:id").put(async (req, res) => {
  const body = req.body;
  const existeUser = await User.findOne({ username: body.username });
  if (req.body.role) {
    return res.status(400).json({
      message: "Role field cannot be updated",
    });
  }
  if (existeUser && existeUser._id.toString !== req.params.id) {
    return res.status(400).json({
      message: "Username already exusting",
    });
  }
  try {
    const body = req.body;
    const patient = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    console.log(body);
    res.json({
      message: "User updated successfully",
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

// make an appointment
router.route("/Mappoinment").post(async (req, res) => {
  const body = req.body;
  try {
    const body = req.body;
    const appointment = await Appointment.create(body);
    res.json(appointment);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

// display all appointement
router.route("/").get(async (req, res) => {
  const Appointments = await Analyse.find({}).select("-__v");
  res.status(200).json(Appointments);
});

//delete accounte
router.route("/daccount/:patientId").delete(async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Check if the account belongs to the patient
    const deletedAccount = await User.findByIdAndDelete(patientId);

    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(deletedAccount);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//delete appoinment analyse
router.route("/dAanalyse/:analies/:patientId").delete(async (req, res) => {
  try {
    const { analiesId, patientId } = req.params;

    // Check if the appointment belongs to the patient
    const analies = await Analyse.findOne({
      _id: analiesId,
      patient: patientId,
    });

    if (!analies) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const deletedAnalies = await Analyse.findByIdAndDelete(analiesId);

    if (!deletedAnalies) {
      throw new Error("Server error");
    }

    res.status(200).json(deletedAnalies);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//udate appoinment
router
  .route("/uappoinment/:appointmentId/:patientId")
  .patch(async (req, res) => {
    try {
      const { appointmentId, patientId } = req.params;
      const updatedAppointment = req.body;

      // Check if the appointment belongs to the patient
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: patientId,
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const updated = await Appointment.findByIdAndUpdate(
        appointmentId,
        updatedAppointment,
        { new: true }
      );

      res.status(200).json(updated);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

//get apppoinment of patient

router.route("/patient/appointments/:patientId").get(async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find all appointments of the patient
    const appointments = await Appointment.find({ patient: patientId });

    res.status(200).json(appointments);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// patient join alabo
router.route("/Jlabs/:id").post(async (req, res) => {
  try {
    const patientId = req.params.id;
    const labId = req.body.labId;
    console.log(patientId, labId);
    // Check if the user exists
    const user = await User.findById(patientId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the lab exists
    const lab = await Laboratory.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    // Check if the lab is already in the user's labs array
    if (user.labs.some((userLab) => userLab?.equals(lab._id))) {
      return res.status(400).json({ message: "Lab already joined" });
    }

    // Add the lab to the user's labs array
    user.labs.push(labId);
    lab.patients.push(patientId);
    await lab.save();
    await user.save();

    return res
      .status(200)
      .json({ message: "Lab added to user's labs array", user, lab });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// leave lab
router.route("/leaveLab/:id").delete(async (req, res) => {
  try {
    const patientId = req.params.id;
    const labId = req.body.labId;

    // Check if the user exists
    const user = await User.findById(patientId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the lab from the user's labs array
    user.labs = user.labs.filter(
      (lab) => lab._id.toString() !== labId.toString()
    );

    // Save the updated user object to the database
    await user.save();

    return res
      .status(200)
      .json({ message: "Lab removed from user's labs array", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//add review

router.route("/addReview/:id").post(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const review = new Review({
      rating: req.body.rating,
      user: userId,
      laboratory: req.body.laboratoryId,
    });
    console.log(review);
    await review.save();

    return res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get workers

router.post("/CompWorkers", async (req, res) => {
  try {
    const { labid } = req.body;
    const lab = await Laboratory.findById(labid).populate(
      "workers",
      "role name"
    );
    const workers = lab.workers;
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// add complaine

router.post("/ACompl", async (req, res) => {
  try {
    console.log(req.body);
    const { type, reported, complainer, title, content, owner } = req.body;

    // Create new complaint
    const newComplaint = new Complaint({
      owner,
      type,
      reported,
      complainer,
      title,
      content,
    });

    // Save complaint to database
    const savedComplaint = await newComplaint.save();

    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// update paiment

router.put("/up", async (req, res) => {
  try {
    const { analyseId, isPaid } = req.body;
    await Analyse.findByIdAndUpdate(analyseId, { isPaid });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;

module.exports = router;
