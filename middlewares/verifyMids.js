const jwt = require("jsonwebtoken");
const User = require("./../schema/userSchema");

const verifyJwt = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized action" });
  }

  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized action" });
    }

    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const adminEmail = req.decoded.email;
  const query = { email: adminEmail };
  const user = await User.findOne(query);

  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    return res.status(401).json({ error: "Unauthorized action" });
  }
  next();
};

module.exports = { verifyJwt, verifyAdmin };
