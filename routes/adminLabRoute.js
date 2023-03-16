const express = require("express");
const { protect } = require("../controllers/signInControler");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");

/////////////// Admin Laboratory Routes //////////////////

//get labs with search
router.route("/").get(protect, async (req, res) => {
  try {
    res.status(200).json({ message: "this is working" });
  } catch (e) {}
});

module.exports = router;
