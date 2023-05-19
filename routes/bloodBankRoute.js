const express = require("express");
const Donation = require("../Model/Donation");
const BloodBank = require("../Model/BloodBank");
const router = express.Router();

//add a new donation blood bank
router.route("/").post(async (req, res) => {
  const { id_donator, id_lab, bloodType, amount } = req.body;
  if (!id_donator || !id_lab || !bloodType || !amount)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    await Donation.create({ id_user: id_donator, id_lab, bloodType, amount });
    res.status(200).json({
      status: "success",
      message: "the donation has been added successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "faild",
      message: err.message,
    });
  }
});

// substract a value of blood from blood bank
router.route("/").put(async (req, res) => {
  const { id_lab, bloodType, amount } = req.body;
  if (!id_lab || !bloodType || !amount)
    return res
      .status(400)
      .json({ status: "faild", message: "Please fill all fields" });

  try {
    const bloodBank = await BloodBank.findOne({ id_lab });

    if (!bloodBank)
      return res.status(400).json({
        status: "faild",
        message: "there is no donations in this lab with this blood type",
      });

    //get the amount and substract it from the blood bank with type
    const amounts = bloodBank.amount;
    const index = bloodBank.bloodType.findIndex((bt) => bt === bloodType);
    //if the amount is less than the amount in the blood bank
    if (amounts[index] < -amount)
      return res.status(400).json({
        status: "faild",
        message: "the amount is less than the amount in the blood bank",
      });

    amounts[index] += amount;
    bloodBank.amount = amounts;
    await bloodBank.save();
    res.status(200).json({
      status: "success",
      message: `You removed (type blood type ${bloodType}, ${-amount} Litter) successfully`,
    });
  } catch (err) {
    res.status(400).json({
      status: "faild",
      message: err.message,
    });
  }
});

//export the router
module.exports = router;
