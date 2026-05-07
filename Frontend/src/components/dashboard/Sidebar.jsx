import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Star,
  Box,
  Ticket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

const allMenuItems = [
  { id: 'overview', name: 'Overview', path: 'overview', icon: LayoutDashboard },
  { id: 'users', name: 'Users', path: 'users', icon: Users },
  { id: 'products', name: 'Products', path: 'products', icon: ShoppingBag },
  { id: 'ar', name: 'AR Support', path: 'ar', icon: Box },
  { id: 'marketing', name: 'Discounts', path: 'marketing', icon: Ticket },
  { id: 'featured', name: 'Featured', path: 'featured', icon: Star },
];

const Sidebar = ({ role, permissions = [] }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const currentMenu = allMenuItems.filter(item =>
    permissions.includes(item.id)
  );

  return (
    <aside
      className={`${styles.sidebarContainer} ${
        collapsed ? styles.collapsed : ''
      }`}
    >
      {/* HEADER */}
      <div className={styles.logoArea}>
        <div
          className={styles.logoLeft}
          onClick={() => navigate('/')}
        >
          <Box size={30} className={styles.logoIcon} />
          {!collapsed && <h3 className={styles.logoText}>HoloRoom</h3>}
        </div>

      </div>

      {/* COLLAPSE BUTTON */}
        <button
          className={styles.navItem}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

      {/* NAV */}
      <nav className={styles.navMenu}>
        {currentMenu.map((item) => (
          <NavLink
            key={item.path}
            to={`/dashboard/${item.path}`}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} className={styles.navIcon} />
            {!collapsed && item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;