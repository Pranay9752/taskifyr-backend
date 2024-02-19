// Import the necessary modules
const Project = require('../models/Project');

// Middleware function to check user role
const checkUserRole = async (req, res, next) => {
  try {
    // Extract the project ID from the request parameters or headers, depending on your setup
    const projectId = req.body.id;
    const userId = req.user[0]

    // Find the project by ID and check if the user has the "projectManager" role or is an admin
    const project = await Project.findOne(
      {
        _id: projectId, 'team.user_id': userId, $or: [{ 'team.role': {$eq : 'projectManager'} }, { admin: {$eq : userId} }] 
      }
    );

    // Check if the project exists and the user has the "projectManager" role or is an admin
    if (project) {
      // User has the required role, proceed to the next middleware or route handler
      next();
    } else {
      // User doesn't have the required role, return a 403 Forbidden error
      return res.status(403).json({ error: 'Access denied. Only project managers and admins are allowed.' });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error in checkUserRole middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkUserRole;
