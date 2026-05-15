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

    return {
      droughtRisk: aiData.probabilities?.drought || 15,
      floodRisk: aiData.probabilities?.flood || 15,
      pestRisk: aiData.probabilities?.pest || 15,
      probabilities: aiData.probabilities,
      forecasts: aiData.forecasts,
      predictionWindow: aiData.predictionWindow,
      overallStatus: aiData.probabilities?.flood > 70 || aiData.probabilities?.drought > 70 ? "critical" : "normal",
      recommendation: aiData.recommendation,
      prediction: aiData.recommendation.split('.')[0],
      isRealAI: true,
      timestamp: aiData.timestamp
    };

  } catch (error) {
    console.warn("⚠️ AI Service offline, using fallback prediction logic.");
    
    // 2. Fallback logic if Python is down
    const droughtProb = sensorData.soilMoisture < 45 ? 65 : 20;
    const floodProb = sensorData.rainfall > 20 ? 35 : 10;
    const pestProb = sensorData.humidity > 70 ? 25 : 15;

    return {
      droughtRisk: droughtProb,
      floodRisk: floodProb,
      pestRisk: pestProb,
      probabilities: { drought: droughtProb, flood: floodProb, pest: pestProb },
      forecasts: [
        { type: "Drought", prob: droughtProb, intensity: droughtProb > 60 ? "High" : "Low" },
        { type: "Flood", prob: floodProb, intensity: floodProb > 60 ? "High" : "Low" },
        { type: "Pest Outbreak", prob: pestProb, intensity: pestProb > 60 ? "High" : "Low" }
      ],
      predictionWindow: "48h",
      overallStatus: droughtProb >= 60 ? "warning" : "normal",
      recommendation: droughtProb >= 60 ? "Start irrigation and monitor soil daily." : "Conditions are stable.",
      prediction: sensorData.soilMoisture < 40 ? "Irrigation Needed" : "Normal Conditions",
      isRealAI: false
    };
  }
};

module.exports = { generatePrediction };
