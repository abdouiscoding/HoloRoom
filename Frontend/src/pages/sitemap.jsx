import { Link } from 'react-router-dom';
import styles from './sitemap.module.css';

const pages = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/support', label: 'Support' },
  { path: '/profile', label: 'Profile' },
  { path: '/cart', label: 'Cart' },
];

function Sitemap() {
  return (
    <section className={styles.page} aria-labelledby="sitemap-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>HoloRoom</p>
        <h1 id="sitemap-title">Site map</h1>
        <p className={styles.description}>Browse the pages available on HoloRoom.</p>
      </header>

      <nav className={styles.card} aria-label="Site map">
        <h2>All pages <span>{pages.length} pages</span></h2>
        <ul>
          {pages.map(({ path, label }) => (
            <li key={path}>
              <Link to={path}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

export default Sitemap;
