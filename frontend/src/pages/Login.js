import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('author');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/author/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@bookleaf.com'); setPassword('admin123'); }
    else { setEmail('priya.sharma@email.com'); setPassword('author123'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">
          <h1>📚 BookLeaf</h1>
          <p>Publishing Portal</p>
        </div>
        <div className="auth-tabs">
          <button className={tab === 'author' ? 'active' : ''} onClick={() => { setTab('author'); fillDemo('author'); }}>Author Portal</button>
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => { setTab('admin'); fillDemo('admin'); }}>Admin Portal</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : `Sign in as ${tab === 'admin' ? 'Admin' : 'Author'}`}
          </button>
        </form>
        <div style={{ marginTop: 20, background: '#f9fafb', borderRadius: 8, padding: 12, fontSize: 12, color: '#6b7280' }}>
          <strong>Demo Credentials:</strong><br />
          Admin: admin@bookleaf.com / admin123<br />
          Author: priya.sharma@email.com / author123<br />
          <em>All authors use password: author123</em>
        </div>
      </div>
    </div>
  );
}
