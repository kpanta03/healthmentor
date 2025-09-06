import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/user/login/', formData);
      const token = response.data.token.access;
      const role = response.data.role;

      login(token, role);

      if (role === 'admin') {
        navigate('/admin-users');
      } else {
        navigate('/');  // or user homepage
      }
    } catch (error) {
      setMessage('Login failed: ' + (error.response?.data?.errors?.non_field_errors?.[0] || 'Invalid credentials'));
    }
  };

  return (
     <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
            <h2 className="mb-4 text-center">Log In</h2>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" className="form-control" placeholder="Email" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" className="form-control" placeholder="Password" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-4">Login</button>
            <p className="mt-3 text-center">Don't have an account? <Link to="/register" style={{ color: 'blue' }}>Sign up</Link></p>
            {message && <div className="alert alert-info mt-3">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
