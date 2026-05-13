const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { 
  getDashboard, 
  getAlerts, 
  getHistory, 
  addSensorData, 
  seedData,
  getPredictions,
  predict 
} = require('../controllers/apiController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Data routes
router.get('/dashboard', getDashboard);
router.get('/predictions', getPredictions);
router.get('/predict', predict);
router.get('/alerts', getAlerts);
router.get('/history', getHistory);
router.post('/sensors', addSensorData);
router.get('/seed', seedData); // Added GET for easy testing via browser

module.exports = router;
