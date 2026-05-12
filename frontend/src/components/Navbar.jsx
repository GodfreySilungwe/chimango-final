import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/activities', label: 'Experiences', icon: '🗺️' },
    { path: '/about', label: 'About', icon: '🌟' },
    { path: '/contact', label: 'Contact', icon: '📞' },
  ];

  const getNavLinkClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav ref={navRef} className={`luxury-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-mark">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 8L28 10L22 16L24 24L16 20L8 24L10 16L4 10L12 8L16 2Z" fill="#d4a373" stroke="#1a472a" strokeWidth="1.5"/>
              <circle cx="16" cy="13" r="3" fill="#1a472a"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Chimango</span>
            <span className="logo-tagline">Tours and Safari</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={getNavLinkClass(link.path)}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-text">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="nav-actions">
          {/* Search Toggle (Optional) */}
          <button className="nav-action-btn search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="nav-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>

          {/* Bookings */}
          <Link to="/bookings" className="nav-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-avatar">
                  {user.fullName?.[0] || 'U'}
                </div>
                <span className="user-name">{user.fullName?.split(' ')[0]}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/bookings" className="dropdown-item">
                    <span>📋</span> My Bookings
                  </Link>
                  <Link to="/wishlist" className="dropdown-item">
                    <span>❤️</span> Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item admin">
                      <span>⚙️</span> Admin Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">Sign In</Link>
              <Link to="/register" className="auth-btn register-btn">Join Us</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-container">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-link-icon">{link.icon}</span>
              <span className="mobile-link-text">{link.label}</span>
            </Link>
          ))}
          
          <div className="mobile-menu-divider"></div>
          
          <Link to="/wishlist" className="mobile-nav-link">
            <span className="mobile-link-icon">❤️</span>
            <span className="mobile-link-text">Wishlist</span>
          </Link>
          
          <Link to="/bookings" className="mobile-nav-link">
            <span className="mobile-link-icon">📋</span>
            <span className="mobile-link-text">My Bookings</span>
          </Link>
          
          {user ? (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <span className="mobile-link-icon">👤</span>
                <span className="mobile-link-text">Profile</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link">
                  <span className="mobile-link-icon">⚙️</span>
                  <span className="mobile-link-text">Admin</span>
                </Link>
              )}
              <button onClick={handleLogout} className="mobile-logout-btn">
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="mobile-auth-btn login" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="mobile-auth-btn register" onClick={() => setIsMobileMenuOpen(false)}>
                Join Us
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;