import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import OverviewView from './views/OverviewView';
import ProductsManagerView from './views/ProductsManagerView';
import MarketingView from './views/MarketingView';
import UsersManagerView from './views/UsersManagerView';
import FeaturedManagerView from './views/FeaturedManagerView';
import ARManagerView from './views/ARManagerView';
import styles from './DashboardLayout.module.css';

const rolePermissions = {
  admin: ["overview", "users", "settings"],
  productManager: ["products", "ar"],
  marketingManager: ["marketing", "featured"]
};

const DashboardLayout = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const navigate = useNavigate();
  const location = useLocation();

  const permissions = rolePermissions[activeRole] || [];

  // Simple route protection logic
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    
    // Default redirects based on role if they hit the root
    if (path === 'dashboard' || path === '') {
      if (activeRole === 'admin') navigate('/dashboard/overview', { replace: true });
      else if (activeRole === 'productManager') navigate('/dashboard/products', { replace: true });
      else if (activeRole === 'marketingManager') navigate('/dashboard/marketing', { replace: true });
      return;
    } 
    
    // Check if they have permission for the current path
    const isAllowed = permissions.some(p => path.includes(p));
    if (!isAllowed) {
        if (activeRole === 'admin') navigate('/dashboard/overview', { replace: true });
        else if (activeRole === 'productManager') navigate('/dashboard/products', { replace: true });
        else if (activeRole === 'marketingManager') navigate('/dashboard/marketing', { replace: true });
    }
  }, [activeRole, location.pathname, navigate, permissions]);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar activeRole={activeRole} permissions={permissions} />
      <div className={styles.mainContent}>
        <Header activeRole={activeRole} setActiveRole={setActiveRole} />
        <div className={styles.pageContent}>
          <Routes>
            <Route path="overview" element={<OverviewView />} />
            <Route path="products" element={<ProductsManagerView />} />
            <Route path="marketing" element={<MarketingView />} />
            <Route path="users" element={<UsersManagerView />} />
            <Route path="ar" element={<ARManagerView />} />
            <Route path="featured" element={<FeaturedManagerView />} />
            <Route path="settings" element={<div style={{padding: '2rem'}}><h2>Settings</h2><p>Empty State</p></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
