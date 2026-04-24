import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, View, ShoppingBag, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import styles from './Home.module.css';

const MOCK_FEATURED = [
  { id: 1, name: 'Velvet Accent Chair', price: '29,900 DZD', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 2, name: 'Minimalist Floor Lamp', price: '12,900 DZD', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400', category: 'Decor' },
  { id: 3, name: 'Modern Oak Desk', price: '49,900 DZD', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 4, name: 'Ceramic Table Vase', price: '4,500 DZD', image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=400', category: 'Decor' },
  { id: 5, name: 'Woven Rattan Armchair', price: '34,500 DZD', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 6, name: 'Industrial Bookshelf', price: '38,900 DZD', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
];

const Home = () => {
  const sliderRef = useRef(null);
  const [hoveredHeart, setHoveredHeart] = useState(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
            <h2>Featured <span className="text-gradient">Products</span></h2>
            <Link to="/shop" className={styles.viewAllBtn}>View All <ArrowRight size={16} /></Link>
          </div>

          <div className={styles.sliderWrapper}>
            <button className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`} onClick={() => scroll('left')}>
              <ChevronLeft size={22} />
            </button>

            <div className={styles.sliderTrack} ref={sliderRef}>
              {MOCK_FEATURED.map(product => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <img src={product.image} alt={product.name} />
                    <div className={styles.arBadge}>
                      <View size={14} /> 3D/AR
                    </div>
                    <div className={styles.wishlistContainer}>
                        <button 
                            className={styles.wishlistBtn}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onMouseEnter={() => setHoveredHeart(product.id)}
                            onMouseLeave={() => setHoveredHeart(null)}
                            title="Add to wishlist"
                        >
                            <Heart 
                                size={18} 
                                fill={hoveredHeart === product.id ? '#e69100' : 'none'}
                                color={hoveredHeart === product.id ? '#e69100' : 'black'}
                            />
                        </button>
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

            <button className={`${styles.sliderArrow} ${styles.sliderArrowRight}`} onClick={() => scroll('right')}>
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
