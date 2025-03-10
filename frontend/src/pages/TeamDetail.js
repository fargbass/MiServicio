import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/TeamDetail.css';

const TeamDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  
  const [team, setTeam] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  
  // Cargar datos del equipo
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar equipo:', err);
        setError('Error al cargar la información del equipo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [id]);
  
  // Cargar personas disponibles
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await api.get('/people');
        setPeople(res.data.data || []);
      } catch (err) {
        console.error('Error al cargar personas:', err);
      }
    };
    
    fetchPeople();
  }, []);
  
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await api.delete(`/teams/${id}`);
        history.push('/teams');
      } catch (err) {
        console.error('Error al eliminar el equipo:', err);
        setError('Error al eliminar el equipo');
      }
    }
  };
  
  const handleAddMember = async () => {
    if (!selectedPerson) return;
    
    try {
      setAddingMember(true);
      
      await api.post(`/teams/${id}/members`, {
        personId: selectedPerson,
        role: 'member'
      });
      
      // Refrescar datos del equipo
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data.data);
      
      // Resetear selección
      setSelectedPerson('');
    } catch (err) {
      console.error('Error al añadir miembro:', err);
      alert('Error al añadir miembro al equipo');
    } finally {
      setAddingMember(false);
    }
  };
  
  const handleRemoveMember = async (personId) => {
    if (window.confirm('¿Estás seguro de eliminar este miembro del equipo?')) {
      try {
        await api.delete(`/teams/${id}/members/${personId}`);
        
        // Refrescar datos del equipo
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data.data);
      } catch (err) {
        console.error('Error al eliminar miembro:', err);
        alert('Error al eliminar miembro del equipo');
      }
    }
  };
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  if (error) {
    return (
      <div className="team-detail-page">
        <div className="alert alert-danger">{error}</div>
        <div className="back-link">
          <Link to="/teams">← Volver a la lista de equipos</Link>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="team-detail-page">
        <div className="alert alert-danger">Equipo no encontrado</div>
        <div className="back-link">
          <Link to="/teams">← Volver a la lista de equipos</Link>
        </div>
      </div>
    );
  }
  
  // Filtrar personas que aún no son miembros
  const availablePeople = people.filter(person => 
    !team.members.some(member => member.person._id === person._id)
  );
  
  return (
    <div className="team-detail-page">
      <div className="page-header">
        <div className="back-link">
          <Link to="/teams">← Volver a la lista de equipos</Link>
        </div>
        <div className="header-actions">
          <Link to={`/teams/edit/${team._id}`} className="btn btn-secondary">
            Editar
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
      
      <div className="team-detail-content">
        <div className="team-header">
          <h1>{team.name}</h1>
        </div>
        
        {team.description && (
          <div className="team-description">
            <h3>Descripción</h3>
            <p>{team.description}</p>
          </div>
        )}
        
        <div className="team-members">
          <div className="section-header">
            <h2>Miembros del Equipo</h2>
          </div>
          
          {team.members && team.members.length > 0 ? (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map(member => (
                    <tr key={member.person._id}>
                      <td>
                        <Link to={`/people/${member.person._id}`}>
                          {member.person.firstName} {member.person.lastName}
                        </Link>
                      </td>
                      <td>{member.person.email}</td>
                      <td>{member.role === 'leader' ? 'Líder' : 'Miembro'}</td>
                      <td>
                        <span className={`status-badge ${member.status}`}>
                          {member.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleRemoveMember(member.person._id)}
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
          ) : (
            <div className="no-data-message">
              <p>Este equipo no tiene miembros</p>
            </div>
          )}
          
          <div className="add-member-form">
            <h3>Añadir Miembro</h3>
            
            {availablePeople.length === 0 ? (
              <p>No hay personas disponibles para añadir. <Link to="/people/create">Crear una persona</Link></p>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <select
                    value={selectedPerson}
                    onChange={e => setSelectedPerson(e.target.value)}
                    disabled={addingMember}
                  >
                    <option value="">Seleccionar persona</option>
                    {availablePeople.map(person => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={handleAddMember}
                  disabled={!selectedPerson || addingMember}
                >
                  {addingMember ? 'Añadiendo...' : 'Añadir al Equipo'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {team.positions && team.positions.length > 0 && (
          <div className="team-positions">
            <h3>Posiciones</h3>
            <ul className="positions-list">
              {team.positions.map(position => (
                <li key={position._id}>{position.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
