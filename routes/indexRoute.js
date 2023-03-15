const express = require("express");
const router = express.Router();
const {
  getIndexPage,
  sendMessageToSuperAdmin,
} = require("../controllers/indexControler");
const Message = require("../Model/Message");

router
  .route("^/$|index(.html)?")
  .get(getIndexPage)
  .post(sendMessageToSuperAdmin);

module.exports = router;
