const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "authusertouserpostsapp");
  } catch (error) {
    // console.log(error.message);
    return res.status(500).json({ message: "Error server" });
  }

  if (!decodedToken) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.userId = decodedToken.userId;
  next();
};
