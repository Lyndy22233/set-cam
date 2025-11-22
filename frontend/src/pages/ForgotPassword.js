import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Shield, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const sendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-otp`, {
        email,
        purpose: 'password-reset'
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      setStep(2);
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

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, {
        email,
        otp
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      setStep(3);
      toast.success('OTP verified! Now set your new password.');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        email,
        newPassword
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      toast.success('Password reset successful! You can now login.');
      navigate('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-icon">
            <KeyRound size={32} />
          </div>
          <h2>Forgot Password</h2>
          <p>
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && 'Enter the OTP code sent to your email'}
            {step === 3 && 'Create your new password'}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={sendOTP}
              disabled={loading || !email}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
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
                  style={{ letterSpacing: '0.5em', fontSize: '24px', textAlign: 'center' }}
                  onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
                />
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
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                    }}
                    className="btn btn-text"
                    style={{ padding: '0', fontSize: '12px', color: '#DC143C' }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
              }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </motion.div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <label>
                <Lock size={18} />
                New Password
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  onKeyPress={(e) => e.key === 'Enter' && resetPassword()}
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <span className="error-text">Passwords do not match</span>
              )}
            </div>

            <button
              type="button"
              onClick={resetPassword}
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </motion.div>
        )}

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          <p>
            Remember your password?{' '}
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
