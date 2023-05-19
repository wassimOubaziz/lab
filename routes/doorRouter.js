const router = require("express").Router();
const Laboratory = require("../Model/Laboratory");
const User = require("../Model/User");

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
      (id === req.user._id.toString() &&
        lab.owner._id.toString() === req.user._id.toString()) ||
      lab.owner._id.toString() === id ||
      req.user.role.includes("superadmin")
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
