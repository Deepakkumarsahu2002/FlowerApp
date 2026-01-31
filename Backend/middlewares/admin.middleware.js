const UserRole = require('../models/UserRole');

module.exports = async (req, res, next) => {
  const role = await UserRole.findOne({ user_id: req.user.id, role: 'admin' });
  if (!role) return res.status(403).json({ message: "Admin only" });
  next();
};
