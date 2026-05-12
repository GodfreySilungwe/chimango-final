import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'If an account exists with this email, you will receive a password reset link.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        {/* Left Side - Brand Section */}
        <div className="forgot-brand">
          <div className="brand-content">
            <div className="brand-icon">🔐</div>
            <h1>Forgot Password?</h1>
            <p>Don't worry, we'll help you reset it</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Secure password reset</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Quick recovery process</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>24/7 support available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="forgot-form-container">
          <div className="form-header">
            <h2>Reset Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {message && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <div>
                <strong>Check your email</strong>
                <p>{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-reset"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">Sending reset link...</span>
              ) : (
                'Send Reset Link →'
              )}
            </button>

            <div className="form-footer">
              <Link to="/login" className="back-link">
                ← Back to Login
              </Link>
            </div>

            <div className="help-text">
              <p>Need assistance? <Link to="/contact">Contact Support</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;