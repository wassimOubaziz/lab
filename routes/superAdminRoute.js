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
const Message = require("../Model/Message");
const Review = require("../Model/Review");

//dashbord page
router.get("/", async (req, res) => {
  try {
    const usersActive = await User.find({ acitve: true });
    const users = await User.find();
    const labs = await Laboratory.find();
    const messages = await Message.find();
    const reviews = await Review.find();

    //how much owners of labs there are unique
    const owners = labs.map((lab) => lab.owner.toString());
    const uniqueOwners = [...new Set(owners)];

    //get createdAt of the users
    const usersJoined = users.map((user) => user.createdAt);
    const labsJoined = labs.map((lab) => lab.createdAt);
    //sort labsJoined by date
    labsJoined.sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    //get labs name with numRates and avgRating
    const labsName = labs.map((lab) => {
      return {
        name: lab.name,
        numRates: lab.numRates,
        avgRating: lab.avgRating,
        workers: lab.workers.length,
        patients: lab.patients.length,
      };
    });

    //get the number of donations
    const donations = await Donation.find();
    const donationsNum = donations.length;
    //get all BloodBanks sum of blood

    const bloodBanks = await BloodBank.find();
    const totalAmounts = bloodBanks
      .map((bloodBank) => bloodBank.amount) // extract the amounts array from each lab object
      .reduce((acc, cur) => acc.map((val, i) => val + cur[i])); // sum the amounts arrays

    res.status(200).json({
      status: "success",
      data: {
        totalProfit: 50250,
        usersActive: usersActive.length,
        users: users.length,
        usersJoined,
        labs: labs.length,
        labsJoined,
        labsName,
        donationsNum,
        messages: messages.length,
        totalAmounts,
        uniqueOwners: uniqueOwners.length,
        user: {
          name: req.user.name,
          surname: req.user.surname,
          role: req.user.role[1],
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

//get all labs
router.get("/labs", async (req, res) => {
  try {
    const labs = await Laboratory.find({});
    res.status(200).json({
      status: "success",
      labs,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get labs by id
router.get("/labs/:id", async (req, res) => {
  try {
    const lab = await Laboratory.findById(req.params.id)
      .populate("workers")
      .populate("patients")
      .populate("owner");

    //get all labs
    const labs = await Laboratory.find({})
      .populate("workers")
      .populate("patients")
      .populate("owner");
    //get blood bank
    const bloodBank = await BloodBank.findOne({ lab: lab._id });

    res.status(200).json({
      status: "success",
      lab,
      bloodBank,
      labs,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get all announcements
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find({});
    //get all labs
    const labs = await Laboratory.find({}).select("name _id address");
    res.status(200).json({
      status: "success",
      announcements,
      labs,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get all Messages
router.get("/messages", async (req, res) => {
  try {
    //and sort them by timeSpan
    const messages = await Message.find({}).sort({ timeSpan: -1 });
    res.status(200).json({
      status: "success",
      messages,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//delete message by id
router.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    const messages = await Message.find({}).sort({ timeSpan: -1 });
    res.status(200).json({
      status: "success",
      messages,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get users 5 in one time
//this is my link /superadmin/users?page=${activePage}&search=${searchTerm}
router.get("/users", async (req, res) => {
  try {
    //get the page number
    const activePage = req.query.page || 1;
    //get the search term
    const searchTerm = req.query.search || "";
    //get the limit
    const limit = 5;
    //get the skip
    const skip = (activePage - 1) * limit;
    //get the users
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { surname: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit);
    //get the total number of users
    const totalUsers = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { surname: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ],
    }).countDocuments();
    //get the total number of pages
    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      status: "success",
      users,
      totalUsers,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    //delete all the reference of the user in the lab
    const labs = await Laboratory.find({});
    labs.forEach(async (lab) => {
      //delete the user from the workers
      const workers = lab.workers.filter((worker) => {
        return worker.toString() !== user._id.toString();
      });
      //delete the user from the patients
      const patients = lab.patients.filter((patient) => {
        return patient.toString() !== user._id.toString();
      });
      //update the lab
      await Laboratory.findByIdAndUpdate(lab._id, {
        workers,
        patients,
      });
    });

    //send seccess message
    res.status(200).json({
      status: "success",
      message: "user deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//export the router
module.exports = router;
