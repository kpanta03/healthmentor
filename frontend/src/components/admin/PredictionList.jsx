import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

function PredictionList() {
    const { auth } = useContext(AuthContext);
    const [predictions, setPredictions] = useState([]);
    const [filteredPredictions, setFilteredPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/disease/history/', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setPredictions(response.data);
                setFilteredPredictions(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching predictions:', err);
                setError('Failed to fetch predictions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (auth?.token) {
            fetchPredictions();
        }
    }, [auth]);

    // Filter predictions based on search term, risk level, and time
    useEffect(() => {
        let filtered = [...predictions];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p => 
                (p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Risk level filter
        if (riskFilter) {
            filtered = filtered.filter(p => {
                const probability = p.probability;
                switch (riskFilter) {
                    case 'high':
                        return probability >= 0.75;
                    case 'moderate':
                        return probability >= 0.5 && probability < 0.75;
                    case 'low':
                        return probability < 0.5;
                    default:
                        return true;
                }
            });
        }

        // Time filter
        if (timeFilter) {
            const now = new Date();
            filtered = filtered.filter(p => {
                const predictionDate = new Date(p.created_at);
                switch (timeFilter) {
                    case 'today':
                        return predictionDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return predictionDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        return predictionDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredPredictions(filtered);
    }, [predictions, searchTerm, riskFilter, timeFilter]);

    const getRiskLevel = (probability) => {
        if (probability >= 0.75) return { label: 'High Risk', className: 'risk-high' };
        if (probability >= 0.5) return { label: 'Moderate Risk', className: 'risk-moderate' };
        return { label: 'Low Risk', className: 'risk-low' };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportData = () => {
        const csvContent = [
            ['User Name', 'Email', 'Age', 'Risk Level', 'Probability', 'Date', 'Cholesterol', 'Blood Pressure', 'Heart Rate'],
            ...filteredPredictions.map(p => [
                p.user?.name || 'Unknown',
                p.user?.email || '',
                p.age,
                getRiskLevel(p.probability).label,
                `${(p.probability * 100).toFixed(2)}%`,
                formatDate(p.created_at),
                p.cholesterol,
                p.blood_pressure,
                p.heart_rate
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'predictions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleViewDetails = (prediction) => {
        // Create a modal or detailed view - for now, just console log
        console.log('Prediction details:', prediction);
        alert(`Prediction Details:
Age: ${prediction.age}
Cholesterol: ${prediction.cholesterol}
Blood Pressure: ${prediction.blood_pressure}
Heart Rate: ${prediction.heart_rate}
Risk: ${getRiskLevel(prediction.probability).label}
Probability: ${(prediction.probability * 100).toFixed(2)}%`);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <>
            {/* All Predictions Section */}
            <div id="all-predictions" className="content-section active mt-4">
                <div className="card p-4 shadow-sm rounded">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="m-0">
                            <i className="fas fa-list me-2"></i>
                            Prediction History ({filteredPredictions.length} records)
                        </h5>
                        <div className="text-muted">
                            Total Predictions: {predictions.length}
                        </div>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control search-input" 
                                    placeholder="Search by user name or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select filter-dropdown"
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                            >
                                <option value="">All Risk Levels</option>
                                <option value="high">High Risk (≥75%)</option>
                                <option value="moderate">Moderate Risk (50-74%)</option>
                                <option value="low">Low Risk (&lt; 50%)</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select filter-dropdown"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                            >
                                <option value="">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className="btn btn-primary w-100"
                                onClick={exportData}
                                disabled={filteredPredictions.length === 0}
                            >
                                <i className="fas fa-download me-1"></i> Export
                            </button>
                        </div>
                    </div>

                    {/* Predictions Table */}
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>User</th>
                                    <th>Age</th>
                                    <th>Key Vitals</th>
                                    <th>Risk Level</th>
                                    <th>Probability</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPredictions.length > 0 ? (
                                    filteredPredictions.map((prediction, index) => {
                                        const risk = getRiskLevel(prediction.probability);
                                        return (
                                            <tr key={prediction.id || index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="user-avatar me-2">
                                                            {prediction.user?.name ? prediction.user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{prediction.user?.name || 'Unknown User'}</div>
                                                            <small className="text-muted">{prediction.user?.email || 'No email'}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">{prediction.age} years</span>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div>BP: {prediction.blood_pressure}</div>
                                                        <div>Chol: {prediction.cholesterol}</div>
                                                        <div>HR: {prediction.heart_rate}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        risk.className === 'risk-high' ? 'bg-danger' :
                                                        risk.className === 'risk-moderate' ? 'bg-warning' : 'bg-success'
                                                    }`}>
                                                        {risk.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                                                            <div 
                                                                className={`progress-bar ${
                                                                    prediction.probability >= 0.75 ? 'bg-danger' :
                                                                    prediction.probability >= 0.5 ? 'bg-warning' : 'bg-success'
                                                                }`}
                                                                style={{ width: `${prediction.probability * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="fw-bold">{(prediction.probability * 100).toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        {formatDate(prediction.created_at)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleViewDetails(prediction)}
                                                            title="View Details"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="fas fa-search fa-2x mb-3"></i>
                                                <div>No predictions found matching your criteria.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PredictionList;