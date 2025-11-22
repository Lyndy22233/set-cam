import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AppointmentDetails.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setAppointment(response.data.appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/my-appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(receiptFile);
      });
      const receiptBase64 = await base64Promise;

      // Update appointment
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/appointments/${id}/receipt`,
        { receiptBase64 },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Receipt uploaded successfully!');
      fetchAppointment(); // Refresh appointment data
      setReceiptFile(null);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

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

  return (
    <div className="container">
      <div className="appointment-details-page">
        <div className="details-header">
          <h1>Appointment Details</h1>
          {getStatusBadge(appointment.status)}
        </div>

        <div className="card">
          <div className="detail-section">
            <h3>Service Information</h3>
            <p><strong>Service:</strong> {appointment.serviceName}</p>
          </div>

          <div className="detail-section">
            <h3>Vehicle Information</h3>
            <p><strong>Make:</strong> {appointment.vehicleInfo.make}</p>
            <p><strong>Model:</strong> {appointment.vehicleInfo.model}</p>
            <p><strong>Year:</strong> {appointment.vehicleInfo.year}</p>
            <p><strong>Plate Number:</strong> {appointment.vehicleInfo.plateNumber}</p>
          </div>

          <div className="detail-section">
            <h3>Appointment Schedule</h3>
            <p><strong>Date:</strong> {appointment.appointmentDate}</p>
            <p><strong>Time:</strong> {appointment.appointmentTime}</p>
          </div>

          <div className="detail-section">
            <h3>Payment Information</h3>
            <p><strong>Method:</strong> {appointment.paymentDetails.method.toUpperCase()}</p>
            <p><strong>Amount:</strong> ₱{appointment.paymentDetails.amount}</p>
          </div>

          {appointment.receiptBase64 && (
            <div className="detail-section">
              <h3>Payment Receipt</h3>
              <img 
                src={appointment.receiptBase64} 
                alt="Payment Receipt" 
                className="receipt-image"
              />
            </div>
          )}

          {!appointment.receiptBase64 && appointment.status === 'pending' && (
            <div className="detail-section">
              <h3>Upload Payment Receipt</h3>
              <div className="upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                />
                <button
                  onClick={handleReceiptUpload}
                  className="btn btn-primary"
                  disabled={uploading || !receiptFile}
                >
                  {uploading ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </div>
          )}

          {appointment.status === 'rejected' && appointment.rejectionReason && (
            <div className="detail-section alert alert-error">
              <h3>Rejection Reason</h3>
              <p>{appointment.rejectionReason}</p>
            </div>
          )}

          {appointment.status === 'completed' && appointment.emissionTestResult && (
            <div className="detail-section">
              <h3>Emission Test Result</h3>
              <div className="test-result">
                {Object.entries(appointment.emissionTestResult).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
              </div>
              <button onClick={handlePrint} className="btn btn-success">
                Print Result
              </button>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/my-appointments')} className="btn btn-primary">
          Back to My Appointments
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
