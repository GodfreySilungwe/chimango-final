import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{
        backgroundColor: '#e67e22',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, fontSize: '42px' }}>Contact Us</h1>
        <p style={{ margin: '16px 0 0', fontSize: '18px' }}>
          We'd love to hear from you
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Contact Info */}
            <div>
              <h2 style={{ color: '#e67e22', marginBottom: '20px' }}>Get in Touch</h2>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>📍</div>
                <p style={{ color: '#555' }}>Lilongwe, Malawi</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>📧</div>
                <a href="mailto:info@chimangotour.com" style={{ color: '#e67e22', textDecoration: 'none' }}>info@chimangotour.com</a>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>📞</div>
                <a href="tel:+265123456789" style={{ color: '#e67e22', textDecoration: 'none' }}>+265 123 456 789</a>
              </div>
              <div>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>⏰</div>
                <p style={{ color: '#555' }}>Monday - Friday: 8am - 5pm</p>
                <p style={{ color: '#555' }}>Saturday: 9am - 3pm</p>
                <p style={{ color: '#555' }}>Sunday: Closed</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 style={{ color: '#e67e22', marginBottom: '20px' }}>Send us a Message</h2>
              {success && (
                <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {error && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#e67e22',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;