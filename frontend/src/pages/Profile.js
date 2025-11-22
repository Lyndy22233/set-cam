import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import './Profile.css';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    if (name === 'phoneNumber') {
      // Only allow numbers
      if (value && !/^\d*$/.test(value)) return;
      // Limit length
      if (value.length > 11) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;

      // Update display name
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Update email (requires re-authentication)
      if (formData.email !== user.email) {
        const password = prompt('Please enter your password to change email:');
        if (password) {
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, formData.email);
        } else {
          throw new Error('Email update cancelled');
        }
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="page-title">My Profile</h1>

          <div className="profile-container">
            <div className="card">
              <div className="profile-header">
                <div className="profile-avatar">
                  <User size={48} />
                </div>
                <h2>{formData.displayName || 'User'}</h2>
                <p className="text-secondary">{formData.email}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>
                    <User size={18} />
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    className="form-control"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  <small className="text-secondary">
                    Changing email requires password verification
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={18} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    maxLength="11"
                  />
                  <small className="text-secondary">Numbers only (11 digits)</small>
                </div>

                <div className="form-actions">
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </motion.button>

                  <motion.button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Lock size={18} />
                    Change Password
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Change Modal */}
          {showPasswordModal && (
            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <motion.div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h3>Change Password</h3>
                <form onSubmit={handleUpdatePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Profile;
