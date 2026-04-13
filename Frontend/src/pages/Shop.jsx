import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, View, ChevronDown } from 'lucide-react';
import styles from './Shop.module.css';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Velvet Accent Chair', price: '$299', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 2, name: 'Minimalist Floor Lamp', price: '$129', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400', category: 'Decor' },
  { id: 3, name: 'Modern Oak Desk', price: '$499', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 4, name: 'Ceramic Vase Set', price: '$89', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=400', category: 'Accessories' },
  { id: 5, name: 'Lounge Sofa', price: '$899', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400', category: 'Furniture' },
  { id: 6, name: 'Abstract Wall Art', price: '$150', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?auto=format&fit=crop&q=80&w=400', category: 'Decor' }
];

const CATEGORIES = ['All', 'Furniture', 'Decor', 'Accessories', 'Lighting'];

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className={styles.shopContainer}>
      {/* Shop Header */}
      <div className={styles.shopHeader}>
        <div className="container">
          <h1 className="text-gradient">Explore Collection</h1>
          <p>Discover items that perfect your space. Try them all in AR.</p>
        </div>
      </div>

      <div className={`container ${styles.shopLayout}`}>
        {/* Sidebar Filters (Desktop) */}
        <aside className={styles.sidebar}>
          <div className={`${styles.filterBlock} glass-panel`}>
            <div className={styles.filterHeader}>
              <h3>Categories</h3>
            </div>
            <ul className={styles.categoryList}>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.filterBlock} glass-panel`}>
            <div className={styles.filterHeader}>
              <h3>Price Range</h3>
            </div>
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Min" className={styles.input} />
              <span>-</span>
              <input type="number" placeholder="Max" className={styles.input} />
            </div>
            <button className="btn-secondary" style={{width: '100%', marginTop: '1rem', padding: '0.5rem'}}>Apply</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.controlsBar}>
            <button className={styles.mobileFilterBtn}>
              <SlidersHorizontal size={18} /> Filters
            </button>
            <div className={styles.sortDropdown}>
              <span>Sort by:</span>
              <button className={styles.sortBtn}>Recommended <ChevronDown size={16}/></button>
            </div>
          </div>

          <div className={styles.productGrid}>
            {filteredProducts.map(product => (
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
                  <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
                  <p className={styles.price}>{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
