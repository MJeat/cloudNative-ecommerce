const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message: "Authentication is not configured"
    });
  }

  // No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret
    );

    req.user = decoded;

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired"
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};


const authorizeRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {

    if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        next();
    };
};

module.exports = { authenticateToken, authorizeRole };

