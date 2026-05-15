import { useState } from 'react';
import { API_URL } from '../config';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp number for receiving messages
  const WHATSAPP_NUMBER = '265995718815';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatWhatsAppMessage = () => {
    return `*New Contact Form Submission* 🏞️
    
*Name:* ${formData.name}
*Email:* ${formData.email}
*Subject:* ${formData.subject}
*Message:* 
${formData.message}

---
Sent from Chimango Tour Website`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      // Format the message for WhatsApp
      const whatsappMessage = formatWhatsAppMessage();
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error opening WhatsApp:', err);
      setError('Failed to open WhatsApp. Please make sure WhatsApp is installed or try calling us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: '📍', title: 'Visit Us', details: 'Lilongwe, Malawi', link: null },
    { icon: '📧', title: 'Email Us', details: 'goshsolution@gmail.com', link: 'mailto:goshsolution@gmail.com' },
    { icon: '📞', title: 'Call Us', details: '0995718815', link: 'tel:0995718815' },
    { icon: '⏰', title: 'Business Hours', details: 'Mon-Fri: 8am-5pm\nSat: 9am-3pm\nSun: Closed', link: null }
  ];

  const faqs = [
    {
      question: 'How do I book a tour?',
      answer: 'You can browse our activities page, select your preferred experience, and click "Book Now". You\'ll need to create an account or log in to complete the booking.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, bank transfers, and mobile money (Airtel Money, TNM Mpamba). All payments are processed securely.'
    },
    {
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify your booking up to 48 hours before the scheduled date. Please check our cancellation policy for more details.'
    },
    {
      question: 'Do you offer group discounts?',
      answer: 'Yes, we offer special discounts for groups of 5 or more. Contact us directly for a customized quote.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <div className="hero-badge">Get in Touch</div>
          <h1 className="contact-hero-title">
            Let's Start Your <span className="highlight">Journey</span>
          </h1>
          <p className="contact-hero-subtitle">
            Have questions? Ready to book your dream adventure? Our travel specialists are here to help 24/7.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="contact-cards-grid">
            {contactInfo.map((info, index) => (
              <div className="contact-card" key={index}>
                <div className="contact-card-icon">{info.icon}</div>
                <h3 className="contact-card-title">{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="contact-card-details">{info.details}</a>
                ) : (
                  <p className="contact-card-details" style={{ whiteSpace: 'pre-line' }}>{info.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="main-contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Left Side - Contact Form */}
            <div className="contact-form-wrapper">
              <div className="section-header">
                <span className="section-badge">Send Message</span>
                <h2 className="section-title">We'd Love to <span className="highlight">Hear From You</span></h2>
                <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              {success && (
                <div className="alert-success">
                  <span className="alert-icon">✓</span>
                  <div>
                    <strong>Message ready to send!</strong>
                    <p>WhatsApp will open with your message. Just click send to complete.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert-error">
                  <span className="alert-icon">⚠</span>
                  <div>
                    <strong>Something went wrong!</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    placeholder="Tell us about your travel plans or questions..."
                  />
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Opening WhatsApp...' : 'Send via WhatsApp →'}
                </button>
              </form>
              
              <div className="whatsapp-note">
                <p>📱 Messages are sent via WhatsApp. You will be redirected to WhatsApp to complete sending.</p>
              </div>
            </div>

            {/* Right Side - FAQ Section */}
            <div className="faq-wrapper">
              <div className="section-header">
                <span className="section-badge">FAQ</span>
                <h2 className="section-title">Frequently Asked <span className="highlight">Questions</span></h2>
                <p>Quick answers to common questions</p>
              </div>

              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div className="faq-item" key={index}>
                    <div className="faq-question">
                      <span className="faq-icon">?</span>
                      <h4>{faq.question}</h4>
                    </div>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="support-cta">
                <p>Still have questions?</p>
                <button className="btn-chat" onClick={() => window.location.href = 'tel:0995718815'}>
                  📞 Call Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="map-wrapper">
            <iframe
              title="Chimango Tour Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1960529.123456789!2d33.0!3d-13.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDE5JzUyLjAiUyAzM8KwMDAnMDAuMCJF!5e0!3m2!1sen!2smw!4v1234567890123!5m2!1sen!2smw"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="map-overlay">
              <div className="map-location">
                <span className="location-icon">📍</span>
                <div>
                  <h4>Chimango Tour Office</h4>
                  <p>Lilongwe, Malawi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore Malawi?</h2>
            <p>Book your adventure today and experience the Warm Heart of Africa</p>
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

export default ContactPage;