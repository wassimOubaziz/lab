const express = require("express");
//multer is for uploading files(images)
const multer = require("multer");
const path = require("path");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");
const Announcement = require("../Model/Announcement");

/////////////// Admin Laboratory Routes //////////////////

//get labs for admin
router.route("/").get(async (req, res) => {
  try {
    const labs = await Laboratory.find({ owner: req.user._id }).populate([
      "patients",
      "workers",
    ]);
    const announcements = await Announcement.find({ owner: req.user._id });
    res.status(200).json({ user: req.user, labs: labs, announcements });
  } catch (e) {
    res.status(400).json({ message: e.message });
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
  const { name, address } = req.body;
  const imgPath = req?.file?.path
    .replace(/\\/g, "/")
    .substring("public".length);
  const owner = req.user._id;

  //Create a new Lab instance and save to database
  const lab = new Laboratory({ name, address, owner, img: imgPath });
  try {
    await lab.save();
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

//add new announcement
router.route("/addAnnouncement").post(async (req, res) => {
  const { title, content, job, address, id } = req.body;

  if (!title || !content || !job || !address)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  if (id) {
    try {
      await Announcement.findByIdAndUpdate(id, {
        title,
        content,
        job,
        address,
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
    const announce = new Announcement({
      title,
      content,
      job,
      address,
      owner: req.user._id,
    });
    announce.save();
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

module.exports = router;
