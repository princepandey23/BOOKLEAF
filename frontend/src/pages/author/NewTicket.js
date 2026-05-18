import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewTicket() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/books/my').then(r => setBooks(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('/api/tickets', { bookId, subject, description });
      setSuccess(true);
      setTimeout(() => navigate('/author/tickets'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
    }
    setLoading(false);
  };

  if (success) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="icon">✅</div>
      <p>Ticket submitted successfully!</p>
      <small>Redirecting to your tickets...</small>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h1>New Support Query</h1><p>Our team will respond within 24–48 hours</p></div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-header"><h2>Submit a Support Request</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Related Book (optional)</label>
              <select value={bookId} onChange={e => setBookId(e.target.value)}>
                <option value="general">General / Account Level</option>
                {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" required />
            </div>
            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Please describe your issue in detail. Include any relevant dates, amounts, or order numbers." rows={5} required />
            </div>
            <div className="form-group">
              <label>Attachment (UI Only)</label>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" />
              <small style={{ color: '#9ca3af', fontSize: 12 }}>Optional — photos of print defects, screenshots, etc.</small>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/author/tickets')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
