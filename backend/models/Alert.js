const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    region: { type: String, default: 'National' },
    isOfficial: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    time: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true }
);

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
