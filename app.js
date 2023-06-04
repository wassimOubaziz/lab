const express = require("express");
const job = require("./expired-users-cron");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const faceRecognition = require("./routes/faceRecongnitionRoute");
const indexRoute = require("./routes/indexRoute");
const signupRoute = require("./routes/signupRoute");
const signInRoute = require("./routes/signInRoute");
const signOutRoute = require("./routes/signOutRoute");
const laboratoryRoute = require("./routes/laboratoryRoute");
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const adminLabRoute = require("./routes/adminLabRoute");
const validateRoute = require("./routes/validateRoute");
const nurseRoute = require("./routes/nurseRoute");
const jobApplyRoute = require("./routes/jobApplyRoute");
const barcodeRoute = require("./routes/barcodeRoute");
const workerRoute = require("./routes/workerRoute");
const superAdminRoute = require("./routes/superAdminRoute");
const patientRoute = require("./routes/patientRoute");
const paimentRoute = require("./routes/paimentRoute");
const analyseRoute = require("./routes/analyseRoute");
const auditorRoute = require("./routes/auditorRoute");
const aiRoute = require("./routes/aiRoute");
const receptionistRoute = require("./routes/resptinisteRoute");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  protect,
  permition,
  checkIfNurseHaveJob,
} = require("./controllers/signInControler");
const Laboratory = require("./Model/Laboratory");

//to allow the host to acces multi cors
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "www.localhost:3000",
      "localhost:3000",
      "http://192.168.43.59:3000",
      "192.168.43.59:3000",
      "www.192.168.43.59:3000",
    ],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.static("public"));
app.use(express.json());

//for index page
app.use("/", indexRoute);

//for sign up page
app.use("/signup", signupRoute);

//for login page
app.use("/login", signInRoute);

//for sign out page
app.use("/logout", protect, signOutRoute);

//for admin lab page
app.use("/admin-lab", protect, permition("superadmin", "admin"), adminLabRoute);

app.use(
  "/owner-labs",
  protect,
  permition("superadmin", "admin"),
  async (req, res) => {
    try {
      const labs = await Laboratory.find({ owner: req.user._id }).select(
        "name address _id"
      );
      return res.status(200).json({ labs });
    } catch (e) {
      return res.status(400).json({ status: "faild", message: e.message });
    }
  }
);

//for labo
app.use("/labs", protect, laboratoryRoute);

//for reviews
app.use("/reviews", protect, reviewRoute);

//for users
app.use("/users", protect, userRoute);

//for validation page
app.use("/validate", validateRoute);

//for nurse page
app.use(
  "/nurse",
  protect,
  permition("superadmin", "nurse"),
  checkIfNurseHaveJob,
  nurseRoute
);

//for all workers

app.use("/barcode", protect, barcodeRoute);

//job request
app.use(
  "/job",
  protect,
  permition("superadmin", "nurse", "auditor", "receptionist", "admin"),
  jobApplyRoute
);

app.use(
  "/worker",
  protect,
  permition("superadmin", "nurse", "auditor", "receptionist"),
  workerRoute
);

//for super admin
app.use("/superadmin", protect, permition("superadmin"), superAdminRoute);

//for switch to patient mode and back
app.use("/switch", protect, require("./routes/switchTopatientRoute"));

//for face recognition
app.use(
  "/detect",
  protect,
  permition("admin", "nurse", "superadmin"),
  faceRecognition
);

//for door opening
app.use(
  "/door",
  protect,
  permition("admin", "nurse", "superadmin", "auditor", "receptionist"),
  require("./routes/doorRouter")
);

//for blood bank
app.use("/blood-bank", protect, require("./routes/bloodBankRoute"));

// //for Analyse
app.use(
  "/analyse",
  protect,
  permition("patient", "auditor", "receptionist"),
  analyseRoute
);

//for patient
app.use(
  "/patient",
  protect,
  permition("patient", "receptionist", "auditor"),
  patientRoute
);

//for paiment
app.use(
  "/paiment",
  protect,
  permition("patient", "auditor", "receptionist"),
  paimentRoute
);

//for auditor
app.use("/auditor", protect, permition("auditor"), auditorRoute);

//for receptionist
app.use(
  "/resp",
  protect,
  permition("receptionist", "admin", "superadmin"),
  receptionistRoute
);

//for ai diabtes
app.use(
  "/ai",
  protect,
  permition("patient", "auditor", "receptionist"),
  aiRoute
);

//starting deleting users that are not valided there account
job.start();

//exporting app
module.exports = app;
