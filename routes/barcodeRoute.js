const express = require("express");
const bwipjs = require("bwip-js");
const router = express.Router();

router.get("/:data", (req, res) => {
  const data = req.params.data;

  bwipjs.toBuffer(
    {
      bcid: "code128", // Barcode type
      text: data, // Barcode data
      scale: 3, // Image scale factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Show human-readable text below the barcode
    },
    (err, png) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.set("Content-Type", "image/png");
        res.send(png);
      }
    }
  );
});

module.exports = router;
