import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setError('No reset token provided');
      setVerifying(false);
      return;
    }

    verifyToken(token);
  }, [location]);

  const verifyToken = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.message === 'Token valid') {
        setTokenValid(true);
        setMessage('Token verified! Please enter your new password.');
      } else {
        setError('Invalid or expired reset link');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired reset link');
    } finally {
      setVerifying(false);
    }
  };

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return '#e74c3c';
    if (passwordStrength <= 2) return '#e67e22';
    if (passwordStrength <= 3) return '#f39c12';
    if (passwordStrength <= 4) return '#2ecc71';
    return '#27ae60';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      if (response.ok) {
        setMessage('✅ Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (verifying) {
    return (
      <div className="reset-verifying">
        <div className="verifying-spinner"></div>
        <h2>Verifying reset link...</h2>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className="reset-error-page">
        <div className="error-card">
          <div className="error-icon">🔗</div>
          <h2>Invalid Reset Link</h2>
          <p>{error}</p>
          <Link to="/forgot-password" className="btn-request">
            Request New Reset Link →
          </Link>
          <Link to="/login" className="btn-back-link">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-container">
        {/* Left Side - Brand Section */}
        <div className="reset-brand">
          <div className="brand-content">
            <div className="brand-icon">🔐</div>
            <h1>Reset Password</h1>
            <p>Create a new secure password for your account</p>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="reset-form-container">
          <div className="form-header">
            <h2>Create New Password</h2>
            <p>Enter your new password below</p>
          </div>

          {message && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    />
                  </div>
                  <div className="strength-text" style={{ color: getStrengthColor() }}>
                    Password strength: {getStrengthText()}
                  </div>
                </div>
              )}
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={password.length >= 6 ? 'valid' : ''}>
                    <span className="req-icon">{password.length >= 6 ? '✓' : '○'}</span> At least 6 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                    <span className="req-icon">{/[A-Z]/.test(password) ? '✓' : '○'}</span> One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'valid' : ''}>
                    <span className="req-icon">{/[0-9]/.test(password) ? '✓' : '○'}</span> One number
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="input-error">Passwords do not match</div>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <div className="input-success">✓ Passwords match</div>
              )}
            </div>

            <button
              type="submit"
              className="btn-reset"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            >
              {loading ? (
                <span className="btn-loading">Resetting password...</span>
              ) : (
                'Reset Password →'
              )}
            </button>

            <div className="form-footer">
              <Link to="/login">← Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;