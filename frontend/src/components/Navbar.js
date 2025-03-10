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
        <Link to="/dashboard">Mi Servicio</Link>
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