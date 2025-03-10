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
        
        try {
          // Obtener servicios
          const servicesRes = await api.get('/services');
          setServices(servicesRes.data.data || []);
          
          // Filtrar servicios próximos (a partir de hoy)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = (servicesRes.data.data || [])
            .filter(service => new Date(service.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setUpcomingServices(upcoming);
        } catch (servicesErr) {
          console.error('Error al cargar servicios:', servicesErr);
        }
        
        try {
          // Obtener equipos
          const teamsRes = await api.get('/teams');
          setTeams(teamsRes.data.data || []);
        } catch (teamsErr) {
          console.error('Error al cargar equipos:', teamsErr);
        }
        
        try {
          // Obtener personas
          const peopleRes = await api.get('/people');
          setPeople(peopleRes.data.data || []);
        } catch (peopleErr) {
          console.error('Error al cargar personas:', peopleErr);
        }
        
        setError('');
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
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