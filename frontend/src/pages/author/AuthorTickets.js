import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const statusClass = { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
const priorityClass = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

export default function AuthorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();
  const { onEvent, offEvent } = useSocket();

  const fetchTickets = useCallback(() => {
    axios.get('/api/tickets/my').then(r => { setTickets(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTickets();
    const handler = (data) => {
      setNotification(`Ticket ${data.ticketNumber} has a new response!`);
      fetchTickets();
      setTimeout(() => setNotification(''), 4000);
    };
    onEvent('ticket_response', handler);
    return () => offEvent('ticket_response', handler);
  }, [fetchTickets, onEvent, offEvent]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>My Support Tickets</h1><p>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p></div>
        <button className="btn btn-primary" onClick={() => navigate('/author/new-ticket')}>+ New Query</button>
      </div>

      {notification && <div className="alert alert-success">🔔 {notification}</div>}

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎫</div>
          <p>No tickets yet</p>
          <small>Submit a query if you need help</small>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td style={{ fontWeight: 600, color: '#f59e0b' }}>{ticket.ticketId}</td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontWeight: 500 }}>{ticket.subject}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{ticket.description.substring(0, 60)}...</div>
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{ticket.bookTitle}</td>
                    <td style={{ fontSize: 12 }}>{ticket.category}</td>
                    <td><span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span></td>
                    <td><span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span></td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate(`/author/tickets/${ticket._id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
