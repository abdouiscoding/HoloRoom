import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Grid, Info, Settings, HelpCircle } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, setIsOpen }) => {

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
    <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
      <div className={styles.navGroup} style={{ marginTop: 'var(--spacing-xl)' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            title={!isOpen ? item.name : ''}
            onClick={() => setIsOpen(false)}
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
            title={!isOpen ? item.name : ''}
            onClick={() => setIsOpen(false)}
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
