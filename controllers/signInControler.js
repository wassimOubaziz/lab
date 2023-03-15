//checking login (valide token).
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const { promisify } = require("util");

exports.protect = async (req, res, next) => {
  //getting token and check it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return res
      .status(401)
      .json({ status: "faild", message: "token doen't exit plz login again" });

  //verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //checkin if the user is still exist (not deleted)
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({
      status: "faild",
      message: "the user with this token has been deleted",
    });
  }

  //checking if the password has been updated
  if (user.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: "faild",
      message: "token has expired because password update plz login again",
    });
  }

  //if all test are passed so will continue the process
  next();
};
