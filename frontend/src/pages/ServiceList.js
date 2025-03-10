import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/ServiceList.css';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services');
        setServices(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('Error al cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await api.delete(`/services/${id}`);
        // Actualizar la lista de servicios
        setServices(services.filter(service => service._id !== id));
      } catch (err) {
        console.error('Error al eliminar el servicio:', err);
        setError('Error al eliminar el servicio');
      }
    }
  };

  // Filtrar servicios según el filtro seleccionado
  const getFilteredServices = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return services.filter(service => new Date(service.date) >= today);
      case 'past':
        return services.filter(service => new Date(service.date) < today);
      default:
        return services;
    }
  };

  const filteredServices = getFilteredServices();

  // Agrupar servicios por mes/año
  const groupedServices = filteredServices.reduce((groups, service) => {
    const date = new Date(service.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = {
        monthName: date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
        services: []
      };
    }
    
    groups[monthYear].services.push(service);
    return groups;
  }, {});

  // Convertir el objeto groupedServices en un array ordenado por fecha
  const groupedServicesArray = Object.keys(groupedServices)
    .sort((a, b) => {
      if (filter === 'past') {
        return b.localeCompare(a); // Ordenar descendentemente para servicios pasados
      }
      return a.localeCompare(b); // Ordenar ascendentemente para servicios próximos
    })
    .map(monthYear => ({
      monthYear,
      ...groupedServices[monthYear]
    }));

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="service-list-page">
      <div className="page-header">
        <h1>Servicios</h1>
        <Link to="/services/create" className="btn btn-primary">
          Nuevo Servicio
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filter-controls">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Próximos
        </button>
        <button
          className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Pasados
        </button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="no-data-message">
          <p>No hay servicios {filter === 'upcoming' ? 'próximos' : filter === 'past' ? 'pasados' : ''}.</p>
          <Link to="/services/create" className="btn btn-secondary">
            Crear un nuevo servicio
          </Link>
        </div>
      ) : (
        <div className="service-groups">
          {groupedServicesArray.map(group => (
            <div key={group.monthYear} className="service-group">
              <h2 className="month-heading">{group.monthName}</h2>
              <div className="services-grid">
                {group.services.map(service => {
                  const serviceDate = new Date(service.date);
                  return (
                    <div key={service._id} className="service-card">
                      <div className="service-card-content">
                        <div className="service-card-date">
                          {serviceDate.toLocaleDateString('es-ES', { 
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
                      </div>
                      <div className="service-card-actions">
                        <Link to={`/services/${service._id}`} className="btn btn-sm">
                          Ver
                        </Link>
                        <Link to={`/services/edit/${service._id}`} className="btn btn-sm btn-secondary">
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
