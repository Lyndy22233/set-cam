import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Check, X } from 'lucide-react';
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
      </motion.div>
    </div>
  );
};

export default Register;
