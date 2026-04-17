import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ARViewer from './pages/ARViewer';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import { LoginPage } from './pages/LoginPage';
import Cart from './pages/Cart';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>

        <Route path="/login" element={<LoginPage />} />


        <Route path="/*" element={
          <div className="app-container">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/ar/:id" element={<ARViewer />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
            <ChatbotWidget />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;