import { useState } from 'react';
import '../../components/styles.css';
import blog from '../../Assets/blog.jpeg';
import hero from '../../Assets/hero.png';
import { Link } from 'react-router-dom';
import HeartDiseaseForm from '../../components/HeartDiseaseForm';

function HomePage() {
  const [showHeartDiseaseForm, setShowHeartDiseaseForm] = useState(false);
  
  const handlePredictHeartDisease = () => {
    setShowHeartDiseaseForm(!showHeartDiseaseForm);
    const heartDiseaseFormSection = document.getElementById('heartDiseaseFormSection');
    if (heartDiseaseFormSection) {
      heartDiseaseFormSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
        {/* Hero Section */}
        <section className="container rounded-4 shadow-sm mt-5">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-8 mb-4 mb-md-0 ms-lg-5">
              <h1 className="display-4 fw-bold mb-3">Your Smart<br />Health Assistant</h1>
              <p className="fs-5 mb-4" style={{ color: '#85EBFF' }}>Predict, Learn, Heal</p>
              <div className="d-flex flex-wrap gap-4 py-2 diseases">
                <button className="btn fw-bold px-4 py-2 disease-btn">Predict Diabetes</button>
                <button className="btn fw-bold px-4 py-2 disease-btn" onClick={handlePredictHeartDisease}>Predict Heart Disease</button>
              </div>
            </div>
            <div className="col-md-4 text-center d-none d-md-block">
              <img src={hero} alt="Doctor AI" className="img-fluid" style={{ maxHeight: '400px' }} />
            </div>
          </div>
        </section>

       {/* Conditionally render the HeartDiseaseForm */}
      <section className="container" id="heartDiseaseFormSection">
        {showHeartDiseaseForm && <HeartDiseaseForm />}
      </section>

        {/* Prediction Cards */}
        <section className="container mb-5 ps-md-3">
          <h5 className="fw-bold mb-4">Prediction Results</h5>
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="card prediction-card text-white py-5 h-100 border-0 shadow rounded-4 bg-gradient">
                <div><i className="fas fa-procedures fa-2x mb-3"></i></div>
                <h5 className="mb-2">Disease Prediction</h5>
                <p>Chance of disease?</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card prediction-card text-white py-5 h-100 border-0 shadow rounded-4 bg-gradient">
                <div><i className="fas fa-apple-alt fa-2x mb-3"></i></div>
                <h5 className="mb-2">Healthcare Recommendation</h5>
                <p>Diets to consume for your condition.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card prediction-card text-white py-5 h-100 border-0 shadow rounded-4 bg-gradient">
                <div><i className="fas fa-hospital fa-2x mb-3"></i></div>
                <h5 className="mb-2">Nearby Hospitals/Clinics</h5>
                <p>Checkup in time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Health Blogs */}
        <section className="container mb-5">
          <h5 className="fw-bold mb-4">Health Blogs</h5>
          <div className="row g-4">
            {[1, 2, 3].map((_, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div className="card blog-card h-100 shadow-sm border-0 position-relative">
                  <div className="favorite-icon position-absolute top-0 end-0 p-3">
                    <i className="fas fa-bookmark"></i>
                  </div>
                  <img src={blog} className="card-img-top" alt="Blog" style={{ height: '200px', objectFit: 'cover' }} />
                  <div className="card-body text-white">
                    <h5 className="card-title">Healthy Living Tips</h5>
                    <p className="card-text">Explore daily routines, nutrition, and mental wellness to keep your health on track.</p>
                    <a href="#" className="btn btn-outline-light">Read More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-end mt-4">
            <Link className="btn btn-primary px-4 py-2 rounded-pill" to="/blogs">
              <i className="fas fa-file-alt me-2"></i>
              Read More Blogs
            </Link>
          </div>
        </section> 
    </>
  );
}

export default HomePage;
