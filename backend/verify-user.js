/**
 * Script para verificar los usuarios existentes y sus datos
 */

const mongoose = require('mongoose');

// Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/mi-servicio';
console.log('Conectando a:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Función para verificar usuarios
const verifyUsers = async () => {
  try {
    // Ver todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones en la base de datos:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Buscar usuarios
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('No se encontraron usuarios en la base de datos');
    } else {
      console.log(`Se encontraron ${users.length} usuarios:`);
      users.forEach(user => {
        console.log(`- ID: ${user._id}`);
        console.log(`  Nombre: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Rol: ${user.role}`);
        console.log(`  Organización: ${user.organization}`);
        console.log(`  Contraseña: ${user.password ? 'Presente' : 'No disponible'}`);
        console.log('---');
      });
    }
    
    // Cerrar conexión a MongoDB
    mongoose.disconnect();
  } catch (err) {
    console.error('Error al verificar usuarios:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Ejecutar función
verifyUsers();
