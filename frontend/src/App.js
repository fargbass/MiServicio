import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Componentes
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import CreateService from './pages/CreateService';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail';
import CreateTeam from './pages/CreateTeam';
import PeopleList from './pages/PeopleList';
import CreatePerson from './pages/CreatePerson';
import PersonDetail from './pages/PersonDetail';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Estilos
import './assets/css/App.css';
import './assets/css/DarkTheme.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Switch>
            {/* Rutas públicas de autenticación */}
            <Route exact path="/" component={Login} />
            <Route path="/register" component={Register} />
            
            {/* Rutas protegidas con layout completo */}
            <Route>
              <div className="app">
                <Navbar />
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Switch>
                      <PrivateRoute exact path="/dashboard" component={Dashboard} />
                      
                      {/* Rutas de Servicios */}
                      <PrivateRoute exact path="/services" component={ServiceList} />
                      <PrivateRoute exact path="/services/create" component={CreateService} />
                      <PrivateRoute exact path="/services/:id" component={ServiceDetail} />
                      
                      {/* Rutas de Equipos */}
                      <PrivateRoute exact path="/teams" component={TeamList} />
                      <PrivateRoute exact path="/teams/create" component={CreateTeam} />
                      <PrivateRoute exact path="/teams/:id" component={TeamDetail} />
                      
                      {/* Rutas de Personas */}
                      <PrivateRoute exact path="/people" component={PeopleList} />
                      <PrivateRoute exact path="/people/create" component={CreatePerson} />
                      <PrivateRoute exact path="/people/:id" component={PersonDetail} />
                      
                      <Route path="/404" component={NotFound} />
                      <Redirect to="/404" />
                    </Switch>
                  </main>
                </div>
              </div>
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;