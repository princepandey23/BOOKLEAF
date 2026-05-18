import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const statusClass = { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
const priorityClass = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
  const navigate = useNavigate();
  const { onEvent, offEvent } = useSocket();

  const fetchTickets = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    axios.get(`/api/admin/tickets?${params}`).then(r => { setTickets(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const handler = () => fetchTickets();
    onEvent('new_ticket', handler);
    onEvent('ticket_updated', handler);
    return () => { offEvent('new_ticket', handler); offEvent('ticket_updated', handler); };
  }, [fetchTickets, onEvent, offEvent]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Ticket Queue</h1><p>{tickets.length} tickets</p></div>
      </div>

      <div className="filters">
        <input placeholder="Search by subject..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'].map(c => <option key={c}>{c}</option>)}
        </select>
        {(filters.status || filters.priority || filters.category || filters.search) && (
          <button className="btn btn-secondary" onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}>Clear</button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state"><div className="icon">🎫</div><p>No tickets found</p></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Author</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td style={{ fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>{ticket.ticketId}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{ticket.author?.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{ticket.author?.city}</div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{ticket.subject}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{ticket.bookTitle}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{ticket.category}</td>
                    <td><span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span></td>
                    <td><span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span></td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{ticket.assignedTo?.name || '—'}</td>
                    <td style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate(`/admin/tickets/${ticket._id}`)}>Open</button></td>
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
