const User = require('../models/User');
const Profile = require('../models/Profile');
const Address = require('../models/Address');

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('_id email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ user_id: userId });
    const addresses = await Address.find({ user_id: userId }).sort({
      is_default: -1,
      createdAt: -1
    });

    res.json({
      _id: user._id,
      email: user.email,
      profile: profile
        ? {
            name: profile.name,
            phone: profile.phone,
            last_login: profile.last_login
          }
        : null,
      addresses: addresses.map(addr => ({
        _id: addr._id,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country,
        is_default: addr.is_default
      }))
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Failed to fetch user profile'
    });
  }
};


exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required'
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { user_id: userId },
      {
        name,
        phone,
        last_login: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile updated successfully',
      profile: {
        name: profile.name,
        phone: profile.phone,
        last_login: profile.last_login
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile'
    });
  }
};
