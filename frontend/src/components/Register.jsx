import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    password2: ''
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/user/register/', formData);
      localStorage.setItem('token', response.data.token.access);
      setMessage('Signup successful!');
      navigate('/login/user')
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.msg || 'Signup failed'));
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
            <h2 className="mb-4 text-center">Sign Up</h2>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="form-control"
                placeholder="Name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input
                type="password"
                name="password2"
                id="password2"
                className="form-control"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-4">
              Register
            </button>
            <p className="mt-3 text-center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'blue' }}>Log in</Link>
            </p>
            {message && <div className="alert alert-info mt-3">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
