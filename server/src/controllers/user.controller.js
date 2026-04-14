const User = require('../models/User');

const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-passwordHash -emailVerificationToken -passwordResetToken');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

const updateMe = async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'profilePicture'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
    .select('-passwordHash -emailVerificationToken -passwordResetToken');
  res.json(user);
};

const updateDeliveryAddress = async (req, res) => {
  const { buildingName, roomNumber, deliveryNotes } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { deliveryAddress: { buildingName, roomNumber, deliveryNotes } },
    { new: true }
  ).select('-passwordHash');
  res.json(user);
};

const becomeDriver = async (req, res) => {
  const { vehicleType } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'driver') return res.status(400).json({ error: 'Already a driver' });

  user.role = 'driver';
  user.driverProfile = { isAvailable: false, vehicleType: vehicleType || 'foot' };
  await user.save();

  res.json({ message: 'You are now registered as a driver!', user });
};

const toggleAvailability = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== 'driver') return res.status(403).json({ error: 'Not a driver' });

  user.driverProfile.isAvailable = !user.driverProfile.isAvailable;
  await user.save();
  res.json({ isAvailable: user.driverProfile.isAvailable });
};

const listAllUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash -emailVerificationToken -passwordResetToken').sort({ createdAt: -1 });
  res.json(users);
};

module.exports = { getMe, updateMe, updateDeliveryAddress, becomeDriver, toggleAvailability, listAllUsers };
