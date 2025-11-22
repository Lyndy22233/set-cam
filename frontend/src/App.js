import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import AppointmentDetails from './pages/AppointmentDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCalendar from './pages/admin/AdminCalendar';

function AnimatedRoutes({ user }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book/:serviceId" element={<PrivateRoute user={user}><BookAppointment /></PrivateRoute>} />
        <Route path="/my-appointments" element={<PrivateRoute user={user}><MyAppointments /></PrivateRoute>} />
        <Route path="/appointment/:id" element={<PrivateRoute user={user}><AppointmentDetails /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute user={user}><Profile /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/appointments" element={<AdminRoute user={user}><AdminAppointments /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute user={user}><AdminSettings /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute user={user}><AdminUsers /></AdminRoute>} />
        <Route path="/admin/calendar" element={<AdminRoute user={user}><AdminCalendar /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} />
        <ToastContainer position="top-right" autoClose={3000} />
        <AnimatedRoutes user={user} />
      </div>
    </Router>
  );
}

export default App;
