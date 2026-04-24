import React, { useState } from 'react';
import { Plus, Edit, Ban, X, Trash2 } from 'lucide-react';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const UsersManagerView = () => {
  const [users] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', render: (row) => (
        <span className={row.status === 'Active' ? styles.statusLive : styles.statusDraft}>
          {row.status}
        </span>
      ) 
    },
    { header: 'Actions', align: 'right', render: () => (
        <div className={styles.actionButtons}>
            <button className={styles.actionBtnEdit} title="Edit User" onClick={() => setIsModalOpen(true)}><Edit size={16} /></button>
            <button className={styles.actionBtnDelete} title="Suspend User"><Ban size={16} /></button>
            <button className={styles.actionBtnDelete} title="Delete User"><Trash2 size={16} /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeaderWithAction}>
        <div>
          <h2>User Management</h2>
          <p>View, edit, and manage system access for all users.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add User
        </button>
      </div>

      <DashboardTable columns={columns} data={users} emptyStateMessage="No users found." />

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>User Details</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form className={styles.modalForm} onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" required />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" required />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select>
                  <option value="Admin">Admin</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagerView;
