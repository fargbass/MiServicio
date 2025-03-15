// Asegúrate de que el modelo Position sea importado y registrado en tu aplicación
// Esto normalmente se hace en el server.js o en el archivo donde se inicializa tu aplicación

// Ejemplo de cómo deberías tener configuradas las rutas en server.js:

// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Importar modelos (asegúrate de que Position.js esté incluido)
require('./models/Position'); // Añade esta línea si no existe

// Rutas
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const teamRoutes = require('./routes/team.routes');
const personRoutes = require('./routes/person.routes');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/people', personRoutes);

// Ruta para verificar servidor
app.get('/', (req, res) => {
  res.send('API del clon de Planning Center está funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});