/**
 * Middleware to check if user has required role
 * @param {string|Array} requiredRole - Role or array of roles required to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // Check if user is authenticated and has role information
    if (!req.admin || !req.admin.role) {
      const error = new Error('Not Authenticated or Role not found');
      error.statusCode = 401;
      throw error;
    }

    const userRole = req.admin.role;

    // If requiredRole is an array, check if user role is in the array
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        const error = new Error('Insufficient permissions');
        error.statusCode = 403;
        throw error;
      }
    } else {
      // If requiredRole is a string, check for exact match
      if (userRole !== requiredRole) {
        const error = new Error('Insufficient permissions');
        error.statusCode = 403;
        throw error;
      }
    }

    next();
  };
};

module.exports = requireRole; 