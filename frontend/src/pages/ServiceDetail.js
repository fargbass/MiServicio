import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        setService(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar el servicio:', err);
        setError('Error al cargar la información del servicio');
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await api.delete(`/services/${id}`);
        history.push('/services');
      } catch (err) {
        console.error('Error al eliminar el servicio:', err);
        setError('Error al eliminar el servicio');
      }
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  if (error) {
    return (
      <div className="service-detail-page">
        <div className="alert alert-danger">{error}</div>
        <div className="back-link">
          <Link to="/services">← Volver a la lista de servicios</Link>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="alert alert-danger">Servicio no encontrado</div>
        <div className="back-link">
          <Link to="/services">← Volver a la lista de servicios</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="service-detail-page">
      <div className="page-header">
        <div className="back-link">
          <Link to="/services">← Volver a la lista de servicios</Link>
        </div>
        <div className="header-actions">
          <Link to={`/services/edit/${service._id}`} className="btn btn-secondary">
            Editar
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
      
      <div className="service-detail-content">
        <div className="service-header">
          <h1>{service.title}</h1>
          <div className={`service-status status-${service.status}`}>
            {service.status === 'draft' && 'Borrador'}
            {service.status === 'published' && 'Publicado'}
            {service.status === 'completed' && 'Completado'}
            {service.status === 'cancelled' && 'Cancelado'}
          </div>
        </div>
        
        <div className="service-info">
          <div className="info-item">
            <div className="info-label">Fecha</div>
            <div className="info-value">{formatDate(service.date)}</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Hora</div>
            <div className="info-value">{service.startTime} - {service.endTime}</div>
          </div>
          
          {service.location && (
            <div className="info-item">
              <div className="info-label">Ubicación</div>
              <div className="info-value">{service.location}</div>
            </div>
          )}
        </div>
        
        {service.description && (
          <div className="service-description">
            <h3>Descripción</h3>
            <p>{service.description}</p>
          </div>
        )}
        
        <div className="service-items">
          <div className="service-items-header">
            <h2>Elementos del Servicio</h2>
            <button className="btn btn-primary">Agregar Elemento</button>
          </div>
          
          {service.items && service.items.length > 0 ? (
            <div className="service-items-list">
              {service.items.map(item => (
                <div key={item._id} className="service-item-card">
                  <div className="item-title">{item.title}</div>
                  <div className="item-type">{item.type}</div>
                  <div className="item-duration">{item.duration} minutos</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No hay elementos en este servicio</p>
              <button className="btn btn-secondary">Agregar el primer elemento</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
