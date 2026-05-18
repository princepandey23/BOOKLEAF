import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const navigate = useNavigate();
  const { onEvent, offEvent } = useSocket();

  const fetchData = () => {
    axios.get('/api/admin/stats').then(r => setStats(r.data));
    axios.get('/api/admin/tickets?status=Open').then(r => setRecentTickets(r.data.slice(0, 5)));
  };

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    onEvent('new_ticket', handler);
    onEvent('ticket_updated', handler);
    return () => { offEvent('new_ticket', handler); offEvent('ticket_updated', handler); };
  }, [onEvent, offEvent]);

  const priorityClass = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

  return (
    <div>
      <div className="page-header">
        <div><h1>Dashboard</h1><p>BookLeaf Support Operations Overview</p></div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="value">{stats.total}</div><div className="label">Total Tickets</div></div>
          <div className="stat-card red"><div className="value">{stats.open}</div><div className="label">Open Tickets</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}><div className="value">{stats.inProgress}</div><div className="label">In Progress</div></div>
          <div className="stat-card green"><div className="value">{stats.resolved}</div><div className="label">Resolved</div></div>
          <div className="stat-card red"><div className="value">{stats.critical}</div><div className="label">Critical Priority</div></div>
          <div className="stat-card blue"><div className="value">{stats.totalAuthors}</div><div className="label">Total Authors</div></div>
          <div className="stat-card purple"><div className="value">{stats.totalBooks}</div><div className="label">Total Books</div></div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Urgent Open Tickets</h2>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate('/admin/tickets')}>View All</button>
        </div>
        <div className="table-container">
          {recentTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}><div className="icon">✅</div><p>No open tickets</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Author</th><th>Subject</th><th>Category</th><th>Priority</th><th>Opened</th><th></th></tr>
              </thead>
              <tbody>
                {recentTickets.map(t => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600, color: '#f59e0b' }}>{t.ticketId}</td>
                    <td style={{ fontSize: 13 }}>{t.author?.name}<br /><span style={{ color: '#9ca3af', fontSize: 11 }}>{t.author?.city}</span></td>
                    <td style={{ fontSize: 13 }}>{t.subject}</td>
                    <td style={{ fontSize: 12 }}>{t.category}</td>
                    <td><span className={`badge ${priorityClass[t.priority]}`}>{t.priority}</span></td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate(`/admin/tickets/${t._id}`)}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
