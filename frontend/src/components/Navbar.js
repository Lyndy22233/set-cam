import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { User, Settings, Calendar, Users, LayoutDashboard, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        <div className="container navbar-content">
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
            
            {user && isAdmin && (
              <>
                <li>
                  <Link to="/admin/dashboard" className="admin-link">
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/appointments" className="admin-link">
                    <Calendar size={20} />
                    Appointments
                  </Link>
                </li>
                <li>
                  <Link to="/admin/calendar" className="admin-link">
                    <Calendar size={20} />
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className="admin-link">
                    <Users size={20} />
                    Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/settings" className="admin-link">
                    <Settings size={20} />
                    Settings
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="navbar-actions">
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
        </div>
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
