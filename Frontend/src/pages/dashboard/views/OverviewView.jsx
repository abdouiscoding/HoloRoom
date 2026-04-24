import React from 'react';
import { ShoppingCart, DollarSign, Users } from 'lucide-react';
import StatCard from '../../../components/dashboard/common/StatCard';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';

const OverviewView = () => {
  const recentUsersCols = [
    { header: 'User', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', render: (row) => <span className={styles.statusLive}>{row.status}</span> }
  ];

  const recentUsersData = [];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2>Overview</h2>
        <p>System summary and recent activities.</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Total Sales" value="0 DZD" icon={ShoppingCart} trend={0} />
        <StatCard title="Total Orders" value="0" icon={ShoppingCart} trend={0} />
        <StatCard title="Total Revenue" value="0 DZD" icon={DollarSign} trend={0} />
        <StatCard title="New Customers" value="0" icon={Users} trend={0} />
      </div>

      <div className={styles.chartSection}>
         
         <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
                <h3>Sale Analytic</h3>
                <select><option>Last 7 Days</option></select>
            </div>
            <div className={styles.chartMockArea}>
               <p className={styles.chartPlaceholderText}>No analytic data available for this period.</p>
            </div>
         </div>
      </div>

      <div className={styles.sectionHeader}>
        <h3>Recent Users</h3>
      </div>
      <DashboardTable columns={recentUsersCols} data={recentUsersData} emptyStateMessage="No recent users found." />
    </div>
  );
};

export default OverviewView;
