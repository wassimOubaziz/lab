const express = require("express");
const router = express.Router();
const Paiment = require("../Model/Paiment");
// add paiment
router.post("/Addpaiment", async (req, res) => {
  try {
    const {
      cardNumber,
      cardHolder,
      expirationMM,
      expirationYY,
      cvv,
      laboratoryId,
    } = req.body;
    const payer = req.user._id.toString();
    const newPayment = new Paiment({
      cardNumber,
      cardHolder,
      expirationMM,
      expirationYY,
      cvv,
      user: payer,
      laboratory: laboratoryId,
    });

    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get all payment
router.get("/payments", async (req, res) => {
  try {
    const payments = await Paiment.find();
    res.send(payments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//get paiment by user
router.get("/users/:id/paiments", async (req, res) => {
  try {
    const userId = req.user._id;
    const paiments = await Paiment.find({ user: userId }).populate(
      "laboratory"
    );
    res.status(200).json(paiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// get paiment by id lab

router.get("/laboratories/:id/paiments", async (req, res) => {
  try {
    const labId = req.params.id;
    const paiments = await Paiment.find({ laboratory: labId }).populate("user");
    res.status(200).json(paiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
