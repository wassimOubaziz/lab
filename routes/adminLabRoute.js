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
const JobRequest = require("../Model/JobRequest");
const User = require("../Model/User");
const { route } = require("./nurseRoute");

/////////////// Admin Laboratory Routes //////////////////

//get labs for admin
router.route("/").get(async (req, res) => {
  try {
    const labs = await Laboratory.find({ owner: req.user._id }).populate([
      "patients",
      "workers",
    ]);
    const announcements = await Announcement.find({ owner: req.user._id });
    const bloodBanks = await BloodBank.find({ lab_owner: req.user._id });
    //calculate all the blookBank amount for all labs for each bloodType
    const bloodBankAmount = bloodBanks.map((bloodBank) => bloodBank.amount);
    // add the first element with the first ...
    const result = [0, 0, 0, 0, 0, 0, 0, 0];
    bloodBankAmount.forEach((amount, i) => {
      amount.forEach((a, j) => {
        result[j] += a;
      });
    });

    return res.status(200).json({
      user: req.user,
      labs: labs,
      announcements,
      bloodBank: result,
    });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

/////////////// Laboratory Controller //////////////////

//handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedBaseName = baseName.replace(/ /g, "-");
    cb(null, `${sanitizedBaseName}-${Date.now()}${extension}`);
  },
});

const upload = multer({ storage: storage });
router.route("/addlab").post(upload.single("labsImages"), async (req, res) => {
  const { name, address, id } = req.body;
  if (id) {
    let imgPath;
    let lab;
    try {
      lab = await Laboratory.findById(id);
      const newLab = Laboratory({
        owner: lab.owner,
        patients: lab.patients,
        workers: lab.workers,
        avgRating: lab.avgRating,
        numRates: lab.numRates,
        address: lab.address,
        name: lab.name,
        img: lab.img,
      });
      await lab.deleteOne();
      newLab.name = name;
      newLab.address = address;
      if (req.file && req.file.path) {
        imgPath = req.file.path.replace(/\\/g, "/").substring("public".length);
        newLab.img = imgPath;
      }

      await newLab.save();

      const labs = await Laboratory.find({ owner: req.user._id }).populate([
        "patients",
        "workers",
      ]);
      return res.status(201).json({
        status: "success",
        message: "Lab updated successfully",
        labs: labs,
      });
    } catch (e) {
      return res.status(400).json({ status: "faild", message: e.message });
    }
  }

  const imgPath = req?.file?.path
    .replace(/\\/g, "/")
    .substring("public".length);
  const owner = req.user._id;

  //Create a new Lab instance and save to database
  const lab = new Laboratory({ name, address, owner, img: imgPath });
  try {
    const labo = await lab.save();
    //create bloodBank for this lab
    const bloodBank = new BloodBank({
      id_lab: labo._id,
      bloodType: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      amount: [0, 0, 0, 0, 0, 0, 0, 0],
      lab_owner: req.user._id,
    });
    await bloodBank.save();
    const labs = await Laboratory.find({ owner: req.user._id }).populate([
      "patients",
      "workers",
    ]);
    return res.status(201).json({
      status: "success",
      message: "Lab added successfully",
      labs: labs,
    });
  } catch (err) {
    return res.status(400).json({
      status: "faild",
      message: err.message,
    });
  }
});

//delete lab
router.route("/:id").delete(async (req, res) => {
  const id = req.params.id;
  try {
    await Laboratory.findByIdAndDelete(id);
    const labs = await Laboratory.find({ owner: req.user._id }).populate([
      "patients",
      "workers",
    ]);
    return res.status(201).json({
      status: "success",
      message: "Lab deleted successfully",
      labs: labs,
    });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//add new announcement
router.route("/addAnnouncement").post(async (req, res) => {
  const { title, content, job, address, id } = req.body;

  const lab = address;

  if (!title || !content || !job || !lab)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  if (id) {
    try {
      await Announcement.findByIdAndUpdate(id, {
        title,
        content,
        job,
        lab,
      });
      const announcements = await Announcement.find({ owner: req.user._id });
      return res.status(201).json({
        status: "success",
        message: "Announcement updated successfully",
        announcements,
      });
    } catch (e) {
      return res.status(400).json({ status: "faild", message: e.message });
    }
  }

  try {
    const lab = await Laboratory.findById(address).select("owner");
    const announce = new Announcement({
      title,
      content,
      job,
      lab,
      owner: lab.owner,
    });
    await announce.save();
    const announcements = await Announcement.find({ owner: req.user._id });
    return res.status(201).json({
      status: "success",
      message: "Announcement added successfully",
      announcements,
    });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//delete announcement
router.route("/deleteAnnouncement/:id").delete(async (req, res) => {
  const id = req.params.id;
  try {
    await Announcement.findByIdAndDelete(id);
    const announcements = await Announcement.find({ owner: req.user._id });
    return res.status(201).json({
      status: "success",
      message: "Announcement deleted successfully",
      announcements,
    });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//consult complaints for the admin
router.route("/complaints").get(async (req, res) => {
  const body = req.body.sortby || 1;
  try {
    //show all the complaints
    const complaints = await Complaint.find({
      owner: req.user._id,
    })
      .populate(["complainer", "reported"])
      .sort({ date: body });
    res.status(200).json({ complaints });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//delete complaint
router.route("/complaints/:id").delete(async (req, res) => {
  const id = req.params.id;

  try {
    await Complaint.findByIdAndUpdate(id, { deletedByAdmin: true });
    const complaints = await Complaint.find({ owner: req.user._id })
      .populate(["complainer", "reported"])
      .sort({ date: 1 });
    return res.status(201).json({
      status: "success",
      message: "Complaint deleted successfully",
      complaints,
    });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//get all the messages that send to admin
router.route("/messages").get(async (req, res) => {
  //return all messages that send to admin by users that work for him
  try {
    const messages = await MessageToAdmin.find({
      sendTo: req.user._id,
    }).populate("owner");
    return res.status(200).json({ messages });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//sending text (response) to the user
router.route("/messages").post(async (req, res) => {
  const { text, messageId } = req.body;
  if (!text || !messageId)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    //update the message
    await MessageToAdmin.findByIdAndUpdate(messageId, {
      replied: text,
    });
    const messages = await MessageToAdmin.find({
      sendTo: req.user._id,
    }).populate("owner");

    return res
      .status(200)
      .json({ messages, message: "Message sent successfully" });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//add blood donation
router.route("/addBloodDonation").post(async (req, res) => {
  const { id_donator, id_lab, bloodType, amount } = req.body;
  if (!id_donator || !id_lab || !bloodType || !amount)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    await Donation.create({ id_user: id_donator, id_lab, bloodType, amount });
    const bloodBanks = await BloodBank.find({ owner: req.user._id })
      .select("bloodType amount id_lab")
      .populate("id_lab");
    return res.status(201).json({
      status: "success",
      message: "Donation added successfully",
      bloodBanks,
    });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//get lab by id
router.route("/:id").get(async (req, res) => {
  const id = req.params.id;
  try {
    const lab = await Laboratory.findById(id).populate(["workers", "patients"]);
    const bloodBank = await BloodBank.findOne({ id_lab: id });
    return res.status(200).json({ lab, bloodBank });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//change for the worker to another lab
router.route("/transfer").post(async (req, res) => {
  const { workerId, labId, newLabId } = req.body;
  if (!workerId || !labId || !newLabId)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    //remove the worker from the old lab
    ////////////////// when i comeback i will work here ///////////////////////
    /// i will remove the worker from the old lab and add him to the new lab
    const oldLab = await Laboratory.findById(labId);
    const index = oldLab.workers.indexOf(workerId);
    oldLab.workers.splice(index, 1);
    await oldLab.save();
    //add the worker to the new lab
    const newLab = await Laboratory.findById(newLabId);
    newLab.workers.push(workerId);
    await newLab.save();
    return res
      .status(200)
      .json({ lab: oldLab, message: "The worker has been Transfered." });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//delete the worker lab from the lab
router.route("/:id/:worker").delete(async (req, res) => {
  const id = req.params.id;
  const workerId = req.params.worker;
  try {
    const lab = await Laboratory.findById(id);
    const index = lab.workers.indexOf(workerId);
    lab.workers.splice(index, 1);
    await lab.save();
    return res
      .status(200)
      .json({ lab, message: "The worker has been deleted." });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//get all jobs requests for an announcement for only this user
router.route("/annonce/:id").get(async (req, res) => {
  const id = req.params.id;
  try {
    const applicant = await Announcement.findOne({
      _id: id,
      owner: req.user._id,
    })
      .select("jobRequests title")
      .populate({
        path: "jobRequests",
        select: "cv date status",
        populate: { path: "user", select: "name surname email -_id" },
      });

    return res.status(200).json({ applicant, status: "success" });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//accept or reject the job request
router.route("/annonce/:id").post(async (req, res) => {
  const id = req.params.id;
  const { jobRequestId, status } = req.body;
  if (!jobRequestId || !status) {
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });
  }
  try {
    const announcement = await Announcement.findOne({
      _id: id,
      owner: req.user._id,
    });
    //check if status is accept then save it in laboratory
    if (status === "accept") {
      //check if the user is already working in this lab
      const lab = await Laboratory.findById(announcement.lab);
      const worker = await JobRequest.findById(jobRequestId).select("user");

      if (lab.workers.includes(worker.user))
        return res.status(400).json({
          status: "faild",
          message: "This worker already working in this lab",
        });
      //add the worker to the lab
      lab.workers.push(worker.user);
      await lab.save();
      //update jobRequests to accepted
      await JobRequest.findByIdAndUpdate(jobRequestId, { status: "accepted" });

      //update the user hasjob to true
      await User.findByIdAndUpdate(worker.user, { hasJob: true });

      //delete from all other announcements jobRequests of this user
      await Announcement.updateMany(
        { "jobRequests.user": worker.user },
        { $pull: { jobRequests: { user: worker.user } } }
      );

      //delete all job request of this user
      await JobRequest.deleteMany({ user: worker.user });
    } else if (status === "reject") {
      //update jobRequests to rejected
      await JobRequest.findByIdAndUpdate(jobRequestId, { status: "rejected" });
    }

    const applicant = await Announcement.findOne({
      _id: id,
      owner: req.user._id,
    })
      .select("jobRequests title")
      .populate({
        path: "jobRequests",
        select: "cv date status",
        populate: { path: "user", select: "name surname email -_id" },
      });

    return res
      .status(200)
      .json({ applicant, status: "success", message: "successfuly send" });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//get all the workers for this admin
router.route("/workers/ar").get(async (req, res) => {
  try {
    //get workers from lab that this admin own
    const workers = await Laboratory.find({ owner: req.user._id })
      .select("workers")
      .populate("workers", "name surname");
    //get the only the array of all workers togther
    const workersArray = workers.map((worker) => worker.workers);
    //flat the array
    const flatWorkersArray = workersArray.flat();
    //get the unique workers
    const uniqueWorkers = [...new Set(flatWorkersArray)];
    //add the owner to the array
    uniqueWorkers.push({
      _id: req.user._id,
      name: req.user.name,
      surname: req.user.surname,
    });

    return res.status(200).json({ workers: uniqueWorkers });
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

//check if the user is a worker in this lab
router.route("/check-worker").post(async (req, res) => {
  const { id, labId } = req.body;
  if (!id || !labId)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    const lab = await Laboratory.findById(labId)
      .select("workers owner")
      .populate("workers", "name surname email phone role")
      .populate("owner", "name surname email phone role");
    //if not the owner send only the worker if it the owner send only the owner

    if (
      id === req.user._id.toString() &&
      lab.owner._id.toString() === req.user._id.toString()
    ) {
      return res.status(200).json({
        status: "success",
        message: "You allowed to oppen this door",
        user: lab.owner,
      });
    }

    if (lab.workers.some((worker) => worker._id.toString() === id)) {
      const worker = lab.workers.find((worker) => worker._id.toString() === id);
      return res.status(200).json({
        status: "success",
        message: "You are allowed to open this door",
        user: worker,
      });
    } else {
      const user = await User.findById(id).select("name surname email");
      return res.status(200).json({
        status: "faild",
        message: "Your not allowed to oppen this door",
        user: user,
      });
    }
  } catch (e) {
    return res.status(400).json({ status: "faild", message: e.message });
  }
});

module.exports = router;
