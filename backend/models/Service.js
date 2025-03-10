// backend/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor ingresa un título para el servicio']
  },
  date: {
    type: Date,
    required: [true, 'Por favor ingresa una fecha']
  },
  startTime: {
    type: String,
    required: [true, 'Por favor ingresa una hora de inicio']
  },
  endTime: {
    type: String,
    required: [true, 'Por favor ingresa una hora de finalización']
  },
  location: {
    type: String,
    required: false
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'cancelled'],
    default: 'draft'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceItem'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
