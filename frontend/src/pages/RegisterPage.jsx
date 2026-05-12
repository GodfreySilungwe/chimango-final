import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.fullName.length < 2) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }
    
    if (!acceptTerms) {
      setError('Please accept the Terms and Conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting to register:', formData.email);
      await register(formData.fullName, formData.email, formData.password, formData.phone);
      console.log('Registration successful');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Brand Section */}
        <div className="register-brand">
          <div className="brand-content">
            <div className="brand-icon">🌍✨</div>
            <h1 className="brand-title">Join Chimango Tour</h1>
            <p className="brand-tagline">Start your African adventure today</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Access exclusive deals</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Save your favorite activities</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Manage your bookings</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Earn loyalty rewards</span>
              </div>
            </div>
            <div className="brand-testimonial">
              <div className="testimonial-quote">"</div>
              <p>"Chimango Tour made our Malawi trip unforgettable! The booking process was seamless."</p>
              <div className="testimonial-author">— Michael T. ⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-container">
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Join our community of adventurers</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number <span className="optional">(Optional)</span></label>
              <div className="input-wrapper">
                <span className="input-icon">📞</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+265 888 123 456"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={formData.password.length >= 6 ? 'valid' : ''}>✓ At least 6 characters</li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>✓ One uppercase letter</li>
                  <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>✓ One number</li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="input-error">Passwords do not match</div>
              )}
            </div>

            <div className="form-group terms-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  I agree to the <Link to="/terms">Terms of Service</Link> and 
                  <Link to="/privacy"> Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">Creating account...</span>
              ) : (
                'Create Account →'
              )}
            </button>

            <div className="form-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>

            <div className="auth-divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-signup">
              <button type="button" className="social-btn google">
                <span>G</span> Google
              </button>
              <button type="button" className="social-btn facebook">
                <span>f</span> Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;