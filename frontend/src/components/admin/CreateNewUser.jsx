import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function CreateNewUser() {
    const { auth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        is_admin: false,
        is_active: true,
        profile_image: null
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!formData.password2) {
            newErrors.password2 = 'Please confirm your password';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = 'Passwords do not match';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setLoading(true);
        setErrors({});
        setSuccessMessage('');
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('password', formData.password);
            submitData.append('password2', formData.password2);
            
            if (formData.profile_image) {
                submitData.append('profile_image', formData.profile_image);
            }
            
            // First create the user
            const response = await axios.post(
                'http://localhost:8000/api/user/register/',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            // If user creation is successful and we need to set admin/active status
            if (response.status === 201 && (formData.is_admin || !formData.is_active)) {
                try {
                    const updatePayload = {
                        name: formData.name,
                        is_admin: formData.is_admin,
                        is_active: formData.is_active
                    };
                    
                    await axios.put(
                        `http://localhost:8000/api/user/admin-dashboard/update/${formData.email}/`,
                        updatePayload,
                        {
                            headers: {
                                Authorization: `Bearer ${auth.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } catch (updateError) {
                    console.warn('User created but admin/status update failed:', updateError);
                }
            }
            
            setSuccessMessage('User created successfully!');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                password2: '',
                is_admin: false,
                is_active: true,
                profile_image: null
            });
            
            // Clear file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            
        } catch (error) {
            console.error('Error creating user:', error);
            
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    setErrors(error.response.data);
                } else {
                    setErrors({ general: 'Error creating user. Please try again.' });
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password2: '',
            is_admin: false,
            is_active: true,
            profile_image: null
        });
        setErrors({});
        setSuccessMessage('');
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="mt-4">
            <h4 className="section-title mb-4">Create New User</h4>
            
            <div className="card shadow-sm rounded">
                <div className="card-body p-4">
                    {successMessage && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            {successMessage}
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setSuccessMessage('')}
                            ></button>
                        </div>
                    )}
                    
                    {errors.general && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {errors.general}
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                            ></button>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Name Field */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="name" className="form-label">
                                    Full Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <div className="invalid-feedback">{errors.name}</div>
                                )}
                            </div>
                            
                            {/* Email Field */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="row">
                            {/* Password Field */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="password" className="form-label">
                                    Password <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password (min. 6 characters)"
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>
                            
                            {/* Confirm Password Field */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="password2" className="form-label">
                                    Confirm Password <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
                                    id="password2"
                                    name="password2"
                                    value={formData.password2}
                                    onChange={handleInputChange}
                                    placeholder="Confirm password"
                                />
                                {errors.password2 && (
                                    <div className="invalid-feedback">{errors.password2}</div>
                                )}
                            </div>
                        </div>
                        
                        {/* Profile Image Field */}
                        <div className="mb-3">
                            <label htmlFor="profile_image" className="form-label">
                                Profile Image (Optional)
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                id="profile_image"
                                name="profile_image"
                                onChange={handleInputChange}
                                accept="image/*"
                            />
                            <div className="form-text">
                                Choose a profile image (JPG, PNG, GIF). Max file size: 5MB
                            </div>
                        </div>
                        
                        <div className="row">
                            {/* Role Selection */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">User Role</label>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="is_admin"
                                        name="is_admin"
                                        checked={formData.is_admin}
                                        onChange={handleInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_admin">
                                        Make this user an Administrator
                                    </label>
                                </div>
                            </div>
                            
                            {/* Status Selection */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Account Status</label>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_active">
                                        Activate user account immediately
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="d-flex gap-3 mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Creating User...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus me-2"></i>
                                        Create User
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                <i className="fas fa-undo me-2"></i>
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateNewUser;