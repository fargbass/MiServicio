// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtener token del header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Obtener token de cookie
    token = req.cookies.token;
  }

  // Verificar si el token existe
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado para acceder a esta ruta' 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir usuario al req
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado para acceder a esta ruta' 
    });
  }
};

// Autorizar por roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Rol ${req.user.role} no autorizado para acceder a esta ruta` 
      });
    }
    next();
  };
};
