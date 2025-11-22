import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import './BookAppointment.css';

const BookAppointment = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [discount, setDiscount] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    plateNumber: '',
    appointmentDate: '',
    appointmentTime: '',
    paymentMethod: 'gcash',
    notes: ''
  });

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (formData.appointmentDate && service) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate, service]);

  const fetchService = async () => {
    try {
      const docRef = doc(db, 'services', serviceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const serviceData = { id: docSnap.id, ...docSnap.data() };
        setService(serviceData);
        
        const calculatedDiscount = calculateDiscount(serviceData);
        setDiscount(calculatedDiscount);
        setFinalPrice(calculatedDiscount ? calculatedDiscount.discountedPrice : serviceData.price);
      } else {
        toast.error('Service not found');
        navigate('/services');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (service) => {
    if (!service.discount || !service.discount.active) return null;
    
    const { type, value, expiresAt } = service.discount;
    
    if (expiresAt && new Date(expiresAt.toDate ? expiresAt.toDate() : expiresAt) < new Date()) {
      return null;
    }
    
    if (type === 'percentage') {
      const discountAmount = (service.price * value) / 100;
      return {
        originalPrice: service.price,
        discountedPrice: service.price - discountAmount,
        savings: discountAmount,
        label: `${value}% OFF`
      };
    } else if (type === 'fixed') {
      return {
        originalPrice: service.price,
        discountedPrice: service.price - value,
        savings: value,
        label: `₱${value} OFF`
      };
    }
    return null;
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/settings/available-slots`,
        {
          params: {
            date: formData.appointmentDate,
            serviceId: service.id
          }
        }
      );
      
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots);
        if (formData.appointmentTime && !response.data.availableSlots.includes(formData.appointmentTime)) {
          setFormData({ ...formData, appointmentTime: '' });
        }
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    if (name === 'vehicleYear') {
      // Only allow numbers
      if (value && !/^\d*$/.test(value)) return;
      if (value && (parseInt(value) > new Date().getFullYear() + 1 || parseInt(value) < 1900)) return;
    }
    
    if (name === 'plateNumber') {
      // Allow only alphanumeric characters
      if (value && !/^[A-Za-z0-9\s-]*$/.test(value)) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    setSubmitting(true);

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const appointmentData = {
        serviceId: service.id,
        serviceName: service.name,
        vehicleInfo: {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          plateNumber: formData.plateNumber
        },
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        paymentDetails: {
          method: formData.paymentMethod,
          amount: finalPrice,
          originalAmount: service.price,
          discount: discount ? {
            type: service.discount.type,
            value: service.discount.value,
            savings: discount.savings
          } : null
        },
        notes: formData.notes
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/appointments`,
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const appointmentId = response.data.appointmentId;

      if (receiptFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(receiptFile);
        });
        const receiptBase64 = await base64Promise;

        await axios.patch(
          `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}/receipt`,
          { receiptBase64 },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }

      toast.success('Appointment booked successfully!');
      setShowConfirmModal(false);
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
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
      <h1 className="page-title">Book Appointment</h1>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
      ) : !service ? (
        <div className="error-state">
          <p>Service not found</p>
        </div>
      ) : (
        <div className="booking-container">
          <div className="service-summary card">
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            {discount ? (
              <div className="price-section">
                <p className="original-price">Original: ₱{discount.originalPrice}</p>
                <p className="discounted-price">Discounted: ₱{discount.discountedPrice.toFixed(2)}</p>
                <p className="savings-badge">You save ₱{discount.savings.toFixed(2)}!</p>
              </div>
            ) : (
              <p className="price">Price: ₱{service.price}</p>
            )}
          </div>

          <div className="booking-form card">
            <h3>Appointment Details</h3>
            <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h4>Vehicle Information</h4>
              
              <div className="form-group">
                <label>Vehicle Make</label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Toyota"
                />
              </div>

              <div className="form-group">
                <label>Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Vios"
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2020"
                  maxLength="4"
                />
                <small>Numbers only (1900-{new Date().getFullYear() + 1})</small>
              </div>

              <div className="form-group">
                <label>Plate Number</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ABC123"
                  style={{ textTransform: 'uppercase' }}
                />
                <small>Alphanumeric characters only</small>
              </div>
            </div>

            <div className="form-section">
              <h4>Schedule</h4>
              
              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Appointment Time</label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  disabled={!formData.appointmentDate || loadingSlots}
                >
                  <option value="">
                    {!formData.appointmentDate 
                      ? 'Select a date first' 
                      : loadingSlots 
                      ? 'Loading slots...' 
                      : availableSlots.length === 0
                      ? 'No available slots'
                      : 'Select time'}
                  </option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>
                {formData.appointmentDate && availableSlots.length === 0 && !loadingSlots && (
                  <small className="text-danger">No available slots for this date. Please choose another date.</small>
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>Payment Information</h4>
              
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="gcash">GCash</option>
                  <option value="paymaya">PayMaya</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Upload Payment Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small>Upload proof of payment (Max 5MB, Image files only)</small>
                {receiptPreview && (
                  <div className="receipt-preview">
                    <img src={receiptPreview} alt="Receipt preview" />
                    <button 
                      type="button" 
                      className="btn-remove-preview"
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreview(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any special requests or information"
                maxLength="500"
              />
              <small>{formData.notes.length}/500 characters</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              Review & Confirm
            </button>
          </form>
        </div>
        </div>
      )}

      {/* Confirmation Modal */}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowConfirmModal(false)}
            />
            <motion.div
              className="confirmation-modal appointment-confirm-modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                <div className="modal-header-icon">
                  <CheckCircle size={32} />
                </div>
                <h3>Confirm Appointment</h3>
                {!submitting && (
                  <button className="modal-close" onClick={() => setShowConfirmModal(false)}>
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="modal-body">
                <p className="confirm-message">Please review your appointment details:</p>
                
                <div className="summary-section">
                  <h4>Service</h4>
                  <p><strong>{service.name}</strong></p>
                  <p className="summary-price">Amount: ₱{finalPrice.toFixed(2)}</p>
                </div>

                <div className="summary-section">
                  <h4>Vehicle Information</h4>
                  <div className="summary-grid">
                    <div>
                      <label>Make:</label>
                      <span>{formData.vehicleMake}</span>
                    </div>
                    <div>
                      <label>Model:</label>
                      <span>{formData.vehicleModel}</span>
                    </div>
                    <div>
                      <label>Year:</label>
                      <span>{formData.vehicleYear}</span>
                    </div>
                    <div>
                      <label>Plate:</label>
                      <span>{formData.plateNumber.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Schedule</h4>
                  <div className="summary-grid">
                    <div>
                      <label>Date:</label>
                      <span>{new Date(formData.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div>
                      <label>Time:</label>
                      <span>{formatTime(formData.appointmentTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Payment</h4>
                  <div className="summary-grid">
                    <div>
                      <label>Method:</label>
                      <span>{formData.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div>
                      <label>Receipt:</label>
                      <span>{receiptFile ? '✓ Uploaded' : 'Not uploaded'}</span>
                    </div>
                  </div>
                </div>

                {formData.notes && (
                  <div className="summary-section">
                    <h4>Notes</h4>
                    <p className="notes-text">{formData.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Edit Details
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={confirmBooking}
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookAppointment;
