const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Failed to authenticate token." });
      }
      req.userId = decoded._id;
      next();
    });
  };


  module.exports = authenticateUser;