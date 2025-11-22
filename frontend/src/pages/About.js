import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About SETCAM</h1>
          <p>Smoke Emission Test Center - Your Trusted Partner in Mintal</p>
        </div>
      </div>

      <div className="container">
        <section className="about-content">
          <h2>Who We Are</h2>
          <p>
            SETCAM (Smoke Emission Test Center) is a government-accredited facility 
            located in Mintal, dedicated to providing professional vehicle emission 
            testing services. We are committed to environmental safety and ensuring 
            your vehicle meets all emission compliance standards.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            To provide fast, accurate, and reliable smoke emission testing services 
            while promoting environmental awareness and vehicle safety in our community.
          </p>

          <h2>Why Choose SETCAM?</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>✓ Government Accredited</h3>
              <p>Official certification recognized by authorities</p>
            </div>
            <div className="feature-item">
              <h3>✓ State-of-the-Art Equipment</h3>
              <p>Modern testing technology for accurate results</p>
            </div>
            <div className="feature-item">
              <h3>✓ Certified Technicians</h3>
              <p>Professionally trained and experienced staff</p>
            </div>
            <div className="feature-item">
              <h3>✓ Quick Service</h3>
              <p>Get your results in minutes</p>
            </div>
          </div>
        </section>

        <section className="location-info">
          <h2>Visit Us</h2>
          <div className="info-grid">
            <div className="info-card">
              <MapPin size={32} color="#8B0000" />
              <h3>Location</h3>
              <p>Mintal, Davao City</p>
            </div>
            <div className="info-card">
              <Clock size={32} color="#8B0000" />
              <h3>Business Hours</h3>
              <p>Monday - Saturday<br />8:00 AM - 5:00 PM</p>
            </div>
            <div className="info-card">
              <Phone size={32} color="#8B0000" />
              <h3>Phone</h3>
              <p>+63 XXX XXX XXXX</p>
            </div>
            <div className="info-card">
              <Mail size={32} color="#8B0000" />
              <h3>Email</h3>
              <p>info@setcam.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
