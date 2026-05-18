import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthorNav = () => (
  <nav className="sidebar-nav">
    <NavLink to="/author/books" className={({ isActive }) => isActive ? 'active' : ''}>📚 My Books</NavLink>
    <NavLink to="/author/tickets" className={({ isActive }) => isActive ? 'active' : ''}>🎫 My Tickets</NavLink>
    <NavLink to="/author/new-ticket" className={({ isActive }) => isActive ? 'active' : ''}>✉️ New Support Query</NavLink>
  </nav>
);

const AdminNav = () => (
  <nav className="sidebar-nav">
    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>📊 Dashboard</NavLink>
    <NavLink to="/admin/tickets" className={({ isActive }) => isActive ? 'active' : ''}>🎫 Ticket Queue</NavLink>
    <NavLink to="/admin/authors" className={({ isActive }) => isActive ? 'active' : ''}>👥 Authors</NavLink>
  </nav>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>📚 BookLeaf</h1>
        <p>{user?.role === 'admin' ? 'Admin Portal' : 'Author Portal'}</p>
      </div>
      {user?.role === 'admin' ? <AdminNav /> : <AuthorNav />}
      <div className="sidebar-user">
        <div className="name">{user?.name}</div>
        <div className="role">{user?.role}</div>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}
