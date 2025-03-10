#!/bin/bash

# Crear la estructura de carpetas para el frontend
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/contexts
mkdir -p frontend/src/services
mkdir -p frontend/src/assets/css
mkdir -p frontend/src/assets/images

# Crear el archivo de configuración
cat > frontend/src/config.js << 'EOF'
// URL de la API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
EOF

# Crear el servicio de API
cat > frontend/src/services/api.js << 'EOF'
import axios from 'axios';
import { API_URL } from '../config';

// Crear una instancia de axios con URL base
const api = axios.create({
  baseURL: API_URL
});

// Interceptor para añadir el token en cada petición
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    // Redirigir al login si hay error 401 (no autorizado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
EOF

# Crear el contexto de autenticación
cat > frontend/src/contexts/AuthContext.js << 'EOF'
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Obtener los datos del usuario actual
      getUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Función para obtener los datos del usuario actual
  const getUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener los datos del usuario');
      // Si hay un error, eliminar el token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', userData);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', res.data.token);
      
      // Obtener los datos del usuario
      await getUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al registrar el usuario');
      return { success: false, error: err.response ? err.response.data.message : 'Error al registrar el usuario' };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      // Guardar el token en localStorage
      localStorage.setItem('token', res.data.token);
      
      // Obtener los datos del usuario
      await getUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al iniciar sesión');
      return { success: false, error: err.response ? err.response.data.message : 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('token');
    
    // Limpiar el estado
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
EOF

# Crear el componente PrivateRoute
cat > frontend/src/components/PrivateRoute.js << 'EOF'
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props => {
        // Si todavía está cargando, mostrar un indicador de carga
        if (loading) {
          return <div className="loading">Cargando...</div>;
        }

        // Si no hay un usuario autenticado, redirigir al login
        if (!currentUser) {
          return <Redirect to="/" />;
        }

        // Si hay un usuario autenticado, mostrar el componente
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
EOF

# Crear el componente de Navbar
cat > frontend/src/components/Navbar.js << 'EOF'
import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Planning Center Clone</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-item">Dashboard</Link>
        <Link to="/services" className="navbar-item">Servicios</Link>
        <Link to="/teams" className="navbar-item">Equipos</Link>
        <Link to="/people" className="navbar-item">Personas</Link>
      </div>
      <div className="navbar-end">
        <span className="navbar-item user-name">
          {currentUser.name}
        </span>
        <button 
          onClick={handleLogout} 
          className="navbar-item logout-btn"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
EOF

# Crear el componente de Sidebar
cat > frontend/src/components/Sidebar.js << 'EOF'
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Sidebar.css';

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Navegación</div>
      </div>
      <ul className="sidebar-menu">
        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
          <Link to="/dashboard">
            <i className="icon">📊</i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={location.pathname.startsWith('/services') ? 'active' : ''}>
          <Link to="/services">
            <i className="icon">📅</i>
            <span>Servicios</span>
          </Link>
        </li>
        <li className={location.pathname.startsWith('/teams') ? 'active' : ''}>
          <Link to="/teams">
            <i className="icon">👥</i>
            <span>Equipos</span>
          </Link>
        </li>
        <li className={location.pathname.startsWith('/people') ? 'active' : ''}>
          <Link to="/people">
            <i className="icon">👤</i>
            <span>Personas</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
EOF

# Crear la página de login
cat > frontend/src/pages/Login.js << 'EOF'
import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, currentUser } = useContext(AuthContext);
  const history = useHistory();

  // Si ya hay un usuario autenticado, redirigir al dashboard
  if (currentUser) {
    history.push('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await login(email, password);
      
      if (result.success) {
        history.push('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Planning Center Clone</h1>
        <h2>Iniciar Sesión</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="auth-footer">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
EOF

# Crear la página de registro
cat > frontend/src/pages/Register.js << 'EOF'
import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, currentUser } = useContext(AuthContext);
  const history = useHistory();

  // Si ya hay un usuario autenticado, redirigir al dashboard
  if (currentUser) {
    history.push('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Para fines de demostración, asumimos una organización predeterminada
      // En un caso real, podrías tener un paso previo para seleccionar/crear la organización
      const userData = {
        name,
        email,
        password,
        organization: '6405d631e0e5f2d7c9c6b333' // ID ficticio, deberías usar uno real
      };
      
      const result = await register(userData);
      
      if (result.success) {
        history.push('/dashboard');
      } else {
        setError(result.error || 'Error al registrar el usuario');
      }
    } catch (err) {
      setError('Error al registrar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Planning Center Clone</h1>
        <h2>Crear Cuenta</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="auth-footer">
          ¿Ya tienes una cuenta? <Link to="/">Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
EOF

# Crear la página del Dashboard
cat > frontend/src/pages/Dashboard.js << 'EOF'
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import '../assets/css/Dashboard.css';

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener servicios
        const servicesRes = await api.get('/services');
        setServices(servicesRes.data.data);
        
        // Filtrar servicios próximos (a partir de hoy)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = servicesRes.data.data
          .filter(service => new Date(service.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setUpcomingServices(upcoming);
        
        // Obtener equipos
        const teamsRes = await api.get('/teams');
        setTeams(teamsRes.data.data);
        
        // Obtener personas
        const peopleRes = await api.get('/people');
        setPeople(peopleRes.data.data);
        
        setError('');
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {currentUser ? currentUser.name : 'Usuario'}!</p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Servicios Próximos</h2>
            <Link to="/services/create" className="btn btn-primary">
              Nuevo Servicio
            </Link>
          </div>
          
          {upcomingServices.length === 0 ? (
            <p className="no-data-message">No hay servicios próximos. ¡Crea uno nuevo!</p>
          ) : (
            <div className="services-grid">
              {upcomingServices.slice(0, 5).map(service => (
                <Link to={`/services/${service._id}`} key={service._id} className="service-card">
                  <div className="service-card-date">
                    {new Date(service.date).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <div className="service-card-time">
                    {service.startTime} - {service.endTime}
                  </div>
                  <div className={`service-card-status status-${service.status}`}>
                    {service.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {upcomingServices.length > 5 && (
            <div className="show-more">
              <Link to="/services">Ver todos los servicios</Link>
            </div>
          )}
        </div>
        
        <div className="dashboard-row">
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Equipos ({teams.length})</h3>
                <Link to="/teams/create" className="btn btn-sm">Nuevo</Link>
              </div>
              <div className="card-content">
                {teams.length === 0 ? (
                  <p className="no-data-message">No hay equipos. ¡Crea uno nuevo!</p>
                ) : (
                  <ul className="item-list">
                    {teams.slice(0, 3).map(team => (
                      <li key={team._id}>
                        <Link to={`/teams/${team._id}`}>
                          {team.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/teams" className="btn btn-secondary btn-block">
                  Gestionar Equipos
                </Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Personas ({people.length})</h3>
                <Link to="/people/create" className="btn btn-sm">Nueva</Link>
              </div>
              <div className="card-content">
                {people.length === 0 ? (
                  <p className="no-data-message">No hay personas. ¡Añade una nueva!</p>
                ) : (
                  <ul className="item-list">
                    {people.slice(0, 3).map(person => (
                      <li key={person._id}>
                        <Link to={`/people/${person._id}`}>
                          {person.firstName} {person.lastName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/people" className="btn btn-secondary btn-block">
                  Gestionar Personas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
EOF

# Crear estilos CSS básicos
cat > frontend/src/assets/css/App.css << 'EOF'
/* Estilos globales */
:root {
  --primary-color: #3f51b5;
  --secondary-color: #f50057;
  --background-color: #f5f5f5;
  --text-color: #333;
  --light-text: #666;
  --border-color: #ddd;
  --card-bg: #fff;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background-color);
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button, .btn {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

button:hover, .btn:hover {
  opacity: 0.9;
  text-decoration: none;
}

button:disabled, .btn:disabled {
  background-color: var(--light-text);
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
}

.btn-secondary {
  background-color: var(--light-text);
}

.btn-success {
  background-color: var(--success-color);
}

.btn-warning {
  background-color: var(--warning-color);
}

.btn-danger {
  background-color: var(--error-color);
}

.btn-block {
  display: block;
  width: 100%;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: var(--primary-color);
}

.alert {
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.alert-danger {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--error-color);
  color: var(--error-color);
}

.alert-success {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--success-color);
  color: var(--success-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Estructura de la aplicación */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-grow: 1;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  margin-left: 250px;
  margin-top: 60px;
}
EOF

cat > frontend/src/assets/css/Auth.css << 'EOF'
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

.auth-form-container {
  width: 400px;
  padding: 30px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-form-container h1 {
  text-align: center;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.auth-form-container h2 {
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-color);
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
}
EOF

cat > frontend/src/assets/css/Navbar.css << 'EOF'
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
}

.navbar-brand {
  font-size: 20px;
  font-weight: bold;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  margin-left: 40px;
}

.navbar-item {
  margin-right: 20px;
  color: white;
  text-decoration: none;
}

.navbar-item:hover {
  opacity: 0.9;
  text-decoration: none;
}

.navbar-end {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.user-name {
  margin-right: 16px;
}

.logout-btn {
  background-color: transparent;
  border: 1px solid white;
}
EOF

cat > frontend/src/assets/css/Sidebar.css << 'EOF'
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  z-index: 900;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-title {
  font-weight: bold;
  color: var(--light-text);
  text-transform: uppercase;
  font-size: 14px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
}

.sidebar-menu li {
  margin: 0;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
}

.sidebar-menu li a:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-menu li.active a {
  background-color: rgba(63, 81, 181, 0.1);
  color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
}

.sidebar-menu li .icon {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}
EOF

cat > frontend/src/assets/css/Dashboard.css << 'EOF'
.dashboard {
  padding: 20px 10px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.dashboard-section {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  color: var(--text-color);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.service-card {
  display: block;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 16px;
  color: var(--text-color);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.service-card-date {
  font-size: 14px;
  color: var(--light-text);
  margin-bottom: 8px;
}

.service-card-title {
  font-size: 18px;
  margin-bottom: 8px;
}

.service-card-time {
  font-size: 14px;
  color: var(--light-text);
  margin-bottom: 10px;
}

.service-card-status {
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-draft {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.status-published {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-completed {
  background-color: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.status-cancelled {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.show-more {
  margin-top: 20px;
  text-align: center;
}

.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  font-size: 18px;
  color: var(--text-color);
}

.card-content {
  padding: 16px;
}

.item-list {
  list-style: none;
  margin-bottom: 16px;
}

.item-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.item-list li:last-child {
  border-bottom: none;
}

.no-data-message {
  color: var(--light-text);
  text-align: center;
  padding: 20px 0;
}
EOF

# Actualizar App.js
cat > frontend/src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Componentes
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Estilos
import './assets/css/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Switch>
                <Route exact path="/" component={Login} />
                <Route path="/register" component={Register} />
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <Redirect to="/" />
              </Switch>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOF

# Actualizar index.js
cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
EOF

echo "Estructura del frontend configurada. Ahora reconstruye el contenedor con: docker-compose up -d --build frontend"
