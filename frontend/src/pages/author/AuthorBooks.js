import React, { useState, useEffect } from 'react';
import axios from 'axios';

const statusBadge = (status) => {
  if (!status) return <span className="badge badge-production">Unknown</span>;
  if (status === 'Published & Live') return <span className="badge badge-live">✓ Live</span>;
  return <span className="badge badge-production">⚙ {status}</span>;
};

export default function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/books/my').then(r => { setBooks(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const totalEarned = books.reduce((s, b) => s + (b.total_royalty_earned || 0), 0);
  const totalPending = books.reduce((s, b) => s + (b.royalty_pending || 0), 0);
  const totalSold = books.reduce((s, b) => s + (b.total_copies_sold || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Books</h1>
          <p>Your published titles and royalty overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="value">{books.length}</div><div className="label">Total Books</div></div>
        <div className="stat-card blue"><div className="value">{totalSold.toLocaleString()}</div><div className="label">Copies Sold</div></div>
        <div className="stat-card green"><div className="value">₹{totalEarned.toLocaleString()}</div><div className="label">Total Royalty Earned</div></div>
        <div className="stat-card red"><div className="value royalty-pending">₹{totalPending.toLocaleString()}</div><div className="label">Royalty Pending</div></div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state"><div className="icon">📚</div><p>No books found</p></div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-card-header">
                <div>
                  <div className="book-card-title">{book.title}</div>
                  <div className="book-card-genre">{book.genre}</div>
                </div>
                {statusBadge(book.status)}
              </div>

              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                <span>ISBN: {book.isbn}</span>
                {book.publication_date && <span style={{ marginLeft: 10 }}>Published: {book.publication_date}</span>}
              </div>

              {book.status === 'Published & Live' ? (
                <>
                  <div className="book-stats">
                    <div className="book-stat">
                      <div className="val">₹{book.mrp}</div>
                      <div className="lbl">MRP</div>
                    </div>
                    <div className="book-stat">
                      <div className="val">{book.total_copies_sold}</div>
                      <div className="lbl">Copies Sold</div>
                    </div>
                    <div className="book-stat">
                      <div className="val">₹{book.total_royalty_earned?.toLocaleString()}</div>
                      <div className="lbl">Total Earned</div>
                    </div>
                    <div className="book-stat">
                      <div className={`val ${book.royalty_pending > 0 ? 'royalty-pending' : 'royalty-clear'}`}>
                        ₹{book.royalty_pending?.toLocaleString()}
                      </div>
                      <div className="lbl">Pending</div>
                    </div>
                  </div>
                  {book.last_royalty_payout_date && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Last payout: {book.last_royalty_payout_date}</div>
                  )}
                  <div className="platforms" style={{ marginTop: 10 }}>
                    {book.available_on?.map(p => <span key={p} className="platform-tag">{p}</span>)}
                  </div>
                </>
              ) : (
                <div className="alert alert-info" style={{ marginTop: 10, fontSize: 13 }}>
                  📋 Book is currently in production. You will be notified at each stage.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
