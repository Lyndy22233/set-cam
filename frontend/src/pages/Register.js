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
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'otp', 'success'
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [tempUserData, setTempUserData] = useState(null);
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

  const sendOTPAfterValidation = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-otp`, {
        email: formData.email,
        purpose: 'registration'
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.success) {
        setRegistrationStep('otp');
        
        if (response.data.emailSent === false) {
          toast.info('OTP generated! Check Render logs for the code (SMTP not configured).');
          console.log('%c⚠️ SMTP NOT CONFIGURED', 'color: orange; font-size: 16px; font-weight: bold;');
          console.log('%cCheck Render logs for OTP code at:', 'color: blue;');
          console.log('%chttps://dashboard.render.com/web/srv-ctag8f52ng1s73blg3sg/logs', 'color: blue; text-decoration: underline;');
        } else {
          toast.success('OTP sent to your email! Check your inbox.');
        }
        
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
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your internet connection or disable browser extensions.');
      } else if (error.message && error.message.includes('Network Error')) {
        toast.error('Network error. Please disable ad blockers or privacy extensions and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // First verify OTP
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      // Then create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'user',
        createdAt: new Date().toISOString(),
        emailVerified: true
      });
      
      setRegistrationStep('success');
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Invalid OTP');
      } else if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error('Email already in use');
            break;
          case 'auth/weak-password':
            toast.error('Password is too weak');
            break;
          default:
            toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    sendOTPAfterValidation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
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

    // All validation passed, send OTP
    await sendOTPAfterValidation();
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
        {/* Step 1: Registration Form */}
        {registrationStep === 'form' && (
          <>
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
              />
            </div>
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

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
          </>
        )}

        {/* Step 2: OTP Verification */}
        {registrationStep === 'otp' && (
          <>
            <div className="auth-header">
              <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                <Shield size={32} />
              </div>
              <h2>Verify Your Email</h2>
              <p>We've sent a 6-digit code to <strong>{formData.email}</strong></p>
            </div>

            <div className="otp-verification-container">
              <div className="form-group">
                <label>Enter OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) setOtp(value);
                  }}
                  maxLength="6"
                  placeholder="000000"
                  className="otp-input"
                  autoFocus
                />
              </div>

              <motion.button 
                type="button"
                onClick={verifyOTPAndRegister}
                disabled={loading || otp.length !== 6}
                className="btn btn-primary btn-block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Verify & Create Account
                  </>
                )}
              </motion.button>

              <div className="otp-resend-container">
                <span>Didn't receive the code?</span>
                {resendCooldown > 0 ? (
                  <span className="resend-cooldown">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOTP}
                    className="btn-text-link"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegistrationStep('form');
                  setOtp('');
                }}
                className="btn btn-secondary btn-block"
                style={{ marginTop: '10px' }}
              >
                Back to Form
              </button>
            </div>
          </>
        )}

        {/* Step 3: Success Screen */}
        {registrationStep === 'success' && (
          <>
            <div className="auth-header">
              <motion.div 
                className="auth-icon success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <Check size={48} strokeWidth={3} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Registration Successful!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your account has been created successfully.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Welcome to SET CAM, <strong>{formData.name}</strong>!<br />
                You can now login to book appointments.
              </p>

              <motion.button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check size={20} />
                Proceed to Login
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
