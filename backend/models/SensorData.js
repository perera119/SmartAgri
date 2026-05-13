const mongoose = require('mongoose');

const sensorDataSchema = mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    soilMoisture: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    day: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

const SensorData = mongoose.model('SensorData', sensorDataSchema);
module.exports = SensorData;
