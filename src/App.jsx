import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import CreateEvent from './pages/CreateEvent';


function App() {
  return (
    <Router>
      <Routes>
        {/* Esto hace que Home sea la página inicial */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/organizador/crear" element={<CreateEvent />} />
      </Routes>
    </Router>
  );
}

export default App;