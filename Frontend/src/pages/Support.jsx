import { LifeBuoy, Send, MessageSquare, CheckCircle } from 'lucide-react';
import styles from './Support.module.css';
import { API, myFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const TOPICS = [
  { value: '', label: 'Select a topic' },
  { value: 'Bug report', label: 'Bug Report' },
  { value: 'Order issue', label: 'Order Issue' },
  { value: 'Product question', label: 'Product Question' },
  { value: 'Shipping issue', label: 'Shipping Issue' },
  { value: 'Payment issue', label: 'Payment Issue' },
  { value: 'Account issue', label: 'Account Issue' },
  { value: 'AR / 3D model issue', label: 'AR / 3D Model Issue' },
  { value: 'Feature request', label: 'Feature Request' },
  { value: 'Other', label: 'Other' },
];

function getExtraField(topic) {
  if (['Order issue', 'Shipping issue', 'Payment issue'].includes(topic))
    return { label: 'Order ID', placeholder: 'e.g. 1284' };
  if (['Product question', 'AR / 3D model issue'].includes(topic))
    return { label: 'Product name', placeholder: 'e.g. Velvet Sofa' };
  if (topic === 'Bug report')
    return { label: 'Where it happened', placeholder: 'e.g. Cart checkout, AR viewer' };
  return null;
}

const Support = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login', { state: { from: '/support' } });
    }
  }, [navigate]);
  const [topic, setTopic] = useState('');
  const [extra, setExtra] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const userId = localStorage.getItem('userId');
  const extraField = getExtraField(topic);

  const validate = () => {
    if (!topic) return 'Please select a topic';
    if (!title.trim()) return 'Please enter a subject';
    if (message.trim().length < 10) return 'Please describe your issue (at least 10 characters)';
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { alert(err); return; }
    setConfirm(true);
  };

  const send = async () => {
    setConfirm(false);
    setSending(true);

    let fullMessage = message.trim();
    if (extra.trim() && extraField) {
      fullMessage = `${extraField.label}: ${extra.trim()}\n\n${fullMessage}`;
    }

    try {
      const res = await myFetch(`${API}/api/support/messages/create`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          Title: title.trim(),
          message: fullMessage,
          userId: parseInt(localStorage.getItem('userId')),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
      setTopic(''); setExtra(''); setTitle(''); setMessage('');
    } catch (e) {
      alert(e.message || 'An error occurred while sending your ticket. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.supportPage}>
      <section className={styles.hero}>
        <div className={styles.heroIcon}><LifeBuoy size={36} /></div>
        <h1 className={styles.heroTitle}>How can we help?</h1>
        <p className={styles.heroSubtitle}>
          Open a ticket about any problem you're running into and our team will get back to you as soon as possible.
        </p>
      </section>

      {sent && (
        <div className={styles.successBanner}>
          <CheckCircle size={18} />
          <span>Your ticket has been sent. We'll receive an email once one of our staff members responds.</span>
        </div>
      )}

      <section className={styles.formCard}>
        <label className={styles.field}>
          <span>Topic</span>
          <select value={topic} onChange={(e) => { setTopic(e.target.value); setExtra(''); }}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value} disabled={t.value === ''}>{t.label}</option>
            ))}
          </select>
        </label>

        {extraField && (
          <label className={styles.field}>
            <span>{extraField.label} <em>(optional)</em></span>
            <input
              type="text"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder={extraField.placeholder}
            />
          </label>
        )}

        <label className={styles.field}>
          <span>Subject</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of the issue"
            maxLength={120}
          />
        </label>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened, when it started, and any steps to reproduce it..."
            rows={8}
          />
        </label>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={sending}
        >
          <Send size={18} /> {sending ? 'Sending...' : 'Submit Ticket'}
        </button>
      </section>

      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>Send this ticket?</h3>
            <p>Your request will be sent to the HoloRoom support team.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(false)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={send}><Send size={16} /> Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;