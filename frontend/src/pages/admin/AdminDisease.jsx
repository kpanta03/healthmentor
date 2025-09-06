import React,{useState,useContext, useEffect} from 'react';
import { AuthContext } from '../../context/AuthContext';
import PredictionList from '../../components/admin/PredictionList';
import PredictionAnalytics from '../../components/admin/PredictionAnalytics';
import axios from 'axios';

function AdminDisease() {
  const { auth } = useContext(AuthContext);
  const [activeButton, setActiveButton] = useState('viewAllPredictions');
  const [showAllPredictions, setShowAllPredictions] = useState(true);
  const [showAnalytics, setshowAnalytics] = useState(false);
  const [statistics, setStatistics] = useState({
        total: 0,
        highRisk: 0,
        moderateRisk: 0,
        lowRisk: 0
    });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/disease/statistics/', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                setStatistics(response.data);
            } catch (err) {
                console.error('Error fetching statistics:', err);
                // Fallback to fetch predictions and calculate manually
                try {
                    const predictionsResponse = await axios.get('http://localhost:8000/api/disease/history/', {
                        headers: {
                            Authorization: `Bearer ${auth.token}`,
                        },
                    });
                    const predictions = predictionsResponse.data;
                    
                    const stats = {
                        total: predictions.length,
                        highRisk: predictions.filter(p => p.probability >= 0.75).length,
                        moderateRisk: predictions.filter(p => p.probability >= 0.5 && p.probability < 0.75).length,
                        lowRisk: predictions.filter(p => p.probability < 0.5).length
                    };
                    setStatistics(stats);
                } catch (fallbackErr) {
                    console.error('Error fetching predictions for statistics:', fallbackErr);
                }
            } finally {
                setLoading(false);
            }
        };

        if (auth?.token) {
            fetchStatistics();
        }
    }, [auth]);


    const handleViewAllPredictions = () => {
    setShowAllPredictions(true);
    setshowAnalytics(false);
    setActiveButton('viewAllPredictions'); // Set active button to "View All Blogs"
  };
//   const handleshowAnalytics = () => {
//     setActiveButton('showAnalytics');
//     setshowAnalytics(true);
//     setShowAllPredictions(false);
//   }

  const StatCard = ({ icon, iconClass, value, label, loading }) => (
        <div className="col-12 col-md-6 col-lg-6 col-xl-3 mb-4">
            <div className="stat-card">
                <div className={`stat-icon ${iconClass}`}>
                    <i className={icon}></i>
                </div>
                <div className="stat-content">
                    <h3>{loading ? '...' : value}</h3>
                    <p>{label}</p>
                </div>
            </div>
        </div>
    );
    
  return (
    <div className="main-content" style={{backgroundColor:"white"}}>
      {/* header */}
     <div className="header d-flex justify-content-between align-items-center mb-5 px-lg-4 p-2">
            <h3 className="m-0"><i className="fas fa-heartbeat"></i> Disease Prediction Management</h3>
        </div>

        {/* <!-- stat rows --> */}
       <div className="container mb-4">
                <div className="row">
                    <StatCard
                        icon="fas fa-chart-line"
                        iconClass="predictions"
                        value={statistics.total}
                        label="Total Predictions"
                        loading={loading}
                    />
                    
                    <StatCard
                        icon="fas fa-exclamation-triangle"
                        iconClass="high-risk"
                        value={statistics.highRisk}
                        label="High Risk (≥75%)"
                        loading={loading}
                    />
                    
                    <StatCard
                        icon="fas fa-exclamation"
                        iconClass="moderate-risk"
                        value={statistics.moderateRisk}
                        label="Moderate Risk (50-74%)"
                        loading={loading}
                    />
                    
                    <StatCard
                        icon="fas fa-check-circle"
                        iconClass="low-risk"
                        value={statistics.lowRisk}
                        label="Low Risk (< 50%)"
                        loading={loading}
                    />
                </div>
            </div>

        {/* <!-- Quick Actions --> */}
        <div className="blog-actions mt-4">
            <h4 className="section-title mb-4">Quick Actions</h4>
            <div className="action-buttons card p-4 shadow-sm rounded">
                <div className="row g-4">
                  {/* view all users button */}
                    <div className="col-6 col-sm-6  col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'viewAllPredictions' ? 'active' : ''}`}
                              onClick={handleViewAllPredictions}>
                              <i className="fas fa-list"></i> All Predictions
                          </button>
                    </div>
                     {/* create new user button */}
                    {/* <div className="col-6 col-sm-6  col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'showAnalytics' ? 'active' : ''}`}
                              onClick={handleshowAnalytics}>
                              <i className="fas fa-list"></i>Analytics
                          </button>
                    </div>  */}
                </div>
            </div>
        </div>

        {showAllPredictions && <PredictionList />}
        
        {/* {showAnalytics && <PredictionAnalytics />} */}

    </div>
  )
}

export default AdminDisease
