const express = require("express");
const router = express.Router();
const Laboratory = require("../Model/Laboratory");

/////////////// Laboratory Controller //////////////////

//get labs
router.route("/").get(async (req, res) => {
  const labs = await Laboratory.find({});
  res.status(200).json(labs);
});

// get lab by id
//laboratory = await Laboratory.findById(laboratory._id).populate("owner")
router.route("/:id").get(async (req, res) => {
  const id = req.params.id;
  const lab = await Laboratory.findById(id).populate("owner");
  res.status(200).json(lab);
});

//add laboratory
router.route("/addlab").post(async (req, res) => {
  try {
    const body = req.body;
    const laboratory = await Laboratory.create(body);
    res.json(laboratory);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

//delete laboratory
router.route("/dlab").delete(async (req, res) => {
  try {
    const body = req.body;
    const lab = await Laboratory.findByIdAndDelete(body);
    if (!lab) throw new Error("server error 500");
    res.status(200).json(lab);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

//udate laboratory
router.route("/ulab/:id").patch(async (req, res) => {
  try {
    const body = req.body;
    const lab = await Laboratory.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!lab) throw new Error("There is no lab with this id");
    res.status(200).json(lab);
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
});

module.exports = router;
