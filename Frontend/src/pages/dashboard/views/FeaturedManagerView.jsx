import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const FeaturedManagerView = () => {
  const [featuredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Display Order', accessor: 'order' },
    { header: 'Status', render: (row) => (
        <span className={row.status === 'Visible' ? styles.statusLive : styles.statusDraft}>
          {row.status}
        </span>
      ) 
    },
    { header: 'Actions', align: 'right', render: () => (
        <div className={styles.actionButtons}>
            <button className={styles.actionBtnEdit} onClick={() => setIsModalOpen(true)}><Edit size={16} /></button>
            <button className={styles.actionBtnDelete}><Trash2 size={16} /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>Featured Products</h2>
          <p>Manage the products showcased on the homepage hero section.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Featured
        </button>
      </div>

      <DashboardTable columns={columns} data={featuredProducts} emptyStateMessage="No featured products. Add one to showcase it on the home page." />

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Featured Product Details</h3>
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
                <label>Display Order</label>
                <input type="number" required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedManagerView;
