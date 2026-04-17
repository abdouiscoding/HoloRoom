import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, View, Sparkles, ShoppingBag } from 'lucide-react';
import styles from './Home.module.css';

const MOCK_FEATURED = [
  { id: 1, name: 'Velvet Accent Chair', price: '29900 DZD', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 2, name: 'Minimalist Floor Lamp', price: '12900 DZD', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400', category: 'Decor' },
  { id: 3, name: 'Modern Oak Desk', price: '49900 DZD', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400', category: 'Furniture' }
];

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              Corby<br />sofas
            </h1>
            <p className={styles.subtitle}>
              Price starting from <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>19900 DZD</span>
            </p>
            <div className={styles.heroActions}>
              <Link to="/shop" className={`${styles.shopNowBtn}`}>
                <ShoppingBag size={18} /> SHOP NOW
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <img src="/landingpage.png" alt="Corby Blue Sofa" className={styles.heroImage} />
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Featured in <span className="text-gradient">3D & AR</span></h2>
            <Link to="/shop" className={styles.viewAllBtn}>View All <ArrowRight size={16} /></Link>
          </div>

          <div className={styles.productGrid}>
            {MOCK_FEATURED.map(product => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  <img src={product.image} alt={product.name} />
                  <div className={styles.arBadge}>
                    <View size={14} /> 3D/AR
                  </div>
                  <div className={styles.cardActions}>
                    <Link to={`/product/${product.id}`} className={styles.quickViewBtn}>
                      View Details
                    </Link>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.category}>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
