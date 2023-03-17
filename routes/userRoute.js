const express = require("express");
const Laboratory = require("../Model/Laboratory");
const User = require("../Model/User");
const router = express.Router();

//get all users
router.route("/").get(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

//get user by id
router.route("/:id").get(async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (user) {
      return res.status(200).json(user);
    }
    res
      .status(400)
      .json({ message: `the user with this id: ${id} does not exist` });
  } catch (e) {
    res.status(400).json({
      message: `the user with this id: ${id} does not exist`,
    });
  }
});

//add user ["receptionist", "nurse", "auditor"] for the admin
router.route("/addworker").post(async (req, res) => {
  const body = req.body;
  try {
    const lab = await Laboratory.findById(body.labid);
    const isDuplicate = lab.workers.some(
      (worker) => String(worker) === body.userid
    );
    if (isDuplicate) {
      return res
        .status(400)
        .json({ message: "User is already added to this laboratory" });
    }
    lab.workers.push(body.userid);
    await lab.save();
    res.status(202).json({ lab });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//serach for users

module.exports = router;
