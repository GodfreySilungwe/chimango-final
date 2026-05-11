import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

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

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Forgot Password</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {message && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#3498db', textDecoration: 'none' }}>Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;