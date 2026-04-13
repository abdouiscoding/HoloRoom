import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Maximize, RotateCcw, Palette, ArrowLeft, Camera } from 'lucide-react';
import styles from './ARViewer.module.css';

const ARViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeColor, setActiveColor] = useState(0);
  const colors = ['#2E3A4B', '#9D4B55', '#E6C687'];

  return (
    <div className={styles.arViewerContainer}>
      {/* Fake Camera Background */}
      <div className={styles.cameraBackground}>
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
          alt="Room Background" 
          className={styles.camImage}
        />
        <div className={styles.scanOverlay}>
          <div className={styles.scanLine}></div>
          <p>Scanning Room Surfaces...</p>
        </div>
      </div>

      {/* AR Product Simulation */}
      <div className={styles.modelContainer}>
        <div className={styles.modelPlaceholder} style={{ backgroundColor: colors[activeColor] }}>
           {/* In a real app, this would be a <model-viewer> or Three.js canvas */}
           <img 
             src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400" 
             alt="3D Model" 
             className={styles.simulatedModel}
           />
        </div>
      </div>

      {/* Top HUD */}
      <div className={styles.topHud}>
        <button className={styles.hudBtn} onClick={() => navigate(-1)}>
          <X size={24} />
        </button>
        <div className={styles.hudTitle}>
          AR Mode <span className={styles.liveIndicator}></span>
        </div>
        <button className={styles.hudBtn}>
          <Camera size={24} />
        </button>
      </div>

      {/* Bottom Controls HUD */}
      <div className={styles.bottomHud}>
        <div className={`${styles.controlPanel} glass-panel`}>
          <div className={styles.tools}>
            <button className={styles.toolBtn}>
              <RotateCcw size={20} />
              <span>Rotate</span>
            </button>
            <button className={styles.toolBtn}>
              <Maximize size={20} />
              <span>Scale</span>
            </button>
          </div>

          <div className={styles.colorPicker}>
            <span className={styles.toolLabel}>Colors:</span>
            {colors.map((color, idx) => (
              <button 
                key={idx} 
                className={`${styles.colorSwatch} ${activeColor === idx ? styles.activeSwatch : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(idx)}
              />
            ))}
          </div>

          <button className="btn-primary" onClick={() => alert('Added to cart directly from AR!')}>
            Add to Cart - $299
          </button>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
