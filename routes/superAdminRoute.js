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
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if the user is an admin
    if (user.role === "admin") {
      // Delete all the labs owned by the admin
      await Laboratory.deleteMany({ owner: userId });

      // Update workers to hasJob: false
      await Laboratory.updateMany(
        { workers: { $in: [userId] } },
        { hasJob: false }
      );
    }

    // Find all labs where the user is a worker or patient
    const labs = await Laboratory.find({
      $or: [{ workers: userId }, { patients: userId }],
    });

    // Update labs to remove the user from workers and patients
    for (let i = 0; i < labs.length; i++) {
      const lab = labs[i];

      // Remove the user from workers
      lab.workers = lab.workers.filter((worker) => {
        return worker.toString() !== userId.toString();
      });

      // Remove the user from patients
      lab.patients = lab.patients.filter((patient) => {
        return patient.toString() !== userId.toString();
      });

      // Update the lab
      await lab.save();
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Send success message
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//get all workers of all labs
router.get("/workers/ar", async (req, res) => {
  try {
    //get all workers
    const workers = await Laboratory.find({})
      .select("workers")
      .populate("workers", "name surname _id");
    //get the only the array of all workers togther
    const allWorkers = workers.map((worker) => worker.workers);
    //get the number of all workers
    const totalWorkers = allWorkers.flat();
    //add all owners to the array
    const owners = await Laboratory.find({})
      .select("owner")
      .populate("owner", "name surname _id");
    const allOwners = owners.map((owner) => owner.owner);
    totalWorkers.push(...allOwners);
    //get the unique workers

    //remove all nulls in the array
    const uniqueWorkers2 = totalWorkers.filter((worker) => worker !== null);
    uniqueWorkers2.push({
      name: req.user.name,
      surname: req.user.surname,
      _id: req.user._id,
    });

    const uniqueWorkers = [...new Set(uniqueWorkers2)];
    //send the response
    return res.status(200).json({
      status: "success",
      workers: uniqueWorkers,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

//export the router
module.exports = router;
