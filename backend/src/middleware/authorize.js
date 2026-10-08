import ApiError from "../utils/apiError.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this route`,
      );
    }
    next()
  };
};

export default authorize;
