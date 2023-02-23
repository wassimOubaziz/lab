const express = require("express");
const path = require("path");
const app = express();
const indexRoute = require("./routes/indexRoute");
const signupRoute = require("./routes/signupRoute");
const signInRoute = require("./routes/signInRoute");
const laboratoryRoute = require("./routes/laboratoryRoute");
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");

app.use("/", express.static(path.join(__dirname, "/public")));
app.use(express.json());
//for index page
app.use("/", indexRoute);

//for sign up page
app.use("/signup", signupRoute);

//for login page
app.use("/login", signInRoute);

//for labo
app.use("/labs", laboratoryRoute);

//for reviews
app.use("/reviews", reviewRoute);

//for users
app.use("/users", userRoute);

//exporting app
module.exports = app;
