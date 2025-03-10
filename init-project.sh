#!/bin/bash

# Colorear la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes de estado
print_status() {
  echo -e "${GREEN}[✓] $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
  echo -e "${RED}[✗] $1${NC}"
}

# Crear la estructura de directorios
echo "Creando estructura de directorios..."
mkdir -p backend/models backend/routes backend/middleware frontend/src nginx

# Crear el package.json para el backend
echo "Creando package.json para el backend..."
cat > backend/package.json << 'EOF'
{
  "name": "planning-center-clone-backend",
  "version": "1.0.0",
  "description": "Backend para clon de Planning Center",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.17.3",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.2.8",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
EOF
print_status "package.json del backend creado"

# Crear un package.json básico para el frontend
echo "Creando package.json para el frontend..."
cat > frontend/package.json << 'EOF'
{
  "name": "planning-center-clone-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@material-ui/core": "^4.12.3",
    "@material-ui/icons": "^4.11.2",
    "axios": "^0.26.1",
    "formik": "^2.2.9",
    "moment": "^2.29.1",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-icons": "^4.3.1",
    "react-router-dom": "^5.3.0",
    "react-scripts": "5.0.0",
    "yup": "^0.32.11"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF
print_status "package.json del frontend creado"

# Crear un archivo index.js básico para el frontend
echo "Creando archivo principal del frontend..."
mkdir -p frontend/src
cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
EOF
print_status "Archivo index.js del frontend creado"

# Crear un server.js básico para el backend
echo "Creando archivo principal del backend..."
cat > backend/server.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para verificar servidor
app.get('/', (req, res) => {
  res.send('API del clon de Planning Center está funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Conexión a MongoDB (comentada por ahora)
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('Conexión a MongoDB establecida'))
//   .catch(err => {
//     console.error('Error al conectar a MongoDB:', err);
//     process.exit(1);
//   });
EOF
print_status "Archivo server.js del backend creado"

# Crear archivo .env
echo "Creando archivo .env..."
cat > .env << 'EOF'
# Variables de entorno para Docker

# Backend
PORT=5000
MONGO_URI=mongodb://mongodb:27017/planning-center-clone
JWT_SECRET=planning_center_clone_secret_jwt
JWT_EXPIRE=30d

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
EOF
print_status "Archivo .env creado"

# Configurar permisos de ejecución
chmod +x init-project.sh

print_status "¡Inicialización completada! Ahora puedes ejecutar 'docker-compose up -d'"
