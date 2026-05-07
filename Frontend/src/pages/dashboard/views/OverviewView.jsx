import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Users } from 'lucide-react';
import StatCard from '../../../components/dashboard/common/StatCard';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';
import { API, address } from "../../../api";

const OverviewView = () => {
  const token = localStorage.getItem("token");

  const [recentUsers, setRecentUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers7Days, setActiveUsers7Days] = useState(0);

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/api/users/get`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        // TOTAL USERS
        setTotalUsers(data.length);

        // LAST 7 DAYS FILTER
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const weekactiveUsers = data.filter(u => {
          if (!u.lastactive) return false;
          return new Date(u.lastactive) >= sevenDaysAgo;
        });

        const monthactiveUsers = data.filter(u => {
          if (!u.lastactive) return false;
          return new Date(u.lastactive) >= monthAgo;
        });

        setActiveUsers7Days(weekactiveUsers.length);
        setRecentUsers(monthactiveUsers);

      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, []);

  // ================= TABLE =================
  const recentUsersCols = [
    { header: 'User', accessor: 'userName' },
    { header: 'Email', accessor: 'userEmail' },
    { header: 'Role', accessor: 'userRole' },
    {
      header: 'Last Active',
      render: (row) =>
        row.lastactive
          ? new Date(row.lastactive).toLocaleDateString()
          : 'Never'
    }
  ];

  return (
    <div className={styles.viewContainer}>

      {/* HEADER */}
      <div className={styles.viewHeader}>
        <h2>Overview</h2>
        <p>System summary and recent activities.</p>
      </div>

      <div className={styles.sectionHeader}>
        <h3>Stats Cards</h3>
      </div>
      {/* STATS */}
      <div className={styles.statsGrid}>
        <StatCard title="Total Orders" value="0" icon={ShoppingCart} text="Last 7 days" value1={0} />
        <StatCard title="Total Sales" value="0" icon={DollarSign} text="Last 7 days" value1={0} />
        <StatCard
          title="Users"
          value={totalUsers}
          icon={Users}
          text="Active this week"
          value1={activeUsers7Days}
        />
      </div>

      <div className={styles.sectionHeader}>
        <h3>Sales Graph</h3>
      </div>
      {/* GRAPH */}
      <div className={styles.chartSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Sale Analytic</h3>
            <select><option>Last 7 Days</option></select>
          </div>
          <div className={styles.chartMockArea}>
            <p className={styles.chartPlaceholderText}>
              No analytic data available for this period.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT USERS */}
      <div className={styles.sectionHeader}>
        <h3>Recently Active Users</h3>
      </div>

      <DashboardTable
        columns={recentUsersCols}
        data={recentUsers}
        emptyStateMessage="No active users in last 7 days."
      />

    </div>
  );
};

export default OverviewView;