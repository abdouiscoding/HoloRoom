import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Maximize, RotateCcw, RotateCw, Palette, ArrowLeft, Menu, LogOut } from 'lucide-react';
import styles from './ARViewer.module.css';
import { useCart } from '../context/CartContext';

const ARViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [activeColor, setActiveColor] = useState(0);
  const colors = ['#2E3A4B', '#9D4B55', '#E6C687', '#4A5D23', '#800020', '#1C1C1C'];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColorsOpen, setIsColorsOpen] = useState(false);

  const handleAddToCart = () => {

  };

  return (
    <div className={styles.arViewerContainer}>

      {/* Top HUD */}
      <div className={styles.topHud}>
        <button className={styles.hudBtn}>
          <i className="fas fa-box" style={{ fontSize: '28px' }}></i>
        </button>
        <div className={styles.hudTitle}>
          AR Mode <span className={styles.liveIndicator}></span>
        </div>
        <div className={styles.menuContainer}>
          <button className={styles.hudBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={28} />
          </button>
          {isMenuOpen && (
            <div className={`${styles.dropdownMenu} glass-panel`}>
              <button className={styles.menuItem}>
                <Palette size={18} />
                <span>Appearance</span>
              </button>
              <button className={styles.menuItem} onClick={() => navigate(-1)}>
                <LogOut size={18} />
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls HUD */}
      <div className={styles.bottomHud}>
        <div className={`${styles.controlPanel} glass-panel`}>
          <div className={styles.tools}>
            <button className={styles.toolBtn}>
              <RotateCcw size={20} />
              <span>Rotate left</span>
            </button>
            <button className={styles.toolBtn}>
              <RotateCw size={20} />
              <span>Rotate right</span>
            </button>
          </div>
          <button className={styles.arCartBtn} onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Colors Button Bottom Left */}
      <div className={styles.colorsCorner}>
        <button
          className={styles.hudBtn}
          style={{ width: 'auto', padding: '0 16px', borderRadius: '22px', gap: '8px' }}
          onClick={() => setIsColorsOpen(!isColorsOpen)}
        >
          <Palette size={24} />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Choose a color</span>
        </button>
        {isColorsOpen && (
          <div className={`${styles.colorsPopup} glass-panel`}>
            {colors.map((color, idx) => (
              <button
                key={idx}
                className={`${styles.colorSwatch} ${activeColor === idx ? styles.activeSwatch : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ARViewer;
