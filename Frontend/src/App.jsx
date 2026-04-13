import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ARViewer from './pages/ARViewer';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/ar/:id" element={<ARViewer />} />
          </Routes>
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;
