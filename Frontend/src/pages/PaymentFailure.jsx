import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.wrap}>
      <XCircle size={72} color="#ef4444" />
      <h1 style={styles.h1}>Payment failed</h1>
      <p style={styles.p}>Your payment didn't go through. Press the button to go back to the website or just close the website and continue from the app</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button style={styles.btnPrimary} onClick={() => navigate('/cart')}>Back to cart</button>
        <button style={styles.btnSecondary} onClick={() => navigate('/shop')}>Keep shopping</button>
      </div>
    </div>
  );
};

const styles = {
  wrap: { minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '5rem 1rem' },
  h1: { margin: 0, color: '#222' },
  p: { color: '#666', textAlign: 'center', maxWidth: 400 },
  btnPrimary: { background: '#222', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: 999, fontWeight: 700, cursor: 'pointer' },
  btnSecondary: { background: 'transparent', color: '#222', border: '1px solid #ccc', padding: '0.85rem 1.5rem', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }
};

export default PaymentFailure;