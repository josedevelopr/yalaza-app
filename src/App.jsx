import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Footer from './components/Footer';
import CreateAccount from './pages/CreateAccount';


function App() {
  return (
    <Router>
      <Routes>
        {/* Esto hace que Home sea la página inicial */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;