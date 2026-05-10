import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        sessionStorage.removeItem('pendingBooking');
        navigate('/activities');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
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
    
    setRegisterLoading(true);
    
    try {
      await register(registerFullName, registerEmail, registerPassword, registerPhone);
      
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        sessionStorage.removeItem('pendingBooking');
        navigate('/activities');
      } else {
        navigate('/');
      }
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        maxWidth: '1100px', 
        width: '100%', 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '30px',
        justifyContent: 'center'
      }}>
        
        {/* Welcome Section - LEFT */}
        <div style={{ 
          flex: '1', 
          minWidth: '280px',
          backgroundColor: '#e67e22', 
          borderRadius: '16px', 
          padding: '40px 30px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🌍</div>
          <h2 style={{ marginBottom: '15px' }}>Chimango Tour</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '0' }}>
            Discover the beauty of Malawi with our amazing tours and activities.
          </p>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
            Join us for an unforgettable adventure!
          </p>
        </div>

        {/* Login & Register Section - RIGHT */}
        <div style={{ 
          flex: '1.5', 
          minWidth: '400px',
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>Welcome Back!</h2>
            <p style={{ color: '#666' }}>
              Don't have an account? <strong style={{ color: '#e67e22' }}>Register below</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
            
            {/* LOGIN FORM */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                height: '100%'
              }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>Login</h3>
                
                {loginError && (
                  <div style={{ 
                    color: 'red', 
                    marginBottom: '15px', 
                    padding: '8px', 
                    backgroundColor: '#fee', 
                    borderRadius: '6px',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}>
                    {loginError}
                  </div>
                )}
                
                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••"
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                    <Link to="/forgot-password" style={{ color: '#e67e22', fontSize: '12px', textDecoration: 'none' }}>
                      Forgot Password?
                    </Link>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loginLoading}
                    style={{ 
                      width: '100%', 
                      padding: '11px', 
                      backgroundColor: '#e67e22', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      opacity: loginLoading ? 0.7 : 1
                    }}
                  >
                    {loginLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>

            {/* REGISTER FORM */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                height: '100%'
              }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px', textAlign: 'center' }}>Register</h3>
                
                {registerError && (
                  <div style={{ 
                    color: 'red', 
                    marginBottom: '15px', 
                    padding: '8px', 
                    backgroundColor: '#fee', 
                    borderRadius: '6px',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}>
                    {registerError}
                  </div>
                )}
                
                <form onSubmit={handleRegister}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Full Name</label>
                    <input
                      type="text"
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="0888888888"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      placeholder="•••••• (min 6)"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={registerLoading}
                    style={{ 
                      width: '100%', 
                      padding: '11px', 
                      backgroundColor: '#2ecc71', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      opacity: registerLoading ? 0.7 : 1
                    }}
                  >
                    {registerLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '25px', 
            paddingTop: '15px', 
            borderTop: '1px solid #eee',
            fontSize: '11px',
            color: '#999'
          }}>
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;