import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyAppointments.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No user logged in');
        toast.error('Please log in to view appointments');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      console.log('Fetching appointments for user:', user.uid);
      console.log('API URL:', process.env.REACT_APP_API_URL);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/user`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Appointments fetched successfully:', response.data);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'pending_verification': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'completed': 'status-completed'
    };

    const statusText = {
      'pending': 'Pending',
      'pending_verification': 'Pending Verification',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">My Appointments</h1>

      <div className="filter-buttons">
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`btn ${filter === 'approved' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`btn ${filter === 'completed' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card text-center">
          <h3>No Appointments Found</h3>
          <p>You haven't booked any appointments yet.</p>
          <Link to="/services" className="btn btn-primary">
            Book Your First Appointment
          </Link>
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card card">
              <div className="appointment-header">
                <h3>{appointment.serviceName}</h3>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="appointment-details">
                <p><strong>Vehicle:</strong> {appointment.vehicleInfo.make} {appointment.vehicleInfo.model} ({appointment.vehicleInfo.year})</p>
                <p><strong>Plate Number:</strong> {appointment.vehicleInfo.plateNumber}</p>
                <p><strong>Date:</strong> {appointment.appointmentDate}</p>
                <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                <p><strong>Payment Method:</strong> {appointment.paymentDetails.method.toUpperCase()}</p>
              </div>

              <div className="appointment-actions">
                <Link 
                  to={`/appointment/${appointment.id}`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
