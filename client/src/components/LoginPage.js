import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Ensure you have appropriate styling
import logo from './logo.svg'; // Import the logo image

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('https://casestudies.onrender.com/api/login', { username, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token); // Store the token in local storage
        // Trigger a manual navigation after the token is set
        window.location.href = '/admin';
      } else {
        setError('Invalid username or password'); // Show error message
      }
    } catch (err) {
      setError('Invalid username or password'); // Show error message for any error
    }
  };

  useEffect(() => {
    // Check if the token exists, and if so, navigate to the admin page
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src={logo} alt="" />
        <h2>Case Studies Login</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>} {/* Display error message */}

      </form>
    </div>
  );
};

export default LoginPage;
