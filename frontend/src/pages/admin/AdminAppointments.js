import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import './AdminAppointments.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [appointmentToApprove, setAppointmentToApprove] = useState(null);
  const [testResult, setTestResult] = useState({
    co2Level: '',
    smokeOpacity: '',
    result: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      let url = `${process.env.REACT_APP_API_URL}/admin/appointments`;
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const openApproveConfirm = (appointment) => {
    setAppointmentToApprove(appointment);
    setShowApproveConfirm(true);
  };

  const handleApprove = async () => {
    if (!appointmentToApprove) return;

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/appointments/${appointmentToApprove.id}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Appointment approved!');
      setShowApproveConfirm(false);
      setAppointmentToApprove(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/appointments/${appointmentId}/reject`,
        { reason: rejectionReason },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Appointment rejected');
      setShowModal(false);
      setRejectionReason('');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    }
  };

  const handleTestResultChange = (field, value) => {
    // Only allow numbers and decimal points for co2Level and smokeOpacity
    if (field === 'co2Level' || field === 'smokeOpacity') {
      if (value && !/^\d*\.?\d*$/.test(value)) return;
    }
    setTestResult({ ...testResult, [field]: value });
  };

  const handleUpdateTestResult = async (appointmentId) => {
    if (!testResult.co2Level || !testResult.smokeOpacity || !testResult.result) {
      toast.error('Please fill in all test result fields');
      return;
    }

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/appointments/${appointmentId}/result`,
        { emissionTestResult: testResult },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Test result updated!');
      setShowModal(false);
      setTestResult({ co2Level: '', smokeOpacity: '', result: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating test result:', error);
      toast.error('Failed to update test result');
    }
  };

  const openRejectModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const openTestResultModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Manage Appointments</h1>

      <div className="filter-buttons">
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`btn ${filter === 'pending_verification' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('pending_verification')}
        >
          Pending Verification
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

      {appointments.length === 0 ? (
        <div className="card text-center">
          <h3>No Appointments Found</h3>
        </div>
      ) : (
        <div className="admin-appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="admin-appointment-card card">
              <div className="appointment-header">
                <div>
                  <h3>{appointment.serviceName}</h3>
                  <p className="user-email">{appointment.userEmail}</p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="appointment-info">
                <div className="info-column">
                  <h4>Vehicle Details</h4>
                  <p>{appointment.vehicleInfo.make} {appointment.vehicleInfo.model}</p>
                  <p>Plate: {appointment.vehicleInfo.plateNumber}</p>
                </div>

                <div className="info-column">
                  <h4>Appointment</h4>
                  <p>{appointment.appointmentDate}</p>
                  <p>{appointment.appointmentTime}</p>
                </div>

                <div className="info-column">
                  <h4>Payment</h4>
                  <p>{appointment.paymentDetails.method.toUpperCase()}</p>
                  <p>₱{appointment.paymentDetails.amount}</p>
                </div>
              </div>

              {appointment.receiptBase64 && (
                <div className="receipt-section">
                  <h4>Payment Receipt</h4>
                  <div 
                    className="receipt-thumbnail"
                    onClick={() => {
                      setSelectedReceipt(appointment.receiptBase64);
                      setShowReceiptModal(true);
                    }}
                  >
                    <img 
                      src={appointment.receiptBase64} 
                      alt="Payment Receipt" 
                    />
                    <div className="thumbnail-overlay">
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-actions">
                {appointment.status === 'pending_verification' && (
                  <>
                    <button 
                      onClick={() => openApproveConfirm(appointment)}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => openRejectModal(appointment)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </>
                )}

                {appointment.status === 'approved' && (
                  <button 
                    onClick={() => openTestResultModal(appointment)}
                    className="btn btn-primary"
                  >
                    Add Test Result
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedAppointment.status === 'pending_verification' ? (
              <>
                <h2>Reject Appointment</h2>
                <div className="form-group">
                  <label>Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    placeholder="Provide a reason for rejection"
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    onClick={() => handleReject(selectedAppointment.id)}
                    className="btn btn-danger"
                  >
                    Confirm Reject
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Add Emission Test Result</h2>
                <div className="form-group">
                  <label>CO2 Level (ppm)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={testResult.co2Level}
                    onChange={(e) => handleTestResultChange('co2Level', e.target.value)}
                    placeholder="e.g., 150"
                  />
                  <small>Numbers only</small>
                </div>
                <div className="form-group">
                  <label>Smoke Opacity (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={testResult.smokeOpacity}
                    onChange={(e) => handleTestResultChange('smokeOpacity', e.target.value)}
                    placeholder="e.g., 20"
                  />
                  <small>Numbers only</small>
                </div>
                <div className="form-group">
                  <label>Result</label>
                  <select
                    value={testResult.result}
                    onChange={(e) => setTestResult({...testResult, result: e.target.value})}
                  >
                    <option value="">Select result</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button 
                    onClick={() => handleUpdateTestResult(selectedAppointment.id)}
                    className="btn btn-success"
                  >
                    Save Result
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="modal-overlay receipt-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowReceiptModal(false)}
            >
              <X size={24} />
            </button>
            <img 
              src={selectedReceipt} 
              alt="Payment Receipt Full Size" 
              className="receipt-full-image"
            />
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && appointmentToApprove && (
        <div className="modal-overlay" onClick={() => setShowApproveConfirm(false)}>
          <div className="modal-content confirmation-modal-admin" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Approval</h3>
              <button className="modal-close-btn" onClick={() => setShowApproveConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to approve this appointment?</p>
              <div className="approval-summary">
                <div className="summary-row">
                  <strong>Service:</strong>
                  <span>{appointmentToApprove.serviceName}</span>
                </div>
                <div className="summary-row">
                  <strong>Customer:</strong>
                  <span>{appointmentToApprove.userEmail}</span>
                </div>
                <div className="summary-row">
                  <strong>Vehicle:</strong>
                  <span>{appointmentToApprove.vehicleInfo.make} {appointmentToApprove.vehicleInfo.model} ({appointmentToApprove.vehicleInfo.plateNumber})</span>
                </div>
                <div className="summary-row">
                  <strong>Date & Time:</strong>
                  <span>{appointmentToApprove.appointmentDate} at {appointmentToApprove.appointmentTime}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={handleApprove}
                className="btn btn-success"
              >
                Yes, Approve
              </button>
              <button 
                onClick={() => setShowApproveConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
