import React, { useEffect, useState } from 'react';
import { ShoppingCart, DollarSign, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../../../components/dashboard/common/StatCard';
import DashboardTable from '../../../components/dashboard/common/DashboardTable';
import styles from './DashboardViews.module.css';
import { API, myFetch } from "../../../api";

const OverviewView = () => {
  const token = localStorage.getItem("token");

  const [recentUsers, setRecentUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers7Days, setActiveUsers7Days] = useState(0);

  const [totalOrders7d, setTotalOrders7d] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales7d, setTotalSales7d] = useState(0);
  const [TotalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await myFetch(`${API}/api/users/get`, { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        setTotalUsers(data.length);

        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);

        setActiveUsers7Days(data.filter(u => u.lastactive && new Date(u.lastactive) >= weekAgo).length);
        setRecentUsers(data.filter(u => u.lastactive && new Date(u.lastactive) >= monthAgo));
      } catch (e) { console.error("users", e); }
    })();
  }, []);

  useEffect(() => {
  (async () => {
    try {
      const res = await myFetch(`${API}/api/orders/getall`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orders = await res.json();
      const allItems = orders.flatMap(o => o.orderItems || []);

      // remove cancelled/canceled orders
      const validOrders = allItems.filter((o) => {
          const s = (o.status || o.Status || "").toLowerCase();
          return s !== "canceled" && s !== "cancelled";
        })

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recent = validOrders.filter(
        i => i.orderDate && new Date(i.orderDate) >= weekAgo
      );

      setTotalOrders7d(recent.length);
      setTotalOrders(validOrders.length);

      setTotalSales7d(
        recent.reduce((s, i) => s + (i.price || 0), 0)
      );

      setTotalSales(
        validOrders.reduce((s, i) => s + (i.price || 0), 0)
      );

      const buckets = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        const key = d.toISOString().slice(0, 10);

        buckets[key] = {
          day: key.slice(5),
          sales: 0,
          orders: 0
        };
      }

      recent.forEach(i => {
        const key = new Date(i.orderDate)
          .toISOString()
          .slice(0, 10);

        if (buckets[key]) {
          buckets[key].sales += i.price || 0;
          buckets[key].orders += 1;
        }
      });

      setChartData(Object.values(buckets));
    } catch (e) {
      console.error("orders", e);
    }
  })();
}, []);

  const recentUsersCols = [
    { header: 'User', accessor: 'userName' },
    { header: 'Email', accessor: 'userEmail' },
    { header: 'Role', accessor: 'userRole' },
    { header: 'Last Active', render: (r) => r.lastactive ? new Date(r.lastactive).toLocaleDateString() : 'Never' },
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2>Overview</h2>
        <p>System summary and recent activities.</p>
      </div>

      <div className={styles.sectionHeader}><h3>Stats Cards</h3></div>
      <div className={styles.statsGrid}>
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} text="Last 7 days" value1={totalOrders7d} />
        <StatCard title="Total Sales" value={`${TotalSales.toLocaleString()} DZD`} icon={DollarSign} text="Last 7 days" value1={`${totalSales7d.toLocaleString()} DZD`} />
        <StatCard title="Users" value={totalUsers} icon={Users} text="Active this week" value1={activeUsers7Days} />
      </div>

      <div className={styles.sectionHeader}><h3>Sales Graph</h3></div>
      <div className={styles.chartSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Sale Analytic</h3>
            <select><option>Last 7 Days</option></select>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {chartData.length === 0 ? (
              <p className={styles.chartPlaceholderText}>No data available for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v, name) => name === 'sales' ? `${v.toLocaleString()} DZD` : v} />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}><h3>Recently Active Users</h3></div>
      <DashboardTable columns={recentUsersCols} data={recentUsers} emptyStateMessage="No active users in last 30 days." />
    </div>
  );
};

export default OverviewView;