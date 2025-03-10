import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/PersonForm.css';

const CreatePerson = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    notes: '',
    teams: [],
    status: 'active'
  });
  
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(true);
  const [error, setError] = useState('');
  
  const { firstName, lastName, email, phone, address, notes, teams, status } = formData;
  
  // Cargar equipos disponibles
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/teams');
        setAvailableTeams(res.data.data || []);
      } catch (err) {
        console.error('Error al cargar equipos:', err);
      } finally {
        setFetchingTeams(false);
      }
    };
    
    fetchTeams();
  }, []);
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAddressChange = e => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [e.target.name]: e.target.value
      }
    });
  };
  
  const handleTeamChange = e => {
    const teamId = e.target.value;
    
    // Si ya está seleccionado, removerlo
    if (teams.includes(teamId)) {
      setFormData({
        ...formData,
        teams: teams.filter(id => id !== teamId)
      });
    } 
    // Si no está seleccionado, añadirlo
    else {
      setFormData({
        ...formData,
        teams: [...teams, teamId]
      });
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validación básica
    if (!firstName || !lastName || !email) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('/people', formData);
      
      // Mostrar mensaje de éxito antes de redirigir
      alert('Persona creada exitosamente');
      
      // Redirigir a la lista de personas
      history.push('/people');
    } catch (err) {
      console.error('Error al crear la persona:', err);
      setError(
        err.response?.data?.message || 
        'Error al crear la persona. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="person-form-page">
      <div className="page-header">
        <h1>Añadir Nueva Persona</h1>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="person-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Apellido *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={handleChange}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Dirección</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="street">Calle</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">Estado/Provincia</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zip">Código Postal</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={address.zip}
                  onChange={handleAddressChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">País</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Equipos</h3>
            {fetchingTeams ? (
              <p>Cargando equipos...</p>
            ) : availableTeams.length === 0 ? (
              <p>No hay equipos disponibles. <a href="/teams/create">Crear un equipo</a></p>
            ) : (
              <div className="teams-checkboxes">
                {availableTeams.map(team => (
                  <div key={team._id} className="team-checkbox">
                    <input
                      type="checkbox"
                      id={`team-${team._id}`}
                      value={team._id}
                      checked={teams.includes(team._id)}
                      onChange={handleTeamChange}
                    />
                    <label htmlFor={`team-${team._id}`}>{team.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h3>Notas</h3>
            <div className="form-group">
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={handleChange}
                rows="4"
                placeholder="Información adicional relevante..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => history.push('/people')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePerson;
