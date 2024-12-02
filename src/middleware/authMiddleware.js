const User = require("../models/user"); // Adjust this path based on your folder structure
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;
    // console.log(token)

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    // Verify the token
    const verified = jwt.verify(token, process.env.SECRET_KEY); 

    // Get the user info from the database
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user info to request object
    req.user = user; 

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    console.error("Error during verification:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = protect;
