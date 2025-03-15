import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/TeamForm.css';

const CreateTeam = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    positions: []
  });
  
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { name, description, positions } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePositionChange = e => {
    setPosition(e.target.value);
  };

  const addPosition = () => {
    if (position.trim() === '') return;
    
    setFormData({ 
      ...formData, 
      positions: [...positions, { name: position.trim() }] 
    });
    setPosition('');
  };

  const removePosition = (index) => {
    const updatedPositions = [...positions];
    updatedPositions.splice(index, 1);
    setFormData({ ...formData, positions: updatedPositions });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!name) {
      setError('Por favor ingresa un nombre para el equipo');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const teamData = {
        name: name,
        description: description,
        positions: positions
      };
      
      console.log('Enviando datos del equipo:', teamData);
      
      const response = await api.post('/teams', teamData);
      
      if (response.status === 201) {
        // Mostrar mensaje de éxito antes de redirigir
        alert('Equipo creado exitosamente');
        
        // Redirigir a la lista de equipos
        history.push('/teams');
      } else {
        throw new Error('Error inesperado al crear el equipo');
      }
    } catch (err) {
      console.error('Error al crear el equipo:', err);
      setError(
        err.response?.data?.message || 
        'Error al crear el equipo. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="team-form-page">
      <div className="page-header">
        <h1>Crear Nuevo Equipo</h1>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="team-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre del Equipo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Ej: Equipo de Alabanza, Ujieres, Técnicos, etc."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe la función y propósito de este equipo..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Posiciones en el Equipo</label>
            <div className="position-input-group">
              <input
                type="text"
                value={position}
                onChange={handlePositionChange}
                placeholder="Ej: Director, Vocal, Guitarra, Cámara, etc."
              />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={addPosition}
              >
                Añadir
              </button>
            </div>
            
            {positions.length > 0 && (
              <div className="positions-list">
                <h4>Posiciones añadidas:</h4>
                <ul>
                  {positions.map((pos, index) => (
                    <li key={index}>
                      {pos.name}
                      <button 
                        type="button" 
                        className="btn-remove"
                        onClick={() => removePosition(index)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <small className="form-text">
              Añade las diferentes posiciones o roles que existen en este equipo. 
              Estas posiciones se utilizarán para asignar personas a roles específicos.
            </small>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => history.push('/teams')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;