import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminCalendar.css';

const AdminCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, appointments]);

  const fetchAppointments = async () => {
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

      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointmentsByDate = (date) => {
    const dateStr = formatDateToString(date);
    const filtered = appointments.filter(appt => {
      // Handle both YYYY-MM-DD and M/D/YYYY formats
      if (!appt.appointmentDate) return false;
      
      const apptDate = appt.appointmentDate.includes('-') 
        ? appt.appointmentDate 
        : convertToYYYYMMDD(appt.appointmentDate);
      
      return apptDate === dateStr;
    });
    setFilteredAppointments(filtered);
  };

  const convertToYYYYMMDD = (dateStr) => {
    // Convert M/D/YYYY to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay();
    
    // Add padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = formatDateToString(date);
    return appointments.filter(appt => {
      if (!appt.appointmentDate) return false;
      
      const apptDate = appt.appointmentDate.includes('-') 
        ? appt.appointmentDate 
        : convertToYYYYMMDD(appt.appointmentDate);
      
      return apptDate === dateStr;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#3b82f6',
      completed: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#gray';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();
  const todayStr = formatDateToString(today);

  return (
    <motion.div 
      className="container admin-calendar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="page-title">
          <CalendarIcon size={32} />
          Appointment Calendar
        </h1>
        <p className="page-subtitle">View and manage appointments by date</p>
      </div>

      <div className="calendar-container card">
        <div className="calendar-header">
          <button className="btn btn-secondary" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="calendar-month">{monthName}</h2>
          
          <button className="btn btn-secondary" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
          
          <button className="btn btn-primary" onClick={handleToday}>
            Today
          </button>
        </div>

        <div className="calendar-grid">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((dayObj, index) => {
            const dayAppointments = getAppointmentsForDate(dayObj.date);
            const dateStr = formatDateToString(dayObj.date);
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate && formatDateToString(selectedDate) === dateStr;
            
            return (
              <motion.div
                key={index}
                className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => dayObj.isCurrentMonth && handleDateClick(dayObj.date)}
                whileHover={dayObj.isCurrentMonth ? { scale: 1.02 } : {}}
                transition={{ duration: 0.2 }}
              >
                <div className="day-number">{dayObj.date.getDate()}</div>
                {dayAppointments.length > 0 && (
                  <div className="appointment-indicators">
                    {dayAppointments.slice(0, 3).map((appt, i) => (
                      <div
                        key={i}
                        className="appointment-dot"
                        style={{ backgroundColor: getStatusColor(appt.status) }}
                        title={`${appt.serviceName} - ${appt.status}`}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <span className="more-indicator">+{dayAppointments.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#fbbf24' }}></div>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Approved</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Rejected</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <motion.div 
          className="appointments-sidebar card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>
            Appointments on {selectedDate.toLocaleDateString('default', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </h3>
          
          {filteredAppointments.length === 0 ? (
            <p className="no-appointments">No appointments scheduled</p>
          ) : (
            <div className="appointments-list">
              {filteredAppointments.map((appt) => (
                <motion.div
                  key={appt.id}
                  className="appointment-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="appointment-header">
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>
                    <span className="appointment-time">🕐 {appt.appointmentTime}</span>
                  </div>
                  
                  <h4>{appt.serviceName}</h4>
                  
                  <div className="appointment-details">
                    <p><strong>Customer:</strong> {appt.userName}</p>
                    <p><strong>Vehicle:</strong> {appt.vehicleInfo?.make} {appt.vehicleInfo?.model}</p>
                    <p><strong>Plate:</strong> {appt.vehicleInfo?.plateNumber}</p>
                    <p><strong>Amount:</strong> ₱{appt.paymentDetails?.amount}</p>
                  </div>
                  
                  {appt.notes && (
                    <p className="appointment-notes">
                      <strong>Notes:</strong> {appt.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminCalendar;
