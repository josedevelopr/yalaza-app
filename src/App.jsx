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
            <ProtectedRoute>
              <CheckViability />
            </ProtectedRoute>
          } 
        />     
        <Route 
          path="/organizador/crear" 
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cliente/comprar/:eventoId" 
          element={
              <BuyTickets />
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