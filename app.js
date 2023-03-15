const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const indexRoute = require("./routes/indexRoute");
const signupRoute = require("./routes/signupRoute");
const signInRoute = require("./routes/signInRoute");
const laboratoryRoute = require("./routes/laboratoryRoute");
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const adminLabRoute = require("./routes/adminLabRoute");

app.use(
  cors({
    origin: ["http://localhost:3000", "www.localhost:3000", "localhost:3000"],
  })
);

app.use(express.json());
//for index page
app.use("/", indexRoute);

//for sign up page
app.use("/signup", signupRoute);

//for login page
app.use("/login", signInRoute);

//for admin lab page
app.use("/admin-lab", adminLabRoute);

//for labo
app.use("/labs", laboratoryRoute);

//for reviews
app.use("/reviews", reviewRoute);

//for users
app.use("/users", userRoute);

//exporting app
module.exports = app;
