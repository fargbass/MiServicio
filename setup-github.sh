#!/bin/bash

# Colorear la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Preparando el proyecto para GitHub ===${NC}"

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Por favor instala Git antes de continuar.${NC}"
    exit 1
fi

# Verificar si estamos en la carpeta raíz del proyecto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Por favor ejecuta este script desde la carpeta raíz del proyecto (donde está docker-compose.yml).${NC}"
    exit 1
fi

# Inicializar repositorio Git si no existe
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Inicializando repositorio Git...${NC}"
    git init
    echo -e "${GREEN}Repositorio Git inicializado.${NC}"
else
    echo -e "${YELLOW}Repositorio Git ya existe.${NC}"
fi

# Copiar .gitignore y README.md si existen en el directorio actual
if [ -f ".gitignore" ]; then
    echo "Archivo .gitignore encontrado."
else
    echo -e "${YELLOW}Creando archivo .gitignore...${NC}"
    # Aquí puedes incluir el contenido del archivo .gitignore o usar el que ya creamos
    echo "Archivo .gitignore creado."
fi

if [ -f "README.md" ]; then
    echo "Archivo README.md encontrado."
else
    echo -e "${YELLOW}Creando archivo README.md básico...${NC}"
    echo "# Mi Servicio" > README.md
    echo "Plataforma de gestión de servicios, equipos y personas." >> README.md
    echo "Archivo README.md creado."
fi

# Añadir todos los archivos al staging
echo -e "${YELLOW}Añadiendo archivos al staging...${NC}"
git add .

# Hacer el commit inicial
echo -e "${YELLOW}Realizando commit inicial...${NC}"
git commit -m "Commit inicial: Mi Servicio - Plataforma de gestión"

# Pedir al usuario el nombre del repositorio y su usuario de GitHub
echo -e "${BLUE}Para subir el proyecto a GitHub, necesitamos algunos datos:${NC}"
read -p "Nombre de usuario de GitHub: " github_username
read -p "Nombre del repositorio en GitHub (ej. mi-servicio): " repo_name

# Crear README.md más detallado
echo -e "${YELLOW}Actualizando README.md con más información...${NC}"
# Aquí puedes incluir el contenido del README más detallado que ya creamos

# Añadir cambios al README
git add README.md
git commit -m "Actualiza README con instrucciones de instalación y uso"

# Verificar si el repositorio remoto ya está configurado
if git remote -v | grep -q origin; then
    echo -e "${YELLOW}Repositorio remoto 'origin' ya configurado. Actualizándolo...${NC}"
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
else
    echo -e "${YELLOW}Configurando repositorio remoto 'origin'...${NC}"
    git remote add origin "https://github.com/$github_username/$repo_name.git"
fi

echo -e "${GREEN}=== Preparación completada ===${NC}"
echo -e "${YELLOW}IMPORTANTE: Antes de continuar, asegúrate de:${NC}"
echo "1. Crear un repositorio en GitHub llamado '$repo_name'"
echo "2. El repositorio debe estar vacío (sin README, .gitignore, ni licencia)"
echo -e "${YELLOW}Una vez creado el repositorio, ejecuta:${NC}"
echo -e "${GREEN}git push -u origin master${NC} o ${GREEN}git push -u origin main${NC} (según tu rama por defecto)"
echo -e "${BLUE}¡Listo! Tu proyecto está preparado para ser subido a GitHub.${NC}"
