import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Clock, Save } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingHours, setWorkingHours] = useState({
    monday: { enabled: true, start: '08:00', end: '17:00' },
    tuesday: { enabled: true, start: '08:00', end: '17:00' },
    wednesday: { enabled: true, start: '08:00', end: '17:00' },
    thursday: { enabled: true, start: '08:00', end: '17:00' },
    friday: { enabled: true, start: '08:00', end: '17:00' },
    saturday: { enabled: true, start: '08:00', end: '12:00' },
    sunday: { enabled: false, start: '00:00', end: '00:00' }
  });

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/working-hours`);
      if (response.data.success) {
        setWorkingHours(response.data.workingHours);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      toast.error('Failed to load working hours');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (day) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        enabled: !workingHours[day].enabled
      }
    });
  };

  const handleTimeChange = (day, field, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.put(
        `${process.env.REACT_APP_API_URL}/settings/working-hours`,
        { workingHours },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Working hours updated successfully!');
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast.error('Failed to update working hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <motion.div 
      className="container admin-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="page-title">
          <Clock size={32} />
          Working Hours Settings
        </h1>
        <p className="page-subtitle">Configure available appointment time slots</p>
      </div>

      <div className="card">
        <div className="working-hours-list">
          {days.map((day) => (
            <motion.div 
              key={day} 
              className="working-hours-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="day-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={workingHours[day].enabled}
                    onChange={() => handleToggleDay(day)}
                  />
                  <span className="day-name">{dayLabels[day]}</span>
                </label>
              </div>

              {workingHours[day].enabled && (
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={workingHours[day].start}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    />
                  </div>

                  <span className="time-separator">to</span>

                  <div className="time-input-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={workingHours[day].end}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!workingHours[day].enabled && (
                <div className="closed-badge">Closed</div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="settings-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card info-card">
        <h3>📌 Important Notes</h3>
        <ul>
          <li>Time slots are automatically generated based on service duration</li>
          <li>Appointments are prevented on disabled days</li>
          <li>Changes take effect immediately for new bookings</li>
          <li>Existing appointments are not affected by changes</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
