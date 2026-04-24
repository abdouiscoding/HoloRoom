import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ activeRole, setActiveRole }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.headerContainer}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className={styles.headerRight}>
        {/*nswitchi mabizman ------*/}
        <div className={styles.roleSwitcher}>
          <label>Role:</label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className={styles.roleSelect}
          >
            <option value="admin">Admin</option>
            <option value="productManager">Product Manager</option>
            <option value="marketingManager">Marketing Manager</option>
          </select>
        </div> {/*---------*/}

        <div className={styles.profileSection} onClick={() => navigate('/profile')}>
          <div className={styles.avatar}>

          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>User</span>
            <span className={styles.profileRole}>
              {activeRole === 'productManager' ? 'Product Manager' : activeRole === 'marketingManager' ? 'Marketing' : 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
