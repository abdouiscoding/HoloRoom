import React from 'react';
import styles from './DashboardCommon.module.css';

const DashboardTable = ({ columns, data, emptyStateMessage }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyTableState}>
        <div className={styles.emptyIcon}>📂</div>
        <p>{emptyStateMessage || "No data available."}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;
