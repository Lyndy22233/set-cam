import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldOff, Search, Calendar } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      
      usersSnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by creation date (newest first)
      usersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAppointments = async (userId) => {
    setLoadingAppointments(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/appointments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const userAppts = response.data.appointments.filter(
        appt => appt.userId === userId
      );
      
      setUserAppointments(userAppts);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      toast.error('Failed to load user appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    if (userId === auth.currentUser.uid) {
      toast.error('You cannot change your own admin role');
      return;
    }

    const confirmMessage = currentRole === 'admin' 
      ? 'Are you sure you want to remove admin privileges from this user?'
      : 'Are you sure you want to grant admin privileges to this user?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    fetchUserAppointments(user.id);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserAppointments([]);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <motion.div 
      className="container admin-users"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="page-title">
          <Users size={32} />
          User Management
        </h1>
        <p className="page-subtitle">Manage users and admin roles</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="users-stats">
          <div className="stat-item">
            <span className="stat-label">Total Users:</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Admins:</span>
            <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Regular Users:</span>
            <span className="stat-value">{users.filter(u => u.role !== 'admin').length}</span>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-results">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>
                      <div className="user-name">
                        {user.displayName || 'N/A'}
                        {user.id === auth.currentUser.uid && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                        {user.role === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleViewUser(user)}
                        >
                          <Calendar size={14} />
                          View
                        </button>
                        <button
                          className={`btn btn-sm ${user.role === 'admin' ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleAdmin(user.id, user.role)}
                          disabled={user.id === auth.currentUser.uid}
                          title={user.id === auth.currentUser.uid ? 'Cannot modify your own role' : ''}
                        >
                          {user.role === 'admin' ? (
                            <>
                              <ShieldOff size={14} />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield size={14} />
                              Make Admin
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <motion.div 
            className="modal-content user-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2>User Details</h2>
            
            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.displayName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">
                  <span className={`role-badge ${selectedUser.role === 'admin' ? 'admin' : 'user'}`}>
                    {selectedUser.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            <h3>Appointment History</h3>
            {loadingAppointments ? (
              <div className="loading-small">
                <div className="spinner-small"></div>
                <p>Loading appointments...</p>
              </div>
            ) : userAppointments.length === 0 ? (
              <p className="no-appointments">No appointments found</p>
            ) : (
              <div className="appointments-list">
                {userAppointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-header">
                      <span className="service-name">{appointment.serviceName}</span>
                      <span className={`status-badge status-${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-details-small">
                      <span>📅 {appointment.appointmentDate}</span>
                      <span>🕐 {appointment.appointmentTime}</span>
                      <span>💰 ₱{appointment.paymentDetails?.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminUsers;
