const express = require("express");
const router = express.Router();
const Review = require("../Model/Review");

//get reviews
router.route("/").get(async (req, res) => {
  try {
    const reviews = await Review.find({});
    res.status(200).json(reviews);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//add reviews
router.route("/addrev").post(async (req, res) => {
  try {
    const body = req.body;
    const review = await Review.create(body);
    res.status(200).json({ review });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//delete review
router.route("/delrev").delete(async (req, res) => {
  try {
    const body = req.body;
    const delrev = await Review.findById(body);
    delrev.remove();
    res.status(200).json(delrev);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

//udate review
router.route("/urev").patch(async (req, res) => {
  try {
    const body = req.body;
    const delrev = await Review.findByIdAndUpdate(
      { _id: body._id },
      { rating: body.rating },
      { new: true }
    );
    delrev.save();
    res.status(200).json(delrev);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
