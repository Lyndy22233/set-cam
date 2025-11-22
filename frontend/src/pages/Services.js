import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';
import { Bike, Car, Truck, Check } from 'lucide-react';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined service categories matching the design
  const serviceCategories = [
    {
      id: 'motorcycles',
      name: 'MOTORCYCLES',
      icon: Bike,
      badge: 'Most Popular',
      badgeColor: '#8B0000',
      subtitle: 'Private & For Hire',
      price: 500,
      features: [
        'Comprehensive emission testing',
        'Quick 15-minute service',
        'Digital certificate',
        'Environment compliant'
      ]
    },
    {
      id: '4wheels',
      name: '4 WHEELS',
      icon: Car,
      badge: 'Best Value',
      badgeColor: '#8B0000',
      subtitle: 'Private & For Hire',
      price: 600,
      features: [
        'Advanced emission analysis',
        'Quick 15-minute service',
        'Detailed report',
        'LTO compliant'
      ]
    },
    {
      id: '6wheels',
      name: '6 WHEELS & ABOVE',
      icon: Truck,
      badge: 'Heavy Duty',
      badgeColor: '#8B0000',
      subtitle: 'Private & For Hire',
      price: 600,
      features: [
        'Heavy vehicle testing',
        'Commercial grade equipment',
        'Quick 15-minute service',
        'Bulk discount available'
      ]
    }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const servicesData = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Match Firestore services with predefined categories
  const getServiceData = (category) => {
    // Try to find matching service by name keywords
    const firestoreService = services.find(s => {
      const serviceName = s.name.toLowerCase();
      const categoryName = category.name.toLowerCase();
      
      // Match by keywords: motorcycles, 4 wheels, 6 wheels
      if (categoryName.includes('motorcycles') && serviceName.includes('motorcycle')) return true;
      if (categoryName.includes('4 wheels') && (serviceName.includes('4') || serviceName.includes('four'))) return true;
      if (categoryName.includes('6 wheels') && (serviceName.includes('6') || serviceName.includes('six'))) return true;
      
      return false;
    });
    
    return {
      ...category,
      firestoreId: firestoreService?.id,
      price: firestoreService?.price || category.price,
      available: !!firestoreService
    };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="container">
        <h1 className="services-title">Our Premium Services</h1>
        
        <div className="premium-services-grid">
          {serviceCategories.map((category) => {
            const serviceData = getServiceData(category);
            const IconComponent = category.icon;
            
            return (
              <motion.div 
                key={category.id} 
                className="premium-service-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="service-badge" style={{ backgroundColor: category.badgeColor }}>
                  {category.badge}
                </div>
                
                <h3 className="service-category">{category.name}</h3>
                
                <div className="service-icon-container">
                  <IconComponent size={80} color="#8B0000" strokeWidth={1.5} />
                </div>
                
                <p className="service-subtitle">{category.subtitle}</p>
                
                <div className="service-pricing">
                  <span className="price-label">Starting at</span>
                  <span className="price-amount">₱{serviceData.price}</span>
                </div>
                
                <ul className="service-features">
                  {category.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} color="#10b981" strokeWidth={3} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {serviceData.available ? (
                  <Link 
                    to={`/book/${serviceData.firestoreId}`} 
                    className="btn-book-service"
                  >
                    Book Now
                  </Link>
                ) : (
                  <button 
                    className="btn-book-service btn-disabled" 
                    disabled
                    title="Service temporarily unavailable"
                  >
                    Coming Soon
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <section className="why-choose-section">
          <h2>Why Choose SETCAM?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#8B0000' }}>⚡</div>
              <h3>Fast Service</h3>
              <p>Quick and efficient testing process</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#8B0000' }}>🏆</div>
              <h3>Certified</h3>
              <p>Government-accredited testing center</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#8B0000' }}>🕐</div>
              <h3>Flexible Hours</h3>
              <p>Open Monday to Saturday</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon" style={{ color: '#8B0000' }}>🛡️</div>
              <h3>Reliable</h3>
              <p>Trusted by thousands of vehicle owners</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services;
