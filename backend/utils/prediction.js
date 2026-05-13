const axios = require('axios');

/**
 * Calls the Python AI Microservice to get risk predictions.
 * Includes a fallback to local logic if the AI service is offline.
 */
const generatePrediction = async (reading) => {
  const sensorData = {
    temperature: reading.temperature || 0,
    humidity: reading.humidity || 0,
    soilMoisture: reading.soilMoisture || 0,
    rainfall: reading.rainfall || 0
  };

  try {
    // 1. Call the Python AI Service (running on port 8000)
    const response = await axios.post('http://localhost:8000/api/ai/predict', sensorData, {
      timeout: 2000 // 2 second timeout
    });

    const aiData = response.data;

    // Convert AI "High/Medium/Low" strings to numbers for the dashboard charts
    const riskMap = { "High": 85, "Medium": 50, "Low": 15 };

    return {
      droughtRisk: riskMap[aiData.droughtRisk] || 15,
      floodRisk: riskMap[aiData.floodRisk] || 15,
      pestRisk: riskMap[aiData.pestRisk] || 15,
      overallStatus: aiData.droughtRisk === "High" || aiData.floodRisk === "High" ? "warning" : "normal",
      recommendation: aiData.recommendation,
      prediction: aiData.recommendation.split('.')[0], // Short version for display
      isRealAI: true,
      timestamp: aiData.timestamp
    };

  } catch (error) {
    console.warn("⚠️ AI Service offline, using fallback prediction logic.");
    
    // 2. Fallback logic (Old hardcoded rules) if Python is down
    const droughtRisk = sensorData.soilMoisture < 45 ? 65 : 20;
    const floodRisk = sensorData.rainfall > 20 ? 35 : 10;
    const pestRisk = sensorData.humidity > 70 ? 25 : 15;

    return {
      droughtRisk,
      floodRisk,
      pestRisk,
      overallStatus: droughtRisk >= 60 ? "warning" : "normal",
      recommendation: droughtRisk >= 60 ? "Start irrigation and monitor soil daily." : "Conditions are stable.",
      prediction: sensorData.soilMoisture < 40 ? "Irrigation Needed" : "Normal Conditions",
      isRealAI: false
    };
  }
};

module.exports = { generatePrediction };
