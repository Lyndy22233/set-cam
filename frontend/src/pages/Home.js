import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    '/IMAGE_CAROUSEL/ferrari.jpg',
    '/IMAGE_CAROUSEL/miata.jpg',
    '/IMAGE_CAROUSEL/vios.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="carousel">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="hero-overlay"></div>
            </div>
          ))}
          
          <button className="carousel-btn prev" onClick={goToPrevious}>
            <ChevronLeft size={32} />
          </button>
          <button className="carousel-btn next" onClick={goToNext}>
            <ChevronRight size={32} />
          </button>

          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="container hero-content">
          <h1>Smoke Emission Test Center in Mintal</h1>
          <p>Your Trusted Partner for Vehicle Emission Compliance & Environmental Safety</p>
          <Link to="/services" className="btn btn-hero">
            Book Your Appointment
          </Link>
        </div>
      </div>

      <div className="container">
        <section className="services-section">
          <h2>Our Professional Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <Wrench size={48} color="#8B0000" />
              </div>
              <h3>Professional Testing</h3>
              <p>State-of-the-art equipment with certified technicians ensuring accurate results</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <Zap size={48} color="#8B0000" />
              </div>
              <h3>Quick Service</h3>
              <p>Fast and efficient testing process - get your results in minutes</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <Award size={48} color="#8B0000" />
              </div>
              <h3>Certified Results</h3>
              <p>Government-accredited emission testing with official certification</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="home-footer">
        <div className="container">
          <p>&copy; 2025 SETCAM - Smoke Emission Test Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
