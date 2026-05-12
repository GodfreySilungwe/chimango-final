import { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Initializing Auth...');
      console.log('Raw stored token:', storedToken);
      console.log('Raw stored user:', storedUser);
      
      // Check if token exists and is NOT the string "undefined"
      const isValidToken = storedToken && 
                           storedToken !== 'undefined' && 
                           storedToken !== 'null' &&
                           storedToken !== '';
      
      console.log('Is valid token:', isValidToken);
      
      if (isValidToken) {
        setToken(storedToken);
        
        // Safely parse user data
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Restored user:', parsedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Failed to parse user:', e);
            localStorage.removeItem('user');
          }
        }
        
        // Backend has no /api/users/me route, so use cached data only
        setLoading(false);
      } else {
        console.log('No valid token found - clearing storage');
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchUser = async (authToken) => {
    console.warn('Backend does not expose /api/users/me; using local cached user data only.');
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      
      const text = await res.text();
      console.log('Raw response:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      const { token: newToken, user: userData } = data;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response: missing token or user');
      }
      
      console.log('Login successful, storing token');
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  const register = async (fullName, email, password, phone) => {
    try {
      console.log('Register attempt for:', email);
      
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password, phone })
      });
      
      console.log('Register response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      
      const text = await res.text();
      console.log('Raw response:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      const { token: newToken, user: userData } = data;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response: missing token or user');
      }
      
      console.log('Registration successful, storing token');
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};