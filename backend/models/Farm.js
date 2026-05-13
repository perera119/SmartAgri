const mongoose = require('mongoose');

const farmSchema = mongoose.Schema(
  {
    name:      { type: String, required: true },
    district:  { type: String, required: true },
    cropType:  { type: String, required: true },
    lat:       { type: Number, required: true },
    lon:       { type: Number, required: true },
    areaHa:    { type: Number, default: 0 },
    ownerName: { type: String, default: '' },
    notes:     { type: String, default: '' },
    addedBy:   { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farm', farmSchema);
