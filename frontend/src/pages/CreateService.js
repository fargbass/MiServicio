import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/ServiceForm.css';

const CreateService = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { title, date, startTime, endTime, location, description, status } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validación básica
    if (!title || !date || !startTime || !endTime) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('/services', formData);
      
      // Mostrar mensaje de éxito antes de redirigir
      alert('Servicio creado exitosamente');
      
      // Redirigir a la lista de servicios
      history.push('/services');
    } catch (err) {
      console.error('Error al crear el servicio:', err);
      setError(
        err.response?.data?.message || 
        'Error al crear el servicio. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="service-form-page">
      <div className="page-header">
        <h1>Crear Nuevo Servicio</h1>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="service-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título del Servicio *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="Ej: Servicio Dominical, Reunión de Jóvenes, etc."
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Fecha *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime">Hora de Inicio *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={startTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">Hora de Finalización *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Ubicación</label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={handleChange}
              placeholder="Ej: Salón Principal, Auditorio, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe el propósito o detalles importantes del servicio..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={handleChange}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <small className="form-text">
              Los servicios en borrador solo son visibles para administradores.
              Los servicios publicados son visibles para todos los miembros del equipo.
            </small>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => history.push('/services')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;