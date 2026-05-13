const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { generatePrediction } = require('../utils/prediction');
const { fetchSriLankaFarms } = require('../services/farmService');

// @desc    Get dashboard data
// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });

    if (!latest) {
      return res.json({
        lastUpdated: new Date().toISOString(),
        farmStatus: "Mock Data (DB Offline)",
        metrics: {
          temperature: 28.5,
          humidity: 65,
          soilMoisture: 42,
          rainfall: 12.4
        },
        prediction: {
          droughtRisk: 65,
          floodRisk: 10,
          pestRisk: 15,
          overallStatus: "warning",
          recommendation: "Mock recommendation: Start irrigation.",
          prediction: "Irrigation Needed"
        }
      });
    }

    const prediction = await generatePrediction(latest);
    const farmStatus = latest.soilMoisture < 45 ? "Low soil moisture detected" : "All conditions normal";

    res.json({
      lastUpdated: latest.timestamp,
      farmStatus,
      metrics: {
        temperature: latest.temperature,
        humidity: latest.humidity,
        soilMoisture: latest.soilMoisture,
        rainfall: latest.rainfall,
      },
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    if (alerts.length === 0) {
       return res.json([{
          type: "Mock Drought Risk",
          severity: "Medium",
          message: "Soil moisture level is low (Mock).",
          recommendedAction: "Start irrigation.",
          status: "active",
          time: "Just now",
          createdAt: new Date().toISOString()
       }]);
    }
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get history
// @route   GET /api/history
const getHistory = async (req, res) => {
  try {
    const readings = await SensorData.find({}, { _id: 0, day: 1, temperature: 1, soilMoisture: 1 }).sort({ timestamp: 1 });
    if (readings.length === 0) {
      return res.json([
        { day: "Mon", temperature: 27, soilMoisture: 50 },
        { day: "Tue", temperature: 28, soilMoisture: 48 },
        { day: "Wed", temperature: 29, soilMoisture: 46 },
        { day: "Thu", temperature: 30, soilMoisture: 44 },
        { day: "Fri", temperature: 28, soilMoisture: 42 },
      ]);
    }
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add sensor data
// @route   POST /api/sensors
const addSensorData = async (req, res) => {
  const { fieldId, temperature, humidity, soilMoisture, rainfall } = req.body;

  if (!fieldId || temperature === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const timestamp = new Date().toISOString();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  try {
    const sensorDoc = await SensorData.create({
      fieldId,
      temperature,
      humidity,
      soilMoisture,
      rainfall,
      timestamp,
      day
    });

    const prediction = await generatePrediction(sensorDoc);

    if (prediction.droughtRisk >= 60) {
      await Alert.create({
        type: "Drought Risk",
        severity: "Medium",
        message: "Soil moisture level has dropped below 45%.",
        recommendedAction: "Start irrigation within 48 hours.",
        status: "active",
        time: "Just now",
        createdAt: timestamp
      });
    }

    res.status(201).json({
      message: "Sensor data added successfully",
      data: sensorDoc,
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Seed data
// @route   POST /api/seed
const seedData = async (req, res) => {
  try {
    await SensorData.deleteMany({});
    await Alert.deleteMany({});

    const sensorDocs = [
      { fieldId: "north-field", temperature: 27, humidity: 63, soilMoisture: 50, rainfall: 10, timestamp: "2026-03-31T09:00:00", day: "Mon" },
      { fieldId: "north-field", temperature: 28, humidity: 64, soilMoisture: 48, rainfall: 12, timestamp: "2026-04-01T09:00:00", day: "Tue" },
      { fieldId: "north-field", temperature: 29, humidity: 66, soilMoisture: 46, rainfall: 8, timestamp: "2026-04-02T09:00:00", day: "Wed" },
      { fieldId: "north-field", temperature: 30, humidity: 67, soilMoisture: 44, rainfall: 14, timestamp: "2026-04-03T09:00:00", day: "Thu" },
      { fieldId: "north-field", temperature: 28, humidity: 65, soilMoisture: 42, rainfall: 15, timestamp: "2026-04-03T19:15:00", day: "Fri" }
    ];

    await SensorData.insertMany(sensorDocs);
    res.json({ message: "Sample data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get predictions
// @route   GET /api/predictions
const getPredictions = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.json({
        droughtRisk: 65,
        floodRisk: 10,
        pestRisk: 15,
        overallStatus: "warning",
        recommendation: "Mock recommendation: Start irrigation.",
        prediction: "Irrigation Needed"
      });
    }
    res.json(await generatePrediction(latest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Simple predict
// @route   GET /api/predict
const predict = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.json({ prediction: "Mock Prediction: Normal" });
    }
    const result = await generatePrediction(latest);
    res.json({ prediction: result.prediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get publicly mapped farms in Sri Lanka
// @route   GET /api/farms/sri-lanka
const getSriLankaFarms = async (req, res) => {
  try {
    const result = await fetchSriLankaFarms();
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: error.message || "Farm location data is temporarily unavailable. Please try again later." 
    });
  }
};

module.exports = { getDashboard, getAlerts, getHistory, addSensorData, seedData, getPredictions, predict, getSriLankaFarms };
