const express = require("express");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");

/////////////// Admin Laboratory Routes //////////////////

//get labs with search
router.route("/").get(async (req, res) => {
  try {
    console.log(req.body);

    res.status(200).json();
  } catch (e) {}
});

module.exports = router;
