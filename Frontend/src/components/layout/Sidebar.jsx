import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Grid, Info, Settings, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'About', path: '/about', icon: Info },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Support', path: '/support', icon: HelpCircle },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <button
        className={styles.toggleBtn}
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={styles.navGroup}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            title={collapsed ? item.name : ''}
          >
            <item.icon className={styles.icon} size={22} />
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.bottomGroup}>
        {bottomItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            title={collapsed ? item.name : ''}
          >
            <item.icon className={styles.icon} size={22} />
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
