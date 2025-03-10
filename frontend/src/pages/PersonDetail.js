import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/PersonDetail.css';

const PersonDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cargar datos de la persona
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/people/${id}`);
        setPerson(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar persona:', err);
        setError('Error al cargar la información de la persona');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerson();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta persona?')) {
      try {
        await api.delete(`/people/${id}`);
        history.push('/people');
      } catch (err) {
        console.error('Error al eliminar la persona:', err);
        setError('Error al eliminar la persona');
      }
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/people/${id}`, { 
        ...person,
        status: newStatus 
      });
      
      // Actualizar persona en el estado
      setPerson({
        ...person,
        status: newStatus
      });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar estado');
    }
  };
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  if (error) {
    return (
      <div className="person-detail-page">
        <div className="alert alert-danger">{error}</div>
        <div className="back-link">
          <Link to="/people">← Volver a la lista de personas</Link>
        </div>
      </div>
    );
  }
  
  if (!person) {
    return (
      <div className="person-detail-page">
        <div className="alert alert-danger">Persona no encontrada</div>
        <div className="back-link">
          <Link to="/people">← Volver a la lista de personas</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="person-detail-page">
      <div className="page-header">
        <div className="back-link">
          <Link to="/people">← Volver a la lista de personas</Link>
        </div>
        <div className="header-actions">
          <Link to={`/people/edit/${person._id}`} className="btn btn-secondary">
            Editar
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
      
      <div className="person-detail-content">
        <div className="person-header">
          <div className="person-info">
            <h1>{person.firstName} {person.lastName}</h1>
            <div className={`person-status status-${person.status}`}>
              {person.status === 'active' ? 'Activo' : 'Inactivo'}
            </div>
          </div>
          <div className="status-actions">
            {person.status === 'active' ? (
              <button 
                className="btn btn-outline"
                onClick={() => handleStatusChange('inactive')}
              >
                Desactivar
              </button>
            ) : (
              <button 
                className="btn btn-outline"
                onClick={() => handleStatusChange('active')}
              >
                Activar
              </button>
            )}
          </div>
        </div>
        
        <div className="person-details">
          <div className="person-section">
            <h3>Información de Contacto</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{person.email}</div>
              </div>
              
              {person.phone && (
                <div className="detail-item">
                  <div className="detail-label">Teléfono</div>
                  <div className="detail-value">{person.phone}</div>
                </div>
              )}
            </div>
          </div>
          
          {(person.address && Object.values(person.address).some(val => val)) && (
            <div className="person-section">
              <h3>Dirección</h3>
              <div className="detail-grid">
                {person.address.street && (
                  <div className="detail-item">
                    <div className="detail-label">Calle</div>
                    <div className="detail-value">{person.address.street}</div>
                  </div>
                )}
                
                {person.address.city && (
                  <div className="detail-item">
                    <div className="detail-label">Ciudad</div>
                    <div className="detail-value">{person.address.city}</div>
                  </div>
                )}
                
                {person.address.state && (
                  <div className="detail-item">
                    <div className="detail-label">Estado/Provincia</div>
                    <div className="detail-value">{person.address.state}</div>
                  </div>
                )}
                
                {person.address.zip && (
                  <div className="detail-item">
                    <div className="detail-label">Código Postal</div>
                    <div className="detail-value">{person.address.zip}</div>
                  </div>
                )}
                
                {person.address.country && (
                  <div className="detail-item">
                    <div className="detail-label">País</div>
                    <div className="detail-value">{person.address.country}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {person.teams && person.teams.length > 0 && (
            <div className="person-section">
              <h3>Equipos</h3>
              <div className="teams-list">
                {person.teams.map(team => (
                  <Link key={team._id} to={`/teams/${team._id}`} className="team-tag">
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {person.notes && (
            <div className="person-section">
              <h3>Notas</h3>
              <div className="notes-box">
                {person.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
