import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoginModal } from './LoginModal';
import RegistrationModal from './RegistrationModal';
import '../styles/Header.css';

export const Header = () => {
  const { user, logout, showLoginModal, openLoginModal, closeLoginModal } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    
    // Detect scroll for header styling
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  const switchToLogin = () => {
    setShowRegModal(false);
    openLoginModal();
  };

  const switchToRegister = () => {
    closeLoginModal();
    setShowRegModal(true);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    // The redirect will be handled by the logout function in AuthContext
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="header-layout">
      <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <Link to="/" className="logo">
              <span className="logo-text">Aada</span>
              <span className="logo-accent">Finance</span>
            </Link>
          </div>
          
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          
          <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
            
            {user ? (
              <>
                <NavLink to="/plans" className={({ isActive }) => isActive ? 'active' : ''}>
                  Pricing Plans
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                  My Profile
                </NavLink>
                <NavLink to="/planner" className={({ isActive }) => isActive ? 'active' : ''}>
                  Financial Planner
                </NavLink>
                <NavLink to="/savings" className={({ isActive }) => isActive ? 'active' : ''}>
                  Savings Tools
                </NavLink>
                <NavLink to="/statement" className={({ isActive }) => isActive ? 'active' : ''}>
                  Analyze Statements
                </NavLink>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <button onClick={openLoginModal} className="login-btn">
                  Log In
                </button>
                <button onClick={() => setShowRegModal(true)} className="register-btn">
                  Get Started
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <Outlet /> {/* This is where page content will be rendered */}
      
      <LoginModal 
        isOpen={showLoginModal} 
        onRequestClose={closeLoginModal}
        switchToRegister={switchToRegister}
      />
      
      <RegistrationModal
        isOpen={showRegModal}
        onRequestClose={() => setShowRegModal(false)}
        switchToLogin={switchToLogin}
      />
    </div>
  );
};