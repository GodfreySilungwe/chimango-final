import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register state
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      const params = new URLSearchParams(window.location.search);
      
      if (pendingBooking && params.get('redirect') === 'booking') {
        // Redirect to activities to restore booking, keeping the pending data
        window.location.href = '/activities?restoreBooking=true';
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setLoginError(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }
    
    if (registerFullName.length < 2) {
      setRegisterError('Please enter your full name');
      return;
    }
    
    if (!registerEmail.includes('@')) {
      setRegisterError('Please enter a valid email address');
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      await register(registerFullName, registerEmail, registerPassword, registerPhone);
      
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      const params = new URLSearchParams(window.location.search);
      
      if (pendingBooking && params.get('redirect') === 'booking') {
        // Redirect to activities to restore booking, keeping the pending data
        window.location.href = '/activities?restoreBooking=true';
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setRegisterError(errorMessage);
      console.error('Registration error:', errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Load remembered email on mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Brand Section */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-icon">🌍✨</div>
            <h1 className="brand-title">Chimango Tour</h1>
            <p className="brand-tagline">Discover the Warm Heart of Africa</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Curated Experiences</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Expert Local Guides</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>Sustainable Tourism</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">✓</span>
                <span>24/7 Customer Support</span>
              </div>
            </div>
            <div className="brand-testimonial">
              <div className="testimonial-quote">"</div>
              <p>"An unforgettable experience! The team went above and beyond to make our trip special."</p>
              <div className="testimonial-author">— Sarah M. ⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="login-form-container">
          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="auth-form">
              <h2 className="form-title">Welcome Back!</h2>
              <p className="form-subtitle">Sign in to continue your journey</p>
              
              {loginError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
                
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <span className="btn-loading">Signing in...</span>
                  ) : (
                    'Sign In →'
                  )}
                </button>
              </form>
              
              <div className="auth-divider">
                <span>Or continue with</span>
              </div>
              
              <div className="social-login">
                <button className="social-btn google">
                  <span>G</span> Google
                </button>
                <button className="social-btn facebook">
                  <span>f</span> Facebook
                </button>
              </div>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div className="auth-form">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join our community of adventurers</p>
              
              {registerError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <span>{registerError}</span>
                </div>
              )}
              
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="+265 888 123 456"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      placeholder="•••••• (min 6)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                  <p className="input-hint">Password must be at least 6 characters</p>
                </div>
                
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn-submit btn-register"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <span className="btn-loading">Creating account...</span>
                  ) : (
                    'Create Account →'
                  )}
                </button>
              </form>
              
              <div className="auth-divider">
                <span>By creating an account, you agree to our</span>
              </div>
              <div className="terms-links">
                <Link to="/terms">Terms of Service</Link> &nbsp;|&nbsp;
                <Link to="/privacy">Privacy Policy</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;