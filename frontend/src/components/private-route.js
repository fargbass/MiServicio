import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props => {
        // Si todavía está cargando, mostrar un indicador de carga
        if (loading) {
          return <div className="loading">Cargando...</div>;
        }

        // Si no hay un usuario autenticado, redirigir al login
        if (!currentUser) {
          return <Redirect to="/" />;
        }

        // Si hay un usuario autenticado, mostrar el componente
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
