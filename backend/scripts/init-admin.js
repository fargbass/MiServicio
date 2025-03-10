/**
 * Script para inicializar la base de datos con una organización y un usuario administrador
 * 
 * Uso: node scripts/init-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar modelos
const Organization = require('../models/Organization');
const User = require('../models/User');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión a MongoDB establecida para inicialización'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Función para crear una organización por defecto
const createDefaultOrganization = async () => {
  try {
    // Verificar si ya existe una organización
    const existingOrg = await Organization.findOne({ name: 'Mi Organización' });
    
    if (existingOrg) {
      console.log('La organización por defecto ya existe:', existingOrg._id);
      return existingOrg;
    }
    
    // Crear una nueva organización
    const newOrg = await Organization.create({
      name: 'Mi Organización',
      address: {
        city: 'Ciudad',
        country: 'País'
      },
      email: 'organizacion@ejemplo.com'
    });
    
    console.log('Organización por defecto creada:', newOrg._id);
    return newOrg;
  } catch (err) {
    console.error('Error al crear la organización por defecto:', err);
    throw err;
  }
};

// Función para crear un usuario administrador por defecto
const createAdminUser = async (organizationId) => {
  try {
    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('El usuario administrador ya existe:', existingAdmin._id);
      return existingAdmin;
    }
    
    // Crear un nuevo usuario administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    const newAdmin = await User.create({
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      organization: organizationId
    });
    
    console.log('Usuario administrador creado:', newAdmin._id);
    console.log('Credenciales:');
    console.log('- Email: admin@admin.com');
    console.log('- Contraseña: admin');
    
    return newAdmin;
  } catch (err) {
    console.error('Error al crear el usuario administrador:', err);
    throw err;
  }
};

// Función principal
const init = async () => {
  try {
    console.log('Iniciando script de inicialización...');
    
    // Crear organización por defecto
    const organization = await createDefaultOrganization();
    
    // Crear usuario administrador
    await createAdminUser(organization._id);
    
    console.log('Inicialización completada con éxito');
    
    // Cerrar la conexión a MongoDB
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error durante la inicialización:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Ejecutar función principal
init();
