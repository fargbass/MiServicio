// models/User.js - Modelo actualizado para aceptar "admin" como contraseña
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa un email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    // Eliminamos la validación minlength para evitar problemas
    select: false  // No incluir password en las consultas
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña usando bcrypt antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Verificar si es la contraseña especial "admin"
    if (this.password === 'admin') {
      // Usar un hash pre-generado para la contraseña "admin"
      this.password = '$2a$10$g5sCFYeP0YxnMtJF5K0r8OM1gK18zkXs7zHXZJy/Qcg0CrVxRsYk.';
      return next();
    }
    
    // Para otras contraseñas, validar longitud mínima
    if (this.password.length < 6) {
      return next(new Error('La contraseña debe tener al menos 6 caracteres'));
    }
    
    // Generar un salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash de la contraseña con el salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error al encriptar contraseña:', err);
    next(err);
  }
});

// Firmar JWT y retornar
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET || 'secreto_super_seguro_para_docker',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Método mejorado para validar contraseña
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    console.error('Error: Password no disponible para comparación');
    return false;
  }
  
  try {
    // Caso especial para "admin"
    if (enteredPassword === 'admin' && this.email === 'admin@admin.com') {
      // Comparar con el hash fijo para "admin"
      const adminHash = '$2a$10$g5sCFYeP0YxnMtJF5K0r8OM1gK18zkXs7zHXZJy/Qcg0CrVxRsYk.';
      const isMatch = await bcrypt.compare(enteredPassword, this.password) || 
                        await bcrypt.compare(enteredPassword, adminHash);
      
      console.log('Comparación especial para admin');
      console.log('- Resultado de la comparación:', isMatch);
      return isMatch;
    }
    
    // Usar bcrypt para comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Comparación de contraseñas para:', this.email);
    console.log('- Contraseña almacenada está disponible:', !!this.password);
    console.log('- Resultado de la comparación:', isMatch);
    return isMatch;
  } catch (err) {
    console.error('Error en matchPassword:', err);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);