import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/MobileMenu.css';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="mobile-menu-container">
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Menú principal"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Mi Servicio</h3>
          <button className="close-button" onClick={closeMenu}>×</button>
        </div>

        <div className="mobile-menu-content">
          <ul className="mobile-menu-list">
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard" onClick={closeMenu}>
                <span className="menu-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li className={location.pathname.startsWith('/services') ? 'active' : ''}>
              <Link to="/services" onClick={closeMenu}>
                <span className="menu-icon">📅</span>
                Servicios
              </Link>
            </li>
            <li className={location.pathname.startsWith('/teams') ? 'active' : ''}>
              <Link to="/teams" onClick={closeMenu}>
                <span className="menu-icon">👥</span>
                Equipos
              </Link>
            </li>
            <li className={location.pathname.startsWith('/people') ? 'active' : ''}>
              <Link to="/people" onClick={closeMenu}>
                <span className="menu-icon">👤</span>
                Personas
              </Link>
            </li>
          </ul>
        </div>

        <div className="mobile-menu-footer">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{currentUser.name}</span>
          </div>
        </div>
      </div>
      
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
    </div>
  );
};

export default MobileMenu;