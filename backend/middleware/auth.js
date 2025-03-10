// middleware/auth.js - Middleware de autenticación mejorado
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - requiere autenticación
exports.protect = async (req, res, next) => {
  let token;

  // Obtener token del header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Alternativamente, obtener token de cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Verificar si el token existe
  if (!token) {
    console.log('Acceso denegado: No se proporcionó token');
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado para acceder a esta ruta' 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secreto_super_seguro_para_docker'
    );
    console.log('Token verificado para usuario ID:', decoded.id);

    // Añadir usuario al req
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('Usuario no encontrado en la base de datos');
      return res.status(401).json({ 
        success: false, 
        message: 'El usuario ya no existe' 
      });
    }

    next();
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    
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