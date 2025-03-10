import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Obtener los datos del usuario actual
      getUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Función para obtener los datos del usuario actual
  const getUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener los datos del usuario');
      // Si hay un error, eliminar el token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', userData);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', res.data.token);
      
      // Obtener los datos del usuario
      await getUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al registrar el usuario');
      return { success: false, error: err.response ? err.response.data.message : 'Error al registrar el usuario' };
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      // Guardar el token en localStorage
      localStorage.setItem('token', res.data.token);
      
      // Obtener los datos del usuario
      await getUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error al iniciar sesión');
      return { success: false, error: err.response ? err.response.data.message : 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('token');
    
    // Limpiar el estado
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
