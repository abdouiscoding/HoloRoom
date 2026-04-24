import React from 'react';
import styles from './DashboardCommon.module.css';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <div className={styles.statIconWrapper}>
          <Icon size={24} className={styles.statIcon} />
        </div>
        {trend && (
          <div className={`${styles.statTrend} ${trend > 0 ? styles.positive : styles.negative}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className={styles.statBody}>
        <h4 className={styles.statTitle}>{title}</h4>
        <p className={styles.statValue}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
