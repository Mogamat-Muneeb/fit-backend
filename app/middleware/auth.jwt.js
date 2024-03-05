const jwt = require("jsonwebtoken");


const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    console.log("🚀 ~ jwt.verify ~ decoded:", decoded.role);
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }
    req.userId = decoded._id;
    req.userRole = decoded.role || "user";
    next();
  });
};


  module.exports = authenticateUser;