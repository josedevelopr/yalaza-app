import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import CreateEvent from './pages/CreateEvent';
import CheckViability from './pages/CheckViability';
import ProtectedRoute from './components/ProtectedRoute'; // Importar el protector
import BuyTickets from './pages/BuyTickets';
import WatchAllEvents from './pages/WatchAllEvents';
import EventDetails from './pages/EventDetails';
import WatchMyTickets  from './pages/WatchMyTickets';
import { USER_ROLES } from './constants/roles';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/eventos" element={<WatchAllEvents />} />
        
        {/* Rutas Protegidas */}
        <Route 
          path="/viabilidad" 
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ORGANIZADOR, USER_ROLES.SOPORTE, USER_ROLES.ADMIN]}>
              <CheckViability />
            </ProtectedRoute>
          } 
        />     
        <Route 
          path="/organizador/crear" 
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ORGANIZADOR, USER_ROLES.SOPORTE, USER_ROLES.ADMIN]}>
              <CreateEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-tickets" 
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ASISTENTE]}>
              <WatchMyTickets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cliente/comprar/:eventoId" 
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ASISTENTE]}>
              <BuyTickets />
            </ProtectedRoute>
          } 
        /> 
        <Route 
          path="/evento/:eventoId" 
          element={
              <EventDetails />
          } 
        />         
      </Routes>
    </Router>
  );
}

export default App;