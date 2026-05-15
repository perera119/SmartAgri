const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const { getAllUsers, updateUserRole, deleteUser, getSystemStats } = require('../controllers/adminController');
const { getAllFarms, addFarm, deleteFarm, updateFarm, createOfficialAlert } = require('../controllers/farmAdminController');
const { 
  getDashboard, 
  getAlerts, 
  getHistory, 
  addSensorData, 
  seedData,
  getPredictions,
  predict,
  getSriLankaFarms
} = require('../controllers/apiController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateProfile);

// Admin routes
router.get('/admin/users', getAllUsers);
router.put('/admin/users/:id/role', updateUserRole);
router.delete('/admin/users/:id', deleteUser);
router.get('/admin/stats', getSystemStats);

// Farm admin routes
router.get('/admin/farms', getAllFarms);
router.post('/admin/farms', addFarm);
router.put('/admin/farms/:id', updateFarm);
router.delete('/admin/farms/:id', deleteFarm);
router.post('/admin/broadcast', createOfficialAlert);

// Data routes
router.get('/dashboard', getDashboard);
router.get('/predictions', getPredictions);
router.get('/predict', predict);
router.get('/alerts', getAlerts);
router.get('/history', getHistory);
router.post('/sensors', addSensorData);
router.get('/seed', seedData); // Added GET for easy testing via browser
router.get('/farms/sri-lanka', getSriLankaFarms);

module.exports = router;
