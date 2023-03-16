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
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (e) {
    return res
      .status(401)
      .json({ status: "faild", message: "token doen't exit plz login again" });
  }
  //checkin if the currentUser is still exist (not deleted)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: "faild",
      message: "the currentUser with this token has been deleted",
    });
  }

  //checking if the password has been updated
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: "faild",
      message: "token has expired because password update plz login again",
    });
  }

  //if all test are passed so will continue the process
  //sign the current currentUser to the request

  req.user = currentUser;

  //send it to text meddileware
  next();
};

exports.permition = (...roles) => {
  return (req, res, next) => {
    const hasRole = req.user.role.some((role) => roles.includes(role));
    if (!hasRole) {
      res
        .status(403)
        .json({
          status: "no permition",
          message: "You do not have permitin to profom this action",
        });
    }
    next();
  };
};
