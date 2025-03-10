// backend/models/Person.js
const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Por favor ingresa un nombre']
  },
  lastName: {
    type: String,
    required: [true, 'Por favor ingresa un apellido']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa un email'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  birthDate: {
    type: Date
  },
  notes: {
    type: String
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  positions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  }],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

// Método virtual para obtener el nombre completo
PersonSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Person', PersonSchema);
