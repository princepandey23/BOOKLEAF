import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/authors').then(r => { setAuthors(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Authors</h1><p>{authors.length} authors on the platform</p></div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Author ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {authors.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 600, color: '#f59e0b', fontSize: 12 }}>{a.author_id}</td>
                  <td style={{ fontWeight: 500 }}>{a.name}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{a.email}</td>
                  <td style={{ fontSize: 13 }}>{a.phone}</td>
                  <td>{a.city}</td>
                  <td style={{ fontSize: 12, color: '#9ca3af' }}>{a.joined_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
