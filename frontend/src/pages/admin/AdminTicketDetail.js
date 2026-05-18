import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const statusClass = { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
const priorityClass = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };
const CATEGORIES = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { joinTicketRoom, onEvent, offEvent } = useSocket();

  const fetchTicket = useCallback(() => {
    axios.get(`/api/tickets/${id}`).then(r => { setTicket(r.data); setLoading(false); }).catch(() => navigate('/admin/tickets'));
  }, [id, navigate]);

  useEffect(() => {
    fetchTicket();
    joinTicketRoom(id);
    const handler = () => fetchTicket();
    onEvent('ticket_updated', handler);
    return () => offEvent('ticket_updated', handler);
  }, [id, fetchTicket, joinTicketRoom, onEvent, offEvent]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages]);

  const generateDraft = async () => {
    setAiLoading(true); setAiError('');
    try {
      const { data } = await axios.get(`/api/admin/tickets/${id}/draft`);
      if (data.draft) { setAiDraft(data.draft); setReply(data.draft); }
      else setAiError(data.error || 'Could not generate AI draft.');
    } catch { setAiError('AI service unavailable. Please write manually.'); }
    setAiLoading(false);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await axios.post(`/api/admin/tickets/${id}/respond`, { content: reply, isInternal });
      setReply(''); setAiDraft('');
      fetchTicket();
    } catch { alert('Failed to send response'); }
    setSending(false);
  };

  const updateTicket = async (field, value) => {
    setUpdateLoading(true);
    try {
      const { data } = await axios.patch(`/api/admin/tickets/${id}`, { [field]: value });
      setTicket(data);
    } catch {}
    setUpdateLoading(false);
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!ticket) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: 8, fontSize: 12 }} onClick={() => navigate('/admin/tickets')}>← Back to Queue</button>
          <h1>{ticket.ticketId}: {ticket.subject}</h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>{ticket.bookTitle} • {ticket.author?.name} ({ticket.author?.city})</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${statusClass[ticket.status]}`}>{ticket.status}</span>
          <span className={`badge ${priorityClass[ticket.priority]}`}>{ticket.priority}</span>
        </div>
      </div>

      <div className="ticket-detail">
        {/* LEFT COLUMN */}
        <div>
          {/* Original query */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h2>Author's Query</h2></div>
            <div className="card-body">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>{ticket.description}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h2>Conversation</h2><span style={{ fontSize: 12, color: '#9ca3af' }}>{ticket.messages.length} messages</span></div>
            <div className="card-body">
              {ticket.messages.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}><p>No messages yet</p></div>
              ) : (
                <div className="messages-container">
                  {ticket.messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'admin' ? 'flex-start' : 'flex-end' }}>
                      <div className={`message-bubble ${msg.isInternal ? 'internal' : msg.sender}`}>
                        <div className="message-meta">
                          {msg.isInternal ? '🔒 Internal Note — ' : ''}{msg.senderName} • {new Date(msg.createdAt).toLocaleString()}
                        </div>
                        <div className="message-content">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Reply box */}
          <div className="card">
            <div className="card-header"><h2>Reply</h2></div>
            <div className="card-body">
              {/* AI Draft */}
              <div className="ai-draft">
                <div className="ai-draft-header">
                  ✨ AI-Assisted Response
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px', marginLeft: 'auto' }} onClick={generateDraft} disabled={aiLoading}>
                    {aiLoading ? 'Generating...' : aiDraft ? 'Regenerate' : 'Generate Draft'}
                  </button>
                </div>
                {aiError && <div className="alert alert-error" style={{ marginBottom: 0, fontSize: 13 }}>{aiError}</div>}
                {!aiError && !aiDraft && <p style={{ fontSize: 13, color: '#92400e' }}>Click "Generate Draft" for an AI-suggested response based on the knowledge base.</p>}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <button className={`btn ${!isInternal ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: 13 }} onClick={() => setIsInternal(false)}>📤 Reply to Author</button>
                <button className={`btn ${isInternal ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: 13 }} onClick={() => setIsInternal(true)}>🔒 Internal Note</button>
              </div>
              <div className="form-group">
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={5} placeholder={isInternal ? 'Add an internal note (not visible to author)...' : 'Write your response to the author...'} />
              </div>
              <button className="btn btn-primary" onClick={sendReply} disabled={sending || !reply.trim()}>
                {sending ? 'Sending...' : isInternal ? 'Add Note' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h2>Manage Ticket</h2></div>
            <div className="card-body">
              <div className="form-group">
                <label>Status</label>
                <select value={ticket.status} onChange={e => updateTicket('status', e.target.value)} disabled={updateLoading}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category {ticket.aiCategory && <span style={{ fontSize: 11, color: '#9ca3af' }}>(AI: {ticket.aiCategory})</span>}</label>
                <select value={ticket.category} onChange={e => updateTicket('category', e.target.value)} disabled={updateLoading}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority {ticket.aiPriority && <span style={{ fontSize: 11, color: '#9ca3af' }}>(AI: {ticket.aiPriority})</span>}</label>
                <select value={ticket.priority} onChange={e => updateTicket('priority', e.target.value)} disabled={updateLoading}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button className="btn btn-success btn-full" onClick={() => updateTicket('assignedTo', 'me')} disabled={updateLoading}>
                {ticket.assignedTo ? `✓ Assigned to: ${ticket.assignedTo.name}` : 'Assign to Me'}
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h2>Author Info</h2></div>
            <div className="card-body">
              {[['Name', ticket.author?.name], ['Email', ticket.author?.email], ['City', ticket.author?.city]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {ticket.book && (
            <div className="card">
              <div className="card-header"><h2>Book Data</h2></div>
              <div className="card-body">
                {[
                  ['Title', ticket.book.title], ['Status', ticket.book.status],
                  ['Copies Sold', ticket.book.total_copies_sold?.toLocaleString()],
                  ['Total Earned', `₹${ticket.book.total_royalty_earned?.toLocaleString()}`],
                  ['Royalty Paid', `₹${ticket.book.royalty_paid?.toLocaleString()}`],
                  ['Pending', `₹${ticket.book.royalty_pending?.toLocaleString()}`],
                  ['Last Payout', ticket.book.last_royalty_payout_date || 'Never']
                ].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
