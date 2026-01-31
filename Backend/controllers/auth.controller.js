const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { email, password, name, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  await UserRole.create({ user_id: user._id, role: 'user' });
  await Profile.create({ user_id: user._id, name, phone });

  res.json({ message: "Signup successful" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid creds" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid creds" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user profile
    const profile = await Profile.findOne({ user_id: user._id });
    
    // Get user role
    const userRole = await UserRole.findOne({ user_id: user._id });

    // Return user with profile and role info
    res.json({
      _id: user._id,
      email: user.email,
      name: profile?.name || user.email.split('@')[0],
      phone: profile?.phone,
      role: userRole?.role || 'user',
    });
  } catch (error) {
    console.error('Error in me endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
