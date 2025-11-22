import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Check, X, Shield } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    letter: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 6,
      number: /\d/.test(password),
      letter: /[a-zA-Z]/.test(password)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    if (name === 'phone') {
      // Only allow numbers
      if (value && !/^\d*$/.test(value)) return;
      // Limit length
      if (value.length > 11) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const sendOTP = async () => {
    // Validate email first
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-otp`, {
        email: formData.email,
        purpose: 'registration'
      });
      
      setOtpSent(true);
      toast.success('OTP sent to your email! Check your inbox.');
      
      // Start cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp
      });
      
      setOtpVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if OTP is verified
    if (!otpVerified) {
      toast.error('Please verify your email with OTP first');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'user',
        createdAt: new Date()
      });

      toast.success('Registration successful! Welcome to SET CAM!');
      navigate('/services');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to register';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = formData.password && formData.confirmPassword && 
                          formData.password === formData.confirmPassword;
  const isPasswordMismatch = formData.password && formData.confirmPassword && 
                             formData.password !== formData.confirmPassword;

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={32} />
          </div>
          <h2>Create Account</h2>
          <p>Register to book appointments</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <User size={18} />
              Full Name
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} />
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={emailError ? 'error' : ''}
                disabled={otpVerified}
              />
              {!otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={loading || !formData.email || emailError}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px', padding: '8px 16px', minWidth: '100px' }}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              )}
              {otpVerified && (
                <Check size={20} color="#10B981" style={{ marginLeft: '10px' }} />
              )}
            </div>
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          {otpSent && !otpVerified && (
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label>
                <Shield size={18} />
                Enter OTP Code
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) setOtp(value);
                  }}
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  style={{ letterSpacing: '0.5em', fontSize: '18px' }}
                />
                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary"
                  style={{ marginLeft: '10px', padding: '8px 16px', minWidth: '100px' }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Didn't receive the code?
                </span>
                {resendCooldown > 0 ? (
                  <span style={{ fontSize: '12px', color: '#DC143C' }}>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="btn btn-text"
                    style={{ padding: '0', fontSize: '12px', color: '#DC143C' }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div className="form-group">
            <label>
              <Phone size={18} />
              Phone Number
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="09123456789"
                maxLength="11"
              />
            </div>
            <small className="input-hint">Numbers only (11 digits)</small>
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-item ${passwordValidation.length ? 'valid' : ''}`}>
                  {passwordValidation.length ? <Check size={14} /> : <X size={14} />}
                  At least 6 characters
                </div>
                <div className={`strength-item ${passwordValidation.letter ? 'valid' : ''}`}>
                  {passwordValidation.letter ? <Check size={14} /> : <X size={14} />}
                  Contains letters
                </div>
                <div className={`strength-item ${passwordValidation.number ? 'valid' : ''}`}>
                  {passwordValidation.number ? <Check size={14} /> : <X size={14} />}
                  Contains numbers
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Confirm Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className={isPasswordMismatch ? 'error' : isPasswordMatch ? 'success' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isPasswordMismatch && <span className="error-text">Passwords do not match</span>}
            {isPasswordMatch && <span className="success-text">Passwords match!</span>}
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading || emailError || isPasswordMismatch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <Link to="/login" className="auth-link-button">
          Login here
        </Link>
      </motion.div>
    </div>
  );
};

export default Register;
