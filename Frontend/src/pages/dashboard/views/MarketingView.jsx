import React, { useState } from 'react';
import { Percent, Star, X } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const MarketingView = () => {
  const [modalType, setModalType] = useState(null); // 'campaign' | null
  const [campaignScope, setCampaignScope] = useState('sitewide');

  const openModal = (type) => {
    setModalType(type);
    if (type === 'campaign') setCampaignScope('sitewide');
  };
  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>Discount Campaigns</h2>
          <p>Manage discounts and site-wide sales.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => openModal('campaign')}>
            <Percent size={18} /> Create Campaign
        </button>
      </div>



      <div className={styles.sectionHeader}>
        <h3>Active Campaigns</h3>
      </div>
      
      <DashboardTable columns={[]} data={[]} emptyStateMessage="No active discount campaigns at the moment." />

      {modalType && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create Discount Campaign</h3>
              <button onClick={() => setModalType(null)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form className={styles.modalForm} onSubmit={(e) => { e.preventDefault(); setModalType(null); }}>
              <div className={styles.formGroup}>
                    <label>Campaign Name</label>
                    <input type="text" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Discount Percentage (%)</label>
                    <input type="text" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Campaign Scope</label>
                    <select value={campaignScope} onChange={(e) => setCampaignScope(e.target.value)}>
                      <option value="sitewide">Site-wide</option>
                      <option value="specific">Specific Product</option>
                    </select>
                  </div>
                  {campaignScope === 'specific' && (
                    <div className={styles.formGroup}>
                      <label>Select Product</label>
                      <select required>
                        <option value="">-- Choose Product --</option>
                        <option value="1">Velvet Accent Chair</option>
                        <option value="2">Minimalist Floor Lamp</option>
                        <option value="3">Modern Oak Desk</option>
                      </select>
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingView;
