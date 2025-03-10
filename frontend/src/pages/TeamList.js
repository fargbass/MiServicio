import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/TeamList.css';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await api.get('/teams');
        setTeams(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar equipos:', err);
        setError('Error al cargar los equipos');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await api.delete(`/teams/${id}`);
        // Actualizar la lista de equipos
        setTeams(teams.filter(team => team._id !== id));
      } catch (err) {
        console.error('Error al eliminar el equipo:', err);
        setError('Error al eliminar el equipo');
      }
    }
  };

  // Filtrar equipos por término de búsqueda
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="team-list-page">
      <div className="page-header">
        <h1>Equipos</h1>
        <Link to="/teams/create" className="btn btn-primary">
          Nuevo Equipo
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="team-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="no-data-message">
          <p>No hay equipos. ¡Crea uno nuevo!</p>
          <Link to="/teams/create" className="btn btn-secondary">
            Crear un nuevo equipo
          </Link>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="no-data-message">
          <p>No se encontraron equipos con ese nombre.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {filteredTeams.map(team => (
            <div key={team._id} className="team-card">
              <div className="team-card-content">
                <h3 className="team-card-title">{team.name}</h3>
                <div className="team-card-members">
                  {team.members && team.members.length > 0 ? (
                    <span>{team.members.length} miembros</span>
                  ) : (
                    <span>Sin miembros</span>
                  )}
                </div>
                {team.description && (
                  <div className="team-card-description">{team.description}</div>
                )}
              </div>
              <div className="team-card-actions">
                <Link to={`/teams/${team._id}`} className="btn btn-sm">
                  Ver
                </Link>
                <Link to={`/teams/edit/${team._id}`} className="btn btn-sm btn-secondary">
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="btn btn-sm btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamList;
