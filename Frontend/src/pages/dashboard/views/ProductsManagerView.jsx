import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, XCircle, Box, AlertTriangle } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const ProductsManagerView = () => {
  const [products] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Status', render: (row) => (
        <span className={row.status === 'Live' ? styles.statusLive : styles.statusDraft}>
          {row.status}
        </span>
      ) 
    },
    { header: 'AR Support', render: (row) => row.ar ? (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><CheckCircle size={16} color="#059669" /> Enabled</span>
      ) : (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><XCircle size={16} color="#dc2626" /> Disabled</span>
      ) 
    },
    { header: '3D Model', render: (row) => row.model ? (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Box size={16} color="#059669" /> Uploaded</span>
      ) : (
        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><AlertTriangle size={16} color="#d97706" /> Missing</span>
      ) 
    },
    { header: 'Actions', align: 'right', render: () => (
        <div className={styles.actionButtons}>
            <button className={styles.actionBtnEdit} onClick={() => setIsAddModalOpen(true)}><Edit size={16} /></button>
            <button className={styles.actionBtnDelete}><Trash2 size={16} /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>Products Management</h2>
          <p>Add, update, or remove products and their AR assets.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> Add Product
        </button>
      </div>

      <DashboardTable columns={columns} data={products} emptyStateMessage="No products found. Click 'Add Product' to create one." />

      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Product Details</h3>
              <button onClick={() => setIsAddModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form className={styles.modalForm} onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input type="text" required />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select>
                  <option value="Live">Live</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="arSupport" />
                <label htmlFor="arSupport">Enable AR Support</label>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="modelSupport" />
                <label htmlFor="modelSupport">Include 3D Model</label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagerView;
