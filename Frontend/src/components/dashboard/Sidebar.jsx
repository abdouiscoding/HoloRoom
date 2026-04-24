import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, Star, Box, Ticket } from 'lucide-react';
import styles from './Sidebar.module.css';

const menuConfig = {
  admin: [
    { name: 'Overview', path: 'overview', icon: LayoutDashboard },
    { name: 'Users', path: 'users', icon: Users },
    { name: 'Settings', path: 'settings', icon: Settings },
  ],
  productManager: [
    { name: 'Products', path: 'products', icon: ShoppingBag },
    { name: 'AR Support', path: 'ar', icon: Box },
  ],
  marketingManager: [
    { name: 'Discounts', path: 'marketing', icon: Ticket },
    { name: 'Featured', path: 'featured', icon: Star },
  ]
};

const Sidebar = ({ activeRole }) => {
  const currentMenu = menuConfig[activeRole] || [];

  return (
    <aside className={styles.sidebarContainer}>
      <div className={styles.logoArea}>
        <Box size={32} className={styles.logoIcon} strokeWidth={2.5} />
        <h2 className={styles.logoText}>HoloRoom</h2>
      </div>

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
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className={styles.helpCenter}>
          <p>Need help?</p>
          <button>Help Center</button>
      </div>
    </aside>
  );
};

export default Sidebar;
