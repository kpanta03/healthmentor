// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../../context/AuthContext';

// function PredictionAnalytics() {
//   const { auth } = useContext(AuthContext);
//   const [chart, setChart] = useState(null);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const response = await axios.get('http://localhost:8000/api/disease/analytics/', {
//           headers: { Authorization: `Bearer ${auth.token}` }
//         });
//         setChart(response.data.risk_pie_chart);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     if (auth?.token) fetchAnalytics();
//   }, [auth]);

//   return (
//     <div className="container mt-4">
//       <h3>Disease Prediction Analytics</h3>
//       {chart ? (
//         <img src={`data:image/png;base64,${chart}`} alt="Risk Distribution" className="img-fluid" />
//       ) : (
//         <p>Loading chart...</p>
//       )}
//     </div>
//   );
// }

// export default PredictionAnalytics;
