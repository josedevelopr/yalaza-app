import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Footer from './components/Footer';
import CreateAccount from './pages/CreateAccount';
import ViabilidadEvento from './components/ViabilidadEvento';


function App() {
  return (
    <Router>
      <Routes>
        {/* Esto hace que Home sea la página inicial */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/viabilidad" element={<ViabilidadEvento />} />        
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;