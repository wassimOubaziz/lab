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

// add a post to MessageToAdmin collection by the worker to the owner of the lab
router.post("/contact-admin", async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ workers: req.user._id }).select(
      "owner"
    );
    const message = await MessageToAdmin.create({
      owner: req.user._id,
      title: req.body.subject,
      content: req.body.message,
      sendTo: lab.owner,
    });
    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get all messages to admin that this user send
router.get("/messages", async (req, res) => {
  try {
    const messages = await MessageToAdmin.find({ owner: req.user._id });
    res.status(200).json({
      status: "success",
      data: {
        messages,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get message by id
router.get("/messages/:id", async (req, res) => {
  try {
    const message = await MessageToAdmin.findById(req.params.id)
      .populate("owner", "name surname _id")
      .populate("sendTo", "name surname _id");

    if (!message) {
      return res.status(400).json({
        status: "fail",
        message: "message not found",
      });
    }
    if (message.owner._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "you are not the owner of this message",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//delete contact by id
router.delete("/contact/:id", async (req, res) => {
  try {
    const message = await MessageToAdmin.findById(req.params.id);
    if (!message) {
      return res.status(400).json({
        status: "fail",
        message: "message not found",
      });
    }
    if (message.owner.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "you are not the owner of this message",
      });
    }
    await MessageToAdmin.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "message deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//export data

module.exports = router;
