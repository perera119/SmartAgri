const generatePrediction = (reading) => {
  const soilMoisture = reading.soilMoisture || 0;
  const rainfall = reading.rainfall || 0;
  const humidity = reading.humidity || 0;
  const temperature = reading.temperature || 0;

  const droughtRisk = soilMoisture < 45 ? 65 : 20;
  const floodRisk = rainfall > 20 ? 35 : 10;
  const pestRisk = humidity > 70 ? 25 : 15;

  const overallStatus = droughtRisk >= 60 ? "warning" : "normal";

  let aiPrediction = "Normal Conditions";
  if (soilMoisture < 40) {
    aiPrediction = "Irrigation Needed";
  } else if (temperature > 32) {
    aiPrediction = "Heat Stress Risk";
  }

  const recommendation = droughtRisk >= 60 
    ? "Start irrigation and monitor soil daily." 
    : "Conditions are stable.";

  return {
    droughtRisk,
    floodRisk,
    pestRisk,
    overallStatus,
    recommendation,
    prediction: aiPrediction,
  };
};

module.exports = { generatePrediction };
