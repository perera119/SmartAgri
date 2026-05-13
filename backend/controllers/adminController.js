const User      = require('../models/User');
const SensorData = require('../models/SensorData');
const Alert      = require('../models/Alert');

// @route  GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['User', 'Admin'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  GET /api/admin/stats
const getSystemStats = async (req, res) => {
  try {
    const [totalUsers, adminUsers, totalSensorReadings, totalAlerts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Admin' }),
      SensorData.countDocuments(),
      Alert.countDocuments(),
    ]);
    const latestSensor = await SensorData.findOne().sort({ timestamp: -1 });
    res.json({
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      totalSensorReadings,
      totalAlerts,
      latestSensor: latestSensor || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getSystemStats };
