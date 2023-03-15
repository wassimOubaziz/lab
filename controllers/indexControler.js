const Laboratory = require("../Model/Laboratory");
const Message = require("../Model/Message");

//get index page
exports.getIndexPage = async (req, res) => {
  let labs = await Laboratory.find({}).sort({ avgRating: -1 }).limit(4);
  res.status(200).json({
    length: labs.length,
    departement: 3,
    awards: 255,
    workers: 500,
    labs,
  });
};

//post message for no inscri
exports.sendMessageToSuperAdmin = async (req, res) => {
  const body = req.body;
  try {
    const message = await Message.create(body);
    return res.status(200).json({
      message: "success, The message has been send! Thanks for contacting us!",
    });
  } catch (e) {
    res.status(400).json({ message: "please check your inputs!" });
  }
};
