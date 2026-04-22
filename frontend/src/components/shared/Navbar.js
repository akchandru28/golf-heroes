import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-text">Golf<span className="logo-accent">Heroes</span></span>
        </Link>

        <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/charities" className={`nav-link ${isActive('/charit') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Charities</Link>
          <Link to="/draws" className={`nav-link ${isActive('/draws') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Draws</Link>

          <ThemeToggle />

          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {isAdmin() && (
                <Link to="/admin" className={`nav-link nav-admin ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <div className="nav-user">
                <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                {isSubscribed() && <span className="badge badge-accent">Pro</span>}
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
