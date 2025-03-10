/**
 * Script mejorado para verificar la conexión a MongoDB y los usuarios
 */

const mongoose = require('mongoose');

async function main() {
  // Obtener la URI de MongoDB
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/planning-center-clone';
  console.log('Intentando conectar a MongoDB:', MONGO_URI);
  
  try {
    // Esperar a que la conexión se establezca
    await mongoose.connect(MONGO_URI);
    console.log('Conexión a MongoDB establecida exitosamente');
    
    // Verificar que mongoose.connection.db está disponible
    if (!mongoose.connection.db) {
      throw new Error('mongoose.connection.db no está disponible');
    }
    
    // Obtener información de la base de datos
    console.log('Nombre de la base de datos:', mongoose.connection.db.databaseName);
    
    // Listar colecciones
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nColecciones en la base de datos:');
      
      if (collections.length === 0) {
        console.log('No hay colecciones en la base de datos');
      } else {
        collections.forEach(col => console.log(`- ${col.name}`));
      }
    } catch (err) {
      console.error('Error al listar colecciones:', err.message);
    }
    
    // Verificar usuarios - método alternativo
    try {
      // Intentar acceder a la colección 'users' directamente
      if (collections && collections.some(col => col.name === 'users')) {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        
        console.log('\nUsuarios encontrados:', users.length);
        
        if (users.length > 0) {
          users.forEach(user => {
            console.log(`- ID: ${user._id}`);
            console.log(`  Nombre: ${user.name || 'N/A'}`);
            console.log(`  Email: ${user.email || 'N/A'}`);
            console.log(`  Rol: ${user.role || 'N/A'}`);
            console.log(`  Contraseña: ${user.password ? 'Presente' : 'No disponible'}`);
            console.log('---');
          });
        }
      } else {
        console.log('\nLa colección "users" no existe aún');
      }
    } catch (err) {
      console.error('Error al verificar usuarios:', err.message);
    }
    
    // Crear un usuario administrador si no existe
    console.log('\nIntentando crear un usuario administrador para pruebas...');
    
    try {
      // Definir esquemas mínimos para User y Organization
      const orgSchema = new mongoose.Schema({
        name: String,
        email: String
      });
      
      const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        organization: mongoose.Schema.Types.ObjectId
      });
      
      // Crear modelos temporales
      const Organization = mongoose.models.Organization || mongoose.model('Organization', orgSchema);
      const User = mongoose.models.User || mongoose.model('User', userSchema);
      
      // Buscar o crear organización
      let org = await Organization.findOne({ name: 'Mi Organización' });
      
      if (!org) {
        org = await Organization.create({ 
          name: 'Mi Organización',
          email: 'organizacion@ejemplo.com' 
        });
        console.log('Nueva organización creada:', org._id);
      } else {
        console.log('Organización existente encontrada:', org._id);
      }
      
      // Buscar usuario admin
      let admin = await User.findOne({ email: 'admin@admin.com' });
      
      if (!admin) {
        // Crear usuario admin
        admin = await User.create({
          name: 'Administrador',
          email: 'admin@admin.com',
          // Contraseña 'admin' codificada directamente para evitar problemas con bcrypt
          password: '$2a$10$eCvG3.THn8U1qYaIDQMrou/4OM60l5xpw297iD.d0FFOsMR6WFVTW',
          role: 'admin',
          organization: org._id
        });
        console.log('Nuevo usuario administrador creado:', admin._id);
      } else {
        console.log('Usuario administrador existente encontrado:', admin._id);
        
        // Actualizar contraseña
        admin.password = '$2a$10$eCvG3.THn8U1qYaIDQMrou/4OM60l5xpw297iD.d0FFOsMR6WFVTW';
        await admin.save();
        console.log('Contraseña actualizada');
      }
      
      console.log('\nCredenciales de prueba:');
      console.log('- Email: admin@admin.com');
      console.log('- Contraseña: admin');
    } catch (err) {
      console.error('Error al crear usuario administrador:', err);
    }
  } catch (err) {
    console.error('Error de conexión a MongoDB:', err.message);
    console.log('\nVerificando si el servicio de MongoDB está disponible...');
    
    // Intentar diagnosticar problemas de conectividad
    try {
      const { exec } = require('child_process');
      
      exec('ping -c 1 mongodb', (error, stdout, stderr) => {
        if (error) {
          console.error('No se pudo conectar al servicio de MongoDB:', error.message);
          console.log('Sugerencia: Verifica que el servicio de MongoDB esté ejecutándose');
        } else {
          console.log('El host mongodb es accesible por ping:', stdout);
          console.log('Sugerencia: Verifica las credenciales y el nombre de la base de datos');
        }
      });
    } catch (pingErr) {
      console.error('No se pudo realizar diagnóstico de red:', pingErr.message);
    }
  } finally {
    // Esperar un momento antes de cerrar la conexión (para terminar operaciones pendientes)
    setTimeout(() => {
      // Cerrar la conexión
      try {
        mongoose.disconnect();
        console.log('\nConexión a MongoDB cerrada');
      } catch (err) {
        console.error('Error al cerrar la conexión:', err.message);
      }
      
      console.log('\n=== FIN DEL SCRIPT ===');
    }, 1000);
  }
}

// Ejecutar el script
main();
