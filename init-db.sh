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

echo "Inicializando la base de datos con el usuario admin..."

# Ejecutar el script de inicialización dentro del contenedor del backend
docker-compose exec backend node scripts/init-admin.js

if [ $? -eq 0 ]; then
  print_status "Base de datos inicializada correctamente"
  print_status "Usuario administrador creado:"
  print_status "- Email: admin@admin.com"
  print_status "- Contraseña: admin"
else
  print_error "Error al inicializar la base de datos"
fi
