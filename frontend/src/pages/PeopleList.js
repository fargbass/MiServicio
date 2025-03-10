import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/PeopleList.css';

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const res = await api.get('/people');
        setPeople(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar personas:', err);
        setError('Error al cargar las personas');
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta persona?')) {
      try {
        await api.delete(`/people/${id}`);
        // Actualizar la lista de personas
        setPeople(people.filter(person => person._id !== id));
      } catch (err) {
        console.error('Error al eliminar la persona:', err);
        setError('Error al eliminar la persona');
      }
    }
  };

  // Filtrar personas por término de búsqueda y estado
  const filteredPeople = people.filter(person => {
    const matchesSearch = 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'active' && person.status === 'active') ||
      (activeFilter === 'inactive' && person.status === 'inactive');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="people-list-page">
      <div className="page-header">
        <h1>Personas</h1>
        <Link to="/people/create" className="btn btn-primary">
          Nueva Persona
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="people-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Activos
          </button>
          <button
            className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('inactive')}
          >
            Inactivos
          </button>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="no-data-message">
          <p>No hay personas registradas. ¡Añade una nueva!</p>
          <Link to="/people/create" className="btn btn-secondary">
            Añadir una nueva persona
          </Link>
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="no-data-message">
          <p>No se encontraron personas que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="people-table-container">
          <table className="people-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Equipos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map(person => (
                <tr key={person._id}>
                  <td>
                    <Link to={`/people/${person._id}`} className="person-name">
                      {person.firstName} {person.lastName}
                    </Link>
                  </td>
                  <td>{person.email}</td>
                  <td>{person.phone || '-'}</td>
                  <td>
                    {person.teams && person.teams.length > 0 ? (
                      <div className="teams-list">
                        {person.teams.map(team => (
                          <span key={team._id} className="team-tag">
                            {team.name}
                          </span>
                        )).slice(0, 2)}
                        {person.teams.length > 2 && (
                          <span className="more-tag">+{person.teams.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${person.status}`}>
                      {person.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/people/${person._id}`} className="btn btn-sm">
                        Ver
                      </Link>
                      <Link to={`/people/edit/${person._id}`} className="btn btn-sm btn-secondary">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(person._id)}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PeopleList;
