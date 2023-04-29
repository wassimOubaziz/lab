const express = require("express");
//multer is for uploading files(images)
const multer = require("multer");
const path = require("path");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");
const Announcement = require("../Model/Announcement");
const Complaint = require("../Model/Complaint");
const MessageToAdmin = require("../Model/MessageToAdmin");
const BloodBank = require("../Model/BloodBank");
const Donation = require("../Model/Donation");
const User = require("../Model/User");

//if the nurse
router.get("/", async (req, res) => {
  res.json({ message: "yohoo" });
});

module.exports = router;
