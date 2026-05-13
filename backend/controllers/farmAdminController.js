const Farm = require('../models/Farm');

// GET /api/admin/farms
const getAllFarms = async (req, res) => {
  try {
    const farms = await Farm.find({}).sort({ createdAt: -1 });
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/farms
const addFarm = async (req, res) => {
  const { name, district, cropType, lat, lon, areaHa, ownerName, notes, addedBy } = req.body;
  if (!name || !district || !cropType || !lat || !lon) {
    return res.status(400).json({ error: 'Name, district, cropType, lat and lon are required' });
  }
  try {
    const farm = await Farm.create({ name, district, cropType, lat, lon, areaHa, ownerName, notes, addedBy });
    res.status(201).json({ message: 'Farm added successfully', farm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/farms/:id
const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json({ message: 'Farm deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllFarms, addFarm, deleteFarm };
