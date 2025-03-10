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
