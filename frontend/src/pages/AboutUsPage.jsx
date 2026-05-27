import { useState, useEffect } from 'react';
import './AboutUsPage.css';

const AboutUsPage = () => {
  const [stats, setStats] = useState({
    tours: 0,
    customers: 0,
    years: 0,
    satisfaction: 0,
    destinations: 0
  });

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      setStats({
        tours: 150,
        customers: 5000,
        years: 12,
        satisfaction: 98,
        destinations: 25
      });
    };
    animateStats();
  }, []);

  const teamMembers = [
    {
      name: 'Davie Chimango',
      role: 'Founder & CEO',
      bio: 'Passionate about showcasing Malawi\'s beauty and creating unforgettable travel experiences.',
      image: '/images/team/godfrey.jpg',
      icon: '👨‍💼'
    },
    {
      name: 'Loius Mwenda',
      role: 'Head of Operations',
      bio: 'Expert in logistics and ensuring seamless travel experiences for all our clients.',
      image: '/images/team/sarah.jpg',
      icon: '👩‍💼'
    },
    {
      name: 'Godfrey Silungwe',
      role: 'Lead Tour Guide',
      bio: 'Certified guide with 8+ years of experience across Malawi\'s national parks.',
      image: '/images/team/michael.jpg',
      icon: '🗺️'
    }
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <div className="hero-badge">Our Story</div>
          <h1 className="about-hero-title">
            Discover the <span className="highlight">Warm Heart</span> of Africa
          </h1>
          <p className="about-hero-subtitle">
            Chimango Tours was born from a passion to share Malawi's breathtaking landscapes, 
            rich culture, and warm hospitality with the world.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To provide authentic, sustainable, and unforgettable travel experiences that showcase the best of Malawi while supporting local communities.</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>To become the leading tour operator in Malawi, recognized for excellence, innovation, and commitment to responsible tourism.</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">💎</div>
              <h3>Our Values</h3>
              <p>Integrity, sustainability, authenticity, and exceptional customer service in every journey we create.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.years}+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.tours}+</div>
              <div className="stat-label">Amazing Tours</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.customers}+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.destinations}+</div>
              <div className="stat-label">Destinations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.satisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Chimango Tours Section */}
      <section className="what-is-section">
        <div className="container">
          <div className="wi-grid">
            <div className="wi-content">
              <span className="section-badge">Who We Are</span>
              <h2 className="section-title">What is <span className="highlight">Chimango Tours?</span></h2>
              <p className="wi-description">
                Chimango Tours is a comprehensive tourist and booking management system designed to help travelers 
                discover, book, and manage amazing activities across Malawi. We curate authentic experiences that 
                connect you with the warmth of our people, the richness of our culture, and the breathtaking 
                beauty of our landscapes.
              </p>
              <div className="wi-features">
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>Expert Local Guides</span>
                </div>
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>Sustainable Tourism</span>
                </div>
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>24/7 Customer Support</span>
                </div>
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>Best Price Guarantee</span>
                </div>
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>Customized Itineraries</span>
                </div>
                <div className="wi-feature">
                  <span className="feature-check">✓</span>
                  <span>Secure Booking System</span>
                </div>
              </div>
              <button className="btn-primary" onClick={() => window.location.href = '/activities'}>
                Explore Activities →
              </button>
            </div>
            <div className="wi-image">
              <img 
                src="/images/about/malawi-landscape.jpg" 
                alt="Malawi Landscape"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x400?text=Malawi+Landscape'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Travel with <span className="highlight">Confidence</span></h2>
            <p>Experience the Chimango difference</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Expert Local Guides</h3>
              <p>Certified guides with deep local knowledge and passion for storytelling</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚙</div>
              <h3>Premium Safari Vehicles</h3>
              <p>Modern 4x4 vehicles with pop-up roofs for optimal wildlife viewing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏕️</div>
              <h3>Luxury Accommodations</h3>
              <p>Carefully selected eco-lodges and boutique hotels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <h3>Sustainable Tourism</h3>
              <p>Committed to responsible travel and community development</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Booking</h3>
              <p>Safe and encrypted payment processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service for peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Meet Our Team</span>
            <h2 className="section-title">Behind the <span className="highlight">Experience</span></h2>
            <p>Passionate locals dedicated to creating unforgettable journeys</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-icon">{member.icon}</div>
                <h3 className="team-name">{member.name}</h3>
                <div className="team-role">{member.role}</div>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">What Our <span className="highlight">Travelers Say</span></h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">An unforgettable experience! The team was professional, knowledgeable, and went above and beyond to make our trip special.</p>
              <div className="testimonial-author">
                <strong>John & Sarah M.</strong>
                <span>United Kingdom</span>
              </div>
              <div className="testimonial-rating">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">The safari was incredible! Saw all the Big Five and the accommodation was top-notch. Highly recommend Chimango Tours!</p>
              <div className="testimonial-author">
                <strong>David Chen</strong>
                <span>Singapore</span>
              </div>
              <div className="testimonial-rating">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">A truly authentic Malawian experience. The local guides made all the difference. Will definitely book again!</p>
              <div className="testimonial-author">
                <strong>Maria Gonzalez</strong>
                <span>Spain</span>
              </div>
              <div className="testimonial-rating">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <span className="section-badge">Get in Touch</span>
              <h2 className="section-title">Let's Start Your <span className="highlight">Adventure</span></h2>
              <p>Have questions or ready to book your dream trip? Our travel specialists are here to help!</p>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <h4>Email Us</h4>
                    <a href="mailto:goshsolution@gmail.com">goshsolution@gmail.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Call Us</h4>
                    <a href="tel:0995718815">0995718815</a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Visit Us</h4>
                    <p>Lilongwe, Malawi</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <input type="text" placeholder="Your Name" className="form-input" />
                <input type="email" placeholder="Your Email" className="form-input" />
                <input type="tel" placeholder="Phone Number" className="form-input" />
                <textarea placeholder="Your Message" rows="4" className="form-textarea"></textarea>
                <button type="submit" className="btn-primary btn-block">Send Message →</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Malawi?</h2>
            <p>Join hundreds of happy travelers who have explored the Warm Heart of Africa with us.</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => window.location.href = '/activities'}>
                Browse Activities →
              </button>
              <button className="btn-outline" onClick={() => window.location.href = '/custom-booking'}>
                Customize Your Trip
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;