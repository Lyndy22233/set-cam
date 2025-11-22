import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { User, Settings, Calendar, Users, LayoutDashboard, LogOut, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setShowLogoutModal(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className={`container navbar-content ${isAdmin ? 'admin-nav' : ''}`}>
          <Link to={isAdmin ? "/admin/dashboard" : "/"} className="navbar-brand">
            <img src="/logo.png" alt="SETCAM Logo" className="navbar-logo" />
          </Link>
          
          <ul className="navbar-menu">
            {!isAdmin && (
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </>
            )}
            
            {/* Admin menu items moved to hamburger - showing only in mobile menu */}
          </ul>

          {/* Desktop Actions */}
          <div className="navbar-actions desktop-actions">
            {user ? (
              <>
                {!isAdmin && (
                  <Link to="/my-appointments" className="nav-action-link">My Appointments</Link>
                )}
                <NotificationCenter />
                <Link to="/profile" className="profile-link">
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogoutClick} className="btn btn-logout">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-login">Login</Link>
            )}
          </div>

          {/* Mobile Actions: Notification Bell + Hamburger */}
          <div className="mobile-actions">
            {user && <NotificationCenter />}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-menu-content">
                {user ? (
                  <>
                    {!isAdmin ? (
                      <>
                        <Link to="/my-appointments" onClick={() => setMobileMenuOpen(false)}>
                          <Calendar size={20} />
                          My Appointments
                        </Link>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User size={20} />
                          Profile
                        </Link>
                        <button onClick={() => { setMobileMenuOpen(false); handleLogoutClick(); }} className="mobile-logout">
                          <LogOut size={20} />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard size={20} />
                          Dashboard
                        </Link>
                        <Link to="/admin/appointments" onClick={() => setMobileMenuOpen(false)}>
                          <Calendar size={20} />
                          Appointments
                        </Link>
                        <Link to="/admin/calendar" onClick={() => setMobileMenuOpen(false)}>
                          <Calendar size={20} />
                          Calendar
                        </Link>
                        <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                          <Users size={20} />
                          Users
                        </Link>
                        <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)}>
                          <Settings size={20} />
                          Settings
                        </Link>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User size={20} />
                          Profile
                        </Link>
                        <button onClick={() => { setMobileMenuOpen(false); handleLogoutClick(); }} className="mobile-logout">
                          <LogOut size={20} />
                          Logout
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-login">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-login">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelLogout}
            />
            <motion.div
              className="confirmation-modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                <h3>Confirm Logout</h3>
                <button className="modal-close" onClick={cancelLogout}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelLogout}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmLogout}>
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
