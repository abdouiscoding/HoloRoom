import React, { useEffect, useState } from 'react';
import { Send, Inbox, Filter } from 'lucide-react';
import styles from './DashboardViews.module.css';
import { API, myFetch } from '../../../api';

const SupportManagerView = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem('token');

  const fetchMessages = async () => {
    try {
      const res = await myFetch(`${API}/api/support/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const filtered = messages.filter(m =>
    filter === 'All' ? true : m.status === filter
  );

  const sendResponse = async () => {
    if (!response.trim()) { alert('Response cannot be empty'); return; }
    setSending(true);
    try {
      const res = await myFetch(`${API}/api/support/messages/respond/${active.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: response.trim() }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      alert('Email sent to user');
      setActive(null);
      setResponse('');
      fetchMessages();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2><Inbox size={22} style={{verticalAlign:'-4px',marginRight:8}}/>Support Tickets</h2>
        <p>Respond to user support requests. The response is emailed to the user.</p>
      </div>

      <div className={styles.filterRow}>
        <Filter size={16} />
        <button
          className={styles.secondaryBtn}
          onClick={() => setFilter(p =>
            p === 'All' ? 'Open' : p === 'Open' ? 'Responded' : 'All'
          )}
        >
          {filter}
        </button>
        <span style={{ opacity: 0.6 }}>{filtered.length} ticket(s)</span>
      </div>

      <div className={styles.supportList}>
        {filtered.length === 0 && <p style={{opacity:0.6}}>No tickets in this filter.</p>}
        {filtered.map(m => (
          <div key={m.id} className={styles.supportCard} onClick={() => { setActive(m); setResponse(''); }}>
            <div className={styles.supportCardTop}>
              <span className={styles.supportTopic}>{m.topic}</span>
              <span className={m.status === 'Open' ? styles.statusOpen : styles.statusResponded}>
                {m.status}
              </span>
            </div>
            <h4 className={styles.supportTitle}>{m.title}</h4>
            <p className={styles.supportPreview}>{m.message?.slice(0, 140)}{m.message?.length > 140 ? '...' : ''}</p>
            <div className={styles.supportMeta}>
              User #{m.userId}
              {m.date && ` · ${new Date(m.date).toLocaleString()}`}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className={styles.modalOverlay} onClick={() => setActive(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{active.topic}: {active.title}</h3>
            <div className={styles.supportMeta} style={{marginBottom:'1rem'}}>
              From User #{active.userId} · Status: {active.status}
            </div>

            <div className={styles.supportOriginal}>
              <strong>Original message</strong>
              <pre>{active.message}</pre>
            </div>

            {active.status === 'Open' ? (
            <>
                <div className={styles.responseField}>
                <label>Your response <em>(will be emailed to the user)</em></label>
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={8}
                    placeholder="Write your reply to the user..."
                />
                </div>
                <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={() => setActive(null)}>Cancel</button>
                <button className={styles.primaryBtn} disabled={sending} onClick={sendResponse}>
                    <Send size={16}/> {sending ? 'Sending...' : 'Send Response'}
                </button>
                </div>
            </>
            ) : (
            <div style={{opacity:0.7, padding:'1rem 0'}}>This ticket has already been responded to.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagerView;