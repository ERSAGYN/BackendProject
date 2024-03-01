const { getUserIdFromToken } = require("../controllers/userController");
const User = require("../models/user");

const checkUserRole = (allowedRoles) => {
  return async (req, res, next) => {
    //const token = req.session.token;
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - Token not provided" });
    }

    const userId = getUserIdFromToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userRole = user.role; // Replace with your actual field name for user role

      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({ error: "Access forbidden" });
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

module.exports = {
  checkUserRole,
};
