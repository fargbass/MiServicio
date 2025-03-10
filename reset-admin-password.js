/**
 * Script para restablecer la contraseña del administrador
 * Ejecutar con: docker-compose exec backend node reset-admin-password.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Definir el esquema de usuario directamente en el script para evitar problemas de importación
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    select: false
  },
  role: String,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Modelo de usuario
const User = mongoose.model('User', userSchema);

// Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/mi-servicio';
console.log('Conectando a:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Función para restablecer la contraseña
const resetPassword = async () => {
  try {
    // Buscar el usuario administrador
    const adminEmail = 'admin@admin.com';
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('No se encontró el usuario administrador. Creando uno nuevo...');
      
      // Buscar o crear organización por defecto
      const Organization = mongoose.model('Organization', new mongoose.Schema({
        name: String,
        email: String,
        createdAt: Date
      }));
      
      let organization = await Organization.findOne({});
      
      if (!organization) {
        organization = await Organization.create({
          name: 'Mi Organización',
          email: 'organizacion@ejemplo.com',
          createdAt: new Date()
        });
        console.log('Organización creada:', organization._id);
      }
      
      // Generar hash de contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Crear usuario admin
      const newAdmin = await User.create({
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        organization: organization._id,
        createdAt: new Date()
      });
      
      console.log('Usuario administrador creado:', newAdmin._id);
    } else {
      console.log('Usuario administrador encontrado:', admin._id);
      
      // Generar hash de contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Actualizar contraseña
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('Contraseña restablecida correctamente');
    }
    
    console.log('Credenciales de acceso:');
    console.log('- Email: admin@admin.com');
    console.log('- Contraseña: admin');
    
    // Cerrar conexión a MongoDB
    mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
  } catch (err) {
    console.error('Error al restablecer la contraseña:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Ejecutar función
resetPassword();
