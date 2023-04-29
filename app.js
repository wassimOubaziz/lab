const express = require("express");
const job = require("./expired-users-cron");
const app = express();
const cors = require("cors");
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
const {
  protect,
  permition,
  checkIfNurseHaveJob,
} = require("./controllers/signInControler");

//to allow the host to acces multi cors
app.use(
  cors({
    origin: ["http://localhost:3000", "www.localhost:3000", "localhost:3000"],
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
app.use("/logout", signOutRoute);

//for admin lab page
app.use("/admin-lab", protect, permition("superadmin", "admin"), adminLabRoute);

//for labo
app.use("/labs", laboratoryRoute);

//for reviews
app.use("/reviews", reviewRoute);

//for users
app.use("/users", userRoute);

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

//job request
app.use(
  "/job",
  protect,
  permition("superadmin", "nurse", "auditor", "receptionist", "admin"),
  jobApplyRoute
);

//starting deleting users that are not valided there account
job.start();

//exporting app
module.exports = app;
