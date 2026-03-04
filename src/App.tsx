import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Offers from './pages/Offers';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminStrategy from './pages/AdminStrategy';
import { api } from './services/api';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [settings, setSettings] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch data for display immediately (Fastest Path)
        const publicData = await api.getPublicData();
        setSettings(publicData.settings);
        setProducts(publicData.products);
        setBanners(publicData.banners);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false); // UI ready to render
      }
    };

    initData();
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <Router>
      <Layout 
        settings={settings} 
        isAuthenticated={!!token} 
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <Routes>
          <Route path="/" element={<Home settings={settings} products={products} banners={banners} searchTerm={searchTerm} isLoading={isLoading} />} />
          <Route path="/ofertas" element={<Offers settings={settings} products={products} />} />
          <Route path="/produto/:id" element={<ProductDetail settings={settings} />} />
          <Route path="/login" element={token ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={token ? <AdminDashboard token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin-estrategia" 
            element={token ? <AdminStrategy token={token} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}
