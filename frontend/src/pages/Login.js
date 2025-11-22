import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user has admin role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      toast.success(`Welcome back${userData?.displayName ? ', ' + userData.displayName : ''}!`);
      
      // Redirect based on role
      if (userData?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/services');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      toast.error(errorMessage);
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
            <LogIn size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <Mail size={18} />
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="you@example.com"
                className={emailError ? 'error' : ''}
              />
            </div>
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading || emailError}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/forgot-password" style={{ color: '#DC143C', fontSize: '14px', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <Link to="/register" className="auth-link-button">
          Create an account
        </Link>
      </motion.div>
    </div>
  );
};

export default Login;
