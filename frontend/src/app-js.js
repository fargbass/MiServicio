import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Componentes
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import CreateService from './pages/CreateService';
import PeopleList from './pages/PeopleList';
import PersonDetail from './pages/PersonDetail';
import CreatePerson from './pages/CreatePerson';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail';
import CreateTeam from './pages/CreateTeam';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './assets/css/Mobile.css';

// Estilos
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Switch>
                <Route exact path="/" component={Login} />
                <Route path="/register" component={Register} />
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <PrivateRoute exact path="/services" component={ServiceList} />
                <PrivateRoute exact path="/services/create" component={CreateService} />
                <PrivateRoute exact path="/services/:id" component={ServiceDetail} />
                <PrivateRoute exact path="/people" component={PeopleList} />
                <PrivateRoute exact path="/people/create" component={CreatePerson} />
                <PrivateRoute exact path="/people/:id" component={PersonDetail} />
                <PrivateRoute exact path="/teams" component={TeamList} />
                <PrivateRoute exact path="/teams/create" component={CreateTeam} />
                <PrivateRoute exact path="/teams/:id" component={TeamDetail} />
                <Route path="/404" component={NotFound} />
                <Redirect to="/404" />
              </Switch>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
