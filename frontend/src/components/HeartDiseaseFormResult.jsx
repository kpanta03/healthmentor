import React from 'react'
import { Link } from 'react-router-dom';
import SpecialityNearbyHospital from './SpecialityNearbyHospital';

function HeartDiseaseFormResult({ result }) {
  const riskColor =
    result.probability >= 0.75
      ? 'risk-high'
      : result.probability >= 0.5
        ? 'risk-medium'
        : 'risk-low';


  const splitIntoSentences = (text) => {
    // This regex splits by ., ! or ? followed by a space or end of string
    return text
      .split(/(?<=[.?!])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
  };

  // Flatten all sentences from all recommendations
  const allSentences = result.recommendations.flatMap((rec) =>
    splitIntoSentences(rec)
  );

  // Remove duplicates (case-insensitive)
  const uniqueRecommendations = Array.from(
    new Set(allSentences.map((s) => s.toLowerCase()))
  ).map(
    (lowerCaseSentence) =>
      // Find the original sentence that matches ignoring case
      allSentences.find(
        (s) => s.toLowerCase() === lowerCaseSentence
      ) || lowerCaseSentence
  );

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
                {result.prediction === 1 ? (
                  <h5>Prediction: Yes</h5>
                ) :
                  (
                    <h5>Prediction: No</h5>
                  )}
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

                {/* <ul className="list-unstyled">
                {uniqueRecommendations.map((rec, idx) => (//result.recommendations
                  <li key={idx} className="mb-3">
                    <span className="fs-5">{rec}</span>
                  </li>
                ))}
              </ul> */}

                {/* two column division */}
                <div className="row text-start">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      {uniqueRecommendations
                        .slice(0, Math.ceil(uniqueRecommendations.length / 2))
                        .map((sentence, idx) => (
                          <li key={idx} className="mb-2">
                            <span className="fs-5">{sentence}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      {uniqueRecommendations
                        .slice(Math.ceil(uniqueRecommendations.length / 2))
                        .map((sentence, idx) => (
                          <li key={idx + 1000} className="mb-2">
                            <span className="fs-5">{sentence}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div class="alert alert-warning custom-alert alert-dismissible fade show mt-4" role="alert" id="warningAlert">
                  <strong>Disclaimer:</strong> The recommendations provided here are based on predictive health data and should not be solely relied upon for diagnosing or treating medical conditions. Always consult a healthcare professional for a thorough examination.
                </div>
              </div>
            </div>

            <SpecialityNearbyHospital speciality="Cardiology" />

            <div className="text-center">
              <Link to="/blogs" className="btn btn-primary px-4 py-2 rounded-pill">
                Read Blog for More Information
                <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
            

          </div>
        </div>
      </section>

    </>
  )
}

export default HeartDiseaseFormResult
