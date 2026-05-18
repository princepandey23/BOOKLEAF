import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const statusClass = { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
const priorityClass = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

export default function AuthorTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { joinTicketRoom, onEvent, offEvent } = useSocket();

  const fetchTicket = useCallback(() => {
    axios.get(`/api/tickets/${id}`).then(r => { setTicket(r.data); setLoading(false); }).catch(() => { navigate('/author/tickets'); });
  }, [id, navigate]);

  useEffect(() => {
    fetchTicket();
    joinTicketRoom(id);
    const handler = (data) => {
      if (data.ticketId === id) fetchTicket();
    };
    onEvent('ticket_update', handler);
    return () => offEvent('ticket_update', handler);
  }, [id, fetchTicket, joinTicketRoom, onEvent, offEvent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!ticket) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: 8, fontSize: 12 }} onClick={() => navigate('/author/tickets')}>← Back to Tickets</button>
          <h1>{ticket.ticketId}: {ticket.subject}</h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>{ticket.bookTitle} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span>
          <span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h2>Original Query</h2></div>
            <div className="card-body">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>{ticket.description}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Conversation</h2></div>
            <div className="card-body">
              {ticket.messages.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}>
                  <p>No responses yet</p>
                  <small>Our team will respond within 24–48 hours</small>
                </div>
              ) : (
                <div className="messages-container">
                  {ticket.messages.map((msg, idx) => (
                    <div key={idx} style={{ alignSelf: msg.sender === 'author' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div className={`message-bubble ${msg.sender}`}>
                        <div className="message-meta">{msg.senderName || 'BookLeaf Support'} • {new Date(msg.createdAt).toLocaleString()}</div>
                        <div className="message-content">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><h2>Ticket Info</h2></div>
            <div className="card-body">
              {[['Category', ticket.category], ['Priority', ticket.priority], ['Status', ticket.status], ['Submitted', new Date(ticket.createdAt).toLocaleDateString()]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
