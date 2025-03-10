// backend/models/ServiceItem.js
const mongoose = require('mongoose');

const ServiceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor ingresa un título para el elemento']
  },
  type: {
    type: String,
    enum: ['song', 'prayer', 'reading', 'sermon', 'announcement', 'offering', 'other'],
    default: 'other'
  },
  description: {
    type: String
  },
  duration: {
    type: Number, // en minutos
    default: 5
  },
  notes: {
    type: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  positions: [{
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position'
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending'
    }
  }],
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
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

module.exports = mongoose.model('ServiceItem', ServiceItemSchema);
