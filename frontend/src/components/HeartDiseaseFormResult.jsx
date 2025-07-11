import React from 'react'

function HeartDiseaseFormResult({result}) {
const riskColor =
  result.probability >= 0.75
    ? 'risk-high'
    : result.probability >= 0.5
    ? 'risk-medium'
    : 'risk-low';


  return (
    <>
     {/* <!-- After Form Submission: Result Section --> */}
      <section class="container my-5" id="submitResultSection">
        <div class="row justify-content-center text-center">
          <div class="col-12 col-md-11">

            {/* <!-- Prediction Summary Card --> */}
            <div class="card result-card shadow-lg bg-info text-white border-0 mb-4 rounded-4">
              <div class="card-body py-4">
                <h5 class="card-title mb-3 text-center">Heart Disease Prediction</h5>

                <p class="card-text fs-5 mb-3">Based on your health data, our prediction tool estimates your likelihood of having heart disease.</p>
                <h3 className={`display-4 fw-bold ${riskColor}`}>{Math.round(result.probability * 100)}% Risk</h3>

                <p className="fw-light mb-4">
                {result.probability >= 0.75 ? "High risk." : result.probability >= 0.5 ? "Moderate to high risk." : "Low risk."} It's recommended that you consult with a healthcare professional for further evaluation.
              </p>
              </div>
            </div>
            
            {/* <!-- Health Recommendations Section --> */}
            <div class="card result-card shadow-lg bg-success text-white border-0 mb-4 rounded-4">
              <div class="card-body py-4">
                <h5 class="card-title mb-4 custom-title">Health Recommendations</h5>


                 <ul className="list-unstyled">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="mb-3">
                    <span className="fs-5">{rec}</span>
                  </li>
                ))}
              </ul>

                <div class="alert alert-warning custom-alert alert-dismissible fade show mt-4" role="alert" id="warningAlert">
                  <strong>Disclaimer:</strong> The recommendations provided here are based on predictive health data and should not be solely relied upon for diagnosing or treating medical conditions. Always consult a healthcare professional for a thorough examination.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </>
  )
}

export default HeartDiseaseFormResult
