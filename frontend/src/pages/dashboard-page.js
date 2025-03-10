import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../config';

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/services`);
        
        // Obtener todos los servicios
        setServices(res.data.data);
        
        // Filtrar los servicios próximos (a partir de hoy)
        const today = moment().startOf('day');
        const upcoming = res.data.data.filter(service => 
          moment(service.date).isSameOrAfter(today)
        ).sort((a, b) => moment(a.date).diff(moment(b.date)));
        
        setUpcomingServices(upcoming);
        setError('');
      } catch (err) {
        setError('Error al cargar los servicios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {currentUser ? currentUser.name : 'Usuario'}!</p>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Servicios Próximos</h2>
              <Link to="/services/create" className="btn btn-primary">
                Nuevo Servicio
              </Link>
            </div>
            
            {upcomingServices.length === 0 ? (
              <p>No hay servicios próximos. ¡Crea uno nuevo!</p>
            ) : (
              <div className="service-list">
                {upcomingServices.slice(0, 5).map(service => (
                  <Link to={`/services/${service._id}`} key={service._id} className="service-card">
                    <div className="service-date">
                      {moment(service.date).format('DD MMM YYYY')}
                    </div>
                    <div className="service-title">{service.title}</div>
                    <div className="service-time">
                      {service.startTime} - {service.endTime}
                    </div>
                    <div className={`service-status status-${service.status}`}>
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
                <h3>Equipos</h3>
                <div className="card-content">
                  <Link to="/teams" className="btn btn-secondary">
                    Gestionar Equipos
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="dashboard-column">
              <div className="dashboard-card">
                <h3>Personas</h3>
                <div className="card-content">
                  <Link to="/people" className="btn btn-secondary">
                    Gestionar Personas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
