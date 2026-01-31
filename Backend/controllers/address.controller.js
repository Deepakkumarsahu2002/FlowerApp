const Address = require('../models/Address');

/* ---------------- ADD ADDRESS ---------------- */
exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, pincode } = req.body;

    if (!street || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const address = await Address.create({
      user_id: req.user.id,
      street,
      city,
      state,
      pincode,
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add address' });
  }
};

/* ---------------- UPDATE ADDRESS ---------------- */
exports.updateAddress = async (req, res) => {
  try {
    const { street, city, state, pincode } = req.body;

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { street, city, state, pincode },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch {
    res.status(500).json({ message: 'Failed to update address' });
  }
};

/* ---------------- DELETE ADDRESS ---------------- */
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

/* ---------------- SET DEFAULT ADDRESS ---------------- */
exports.setDefaultAddress = async (req, res) => {
  try {
    await Address.updateMany(
      { user_id: req.user.id },
      { is_default: false }
    );

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { is_default: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch {
    res.status(500).json({ message: 'Failed to set default address' });
  }
};
