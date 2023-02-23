const path = require("path");

module.exports = getIndexPage = (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
};
