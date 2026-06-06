import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__brand-icon">✦</div>
          SocialFeed
        </Link>

        {/* Right side */}
        <div className="navbar__actions">
          {user ? (
            <>
              <span className="navbar__username">@{user.username}</span>
              <button className="navbar__logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="navbar__link">Login</Link>
              <Link to="/signup" className="navbar__link navbar__link--primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;