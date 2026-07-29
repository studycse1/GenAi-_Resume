import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand" onClick={() => navigate('/')} id="nav-brand-logo">
          <span className="logo-icon">📄</span>
          <h2>GenAI Resume</h2>
        </div>

        {/* Right side controls */}
        <div className="navbar-controls">
          {/* Theme Toggle Button */}
          <button 
            type="button" 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            id="btn-theme-toggle"
          >
            {theme === 'light' ? (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
            )}
          </button>

          {/* Hamburger Menu */}
          <div className="hamburger" onClick={toggleMenu} id="nav-hamburger">
            <span className={isMenuOpen ? 'active' : ''}></span>
            <span className={isMenuOpen ? 'active' : ''}></span>
            <span className={isMenuOpen ? 'active' : ''}></span>
          </div>

          {/* Navigation Menu */}
          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} id="nav-menu-list">
            <li>
              <button
                className="nav-link"
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                id="link-home"
              >
                Home
              </button>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <button
                    className="nav-link"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    id="link-login"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    className="nav-link nav-register"
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                    id="link-register"
                  >
                    Sign Up
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    className="nav-link"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    id="link-dashboard"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button className="nav-link nav-logout" onClick={handleLogout} id="link-logout">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
