import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    const t = setTimeout(() => navigate('/profile'), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.wrap}>
      <CheckCircle size={72} color="#22c55e" />
      <h1 style={styles.h1}>Payment successful</h1>
      <p style={styles.p}>Order added. Press the button to go back to the website or just close the website and continue from the app</p>
      <button style={styles.btn} onClick={() => navigate('/profile')}>Back to website</button>
    </div>
  );
};

const styles = {
  wrap: { minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '5rem 1rem' },
  h1: { margin: 0, color: '#222' },
  p: { color: '#666', textAlign: 'center', maxWidth: 400 },
  btn: { background: '#22c55e', color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }
};

export default PaymentSuccess;