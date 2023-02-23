const express = require("express");
const route = express.Router();
const indexControler = require("../controllers/indexControler");

route.get("^/$|index(.html)?", indexControler);

module.exports = route;
