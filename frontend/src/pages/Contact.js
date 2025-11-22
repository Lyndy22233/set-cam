import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    if (name === 'phone') {
      // Only allow numbers and common phone formatting characters
      if (value && !/^[\d\s\+\-\(\)]*$/.test(value)) return;
      // Limit length
      if (value.length > 20) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with us for any inquiries or support</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <MapPin size={24} color="#8B0000" />
                <div>
                  <h3>Location</h3>
                  <p>Mintal, Davao City, Philippines</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Phone size={24} color="#8B0000" />
                <div>
                  <h3>Phone</h3>
                  <p>+63 XXX XXX XXXX</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Mail size={24} color="#8B0000" />
                <div>
                  <h3>Email</h3>
                  <p>info@setcam.com</p>
                  <p>support@setcam.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Clock size={24} color="#8B0000" />
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday: 8:00 AM - 5:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+63 XXX XXX XXXX"
                    maxLength="20"
                  />
                  <small>Numbers and phone formatting allowed</small>
                </div>
                
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Subject of your inquiry"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
