import React, { useState } from 'react';
import { Upload, Trash2, X, Box, AlertTriangle } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const ARManagerView = () => {
  const [arProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: '3D Model', render: (row) => row.hasModel ? (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Box size={16} color="#059669" /> Uploaded</span>
      ) : (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><AlertTriangle size={16} color="#d97706" /> Missing</span>
      ) 
    },
    { header: 'AR Status', render: (row) => (
        <span className={row.arEnabled ? styles.statusLive : styles.statusDraft}>
          {row.arEnabled ? 'Enabled' : 'Disabled'}
        </span>
      ) 
    },
    { header: 'Scale', accessor: 'scale' },
    { header: 'Actions', align: 'right', render: () => (
        <div className={styles.actionButtons}>
            <button className={styles.actionBtnEdit} onClick={() => setIsModalOpen(true)} title="Upload Model"><Upload size={16} /></button>
            <button className={styles.actionBtnDelete} title="Remove Model"><Trash2 size={16} /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>AR Support</h2>
          <p>Upload 3D models and manage AR compatibility for products.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Box size={18} /> Upload 3D Model
        </button>
      </div>

      <DashboardTable columns={columns} data={arProducts} emptyStateMessage="No products available." />

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Upload 3D Model</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form className={styles.modalForm} onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className={styles.formGroup}>
                <label>Select Product</label>
                <select required>
                  <option value="">-- Choose Product --</option>
                  <option value="1">Velvet Accent Chair</option>
                  <option value="2">Minimalist Floor Lamp</option>
                  <option value="3">Modern Oak Desk</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>3D Model File (.glb, .gltf)</label>
                <input type="file" accept=".glb,.gltf" required style={{ padding: '0.5rem 0', background: 'transparent', border: 'none' }} />
              </div>
              <div className={styles.formGroup}>
                <label>Default Scale</label>
                <input type="number" step="0.1" defaultValue="1.0" required />
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="enableAr" defaultChecked />
                <label htmlFor="enableAr">Enable AR Immediately</label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Upload Model</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARManagerView;
