import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que estás buscando no existe o ha sido movida.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
