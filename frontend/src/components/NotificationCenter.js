import React, { useState, useEffect } from 'react';
import { Bell, Trash2, RotateCcw, Trash, X } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('inbox');
  const [deletedNotifications, setDeletedNotifications] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    // Query deleted notifications
    const deletedQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('deleted', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeDeleted = onSnapshot(deletedQuery, (snapshot) => {
      const deleted = [];
      snapshot.forEach((doc) => {
        deleted.push({ id: doc.id, ...doc.data() });
      });
      setDeletedNotifications(deleted);
    });

    return () => {
      unsubscribe();
      unsubscribeDeleted();
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      const promises = unreadNotifs.map(n => 
        updateDoc(doc(db, 'notifications', n.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const moveToRecycleBin = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { deleted: true, deletedAt: new Date() });
    } catch (error) {
      console.error('Error moving to recycle bin:', error);
    }
  };

  const restoreNotification = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { deleted: false, deletedAt: null });
    } catch (error) {
      console.error('Error restoring notification:', error);
    }
  };

  const permanentlyDelete = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notifRef);
    } catch (error) {
      console.error('Error permanently deleting notification:', error);
    }
  };

  const emptyRecycleBin = async () => {
    try {
      const promises = deletedNotifications.map(n => deleteDoc(doc(db, 'notifications', n.id)));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error emptying recycle bin:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const statusColors = {
      approved: '#10B981',
      rejected: '#EF4444',
      completed: '#6B21A8',
      reminder: '#F59E0B'
    };
    return statusColors[type] || '#3B82F6';
  };

  return (
    <div className="notification-center">
      <motion.button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="notification-overlay" onClick={() => setIsOpen(false)} />
            <motion.div
              className="notification-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-header">
                <h3>Notifications</h3>
                <button
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="notification-tabs">
                <button
                  className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inbox')}
                >
                  <Bell size={16} />
                  Inbox ({notifications.length})
                </button>
                <button
                  className={`tab ${activeTab === 'recycle' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recycle')}
                >
                  <Trash2 size={16} />
                  Recycle Bin ({deletedNotifications.length})
                </button>
              </div>

              {/* Inbox Tab */}
              {activeTab === 'inbox' && (
                <>
                  {unreadCount > 0 && (
                    <div className="notification-actions">
                      <button
                        className="mark-all-read"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}

                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <Bell size={48} />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                        >
                          <div
                            className="notification-indicator"
                            style={{ backgroundColor: getNotificationIcon(notification.type) }}
                          />
                          <div 
                            className="notification-content"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              {notification.createdAt?.toDate().toLocaleString()}
                            </span>
                          </div>
                          {!notification.read && <div className="unread-dot" />}
                          <motion.button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToRecycleBin(notification.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Recycle Bin Tab */}
              {activeTab === 'recycle' && (
                <>
                  {deletedNotifications.length > 0 && (
                    <div className="notification-actions">
                      <button
                        className="empty-recycle-btn"
                        onClick={emptyRecycleBin}
                      >
                        <Trash size={16} />
                        Empty Recycle Bin
                      </button>
                    </div>
                  )}

                  <div className="notification-list">
                    {deletedNotifications.length === 0 ? (
                      <div className="no-notifications">
                        <Trash2 size={48} />
                        <p>Recycle bin is empty</p>
                      </div>
                    ) : (
                      deletedNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className="notification-item deleted"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <div
                            className="notification-indicator"
                            style={{ backgroundColor: '#666' }}
                          />
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              Deleted: {notification.deletedAt?.toDate?.().toLocaleString() || 'Recently'}
                            </span>
                          </div>
                          <div className="recycle-actions">
                            <motion.button
                              className="restore-btn"
                              onClick={() => restoreNotification(notification.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Restore"
                            >
                              <RotateCcw size={16} />
                            </motion.button>
                            <motion.button
                              className="permanent-delete-btn"
                              onClick={() => permanentlyDelete(notification.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete Permanently"
                            >
                              <Trash size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
