import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import AuthorBooks from './pages/author/AuthorBooks';
import AuthorTickets from './pages/author/AuthorTickets';
import AuthorTicketDetail from './pages/author/AuthorTicketDetail';
import NewTicket from './pages/author/NewTicket';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminTicketDetail from './pages/admin/AdminTicketDetail';
import AdminAuthors from './pages/admin/AdminAuthors';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/author/books'} />;
  return children;
};

const Layout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/author/books'} /> : <Login />} />

      {/* Author Routes */}
      <Route path="/author/books" element={<PrivateRoute role="author"><Layout><AuthorBooks /></Layout></PrivateRoute>} />
      <Route path="/author/tickets" element={<PrivateRoute role="author"><Layout><AuthorTickets /></Layout></PrivateRoute>} />
      <Route path="/author/tickets/:id" element={<PrivateRoute role="author"><Layout><AuthorTicketDetail /></Layout></PrivateRoute>} />
      <Route path="/author/new-ticket" element={<PrivateRoute role="author"><Layout><NewTicket /></Layout></PrivateRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/tickets" element={<PrivateRoute role="admin"><Layout><AdminTickets /></Layout></PrivateRoute>} />
      <Route path="/admin/tickets/:id" element={<PrivateRoute role="admin"><Layout><AdminTicketDetail /></Layout></PrivateRoute>} />
      <Route path="/admin/authors" element={<PrivateRoute role="admin"><Layout><AdminAuthors /></Layout></PrivateRoute>} />

      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
