# Mi Servicio: Plataforma de Gestión de Servicios

Mi Servicio es una aplicación web para la gestión integral de servicios, equipos y voluntarios, inspirada en Planning Center. Esta aplicación permite a organizaciones coordinar eventos, gestionar equipos y programar voluntarios de manera eficiente.

## Características

- **Gestión de Servicios**: Crear, editar y visualizar servicios y eventos
- **Gestión de Equipos**: Organizar grupos con roles específicos
- **Gestión de Personas**: Administrar voluntarios y asignarlos a equipos
- **Programación**: Asignar personas a posiciones específicas en cada servicio
- **Autenticación**: Sistema completo de registro e inicio de sesión

## Tecnologías

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT para autenticación

### Frontend
- React
- React Router
- Axios
- CSS personalizado

### Infraestructura
- Docker
- Docker Compose

## Instalación con Docker

### Requisitos previos
- Docker
- Docker Compose

### Pasos para instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/mi-servicio.git
cd mi-servicio
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. Iniciar contenedores:
```bash
docker-compose up -d
```

4. Inicializar administrador (opcional):
```bash
docker-compose exec backend node scripts/init-admin.js
```

5. Acceder a la aplicación:
- Frontend: http://localhost:3000
- API Backend: http://localhost:8000

## Credenciales por defecto

- **Email**: admin@admin.com
- **Contraseña**: admin

## Estructura del proyecto

```
mi-servicio/
├── backend/                # Servidor Node.js/Express
│   ├── models/             # Modelos Mongoose
│   ├── routes/             # Rutas API
│   ├── middleware/         # Middleware personalizado
│   ├── scripts/            # Scripts de utilidad
│   └── server.js           # Punto de entrada del servidor
├── frontend/               # Aplicación React
│   ├── public/             # Archivos estáticos
│   └── src/                # Código fuente React
│       ├── assets/         # Estilos y recursos
│       ├── components/     # Componentes reutilizables
│       ├── contexts/       # Contextos React
│       ├── pages/          # Páginas/Vistas
│       └── services/       # Servicios de API
├── docker-compose.yml      # Configuración Docker Compose
└── .env.example            # Ejemplo de variables de entorno
```

## Desarrollo

Para desarrollar localmente:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

## Licencia

[MIT](LICENSE)

## Reconocimientos

Este proyecto es un clon de Planning Center, desarrollado con fines educativos y como base para proyectos personalizados.
