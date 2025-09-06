import { useState, useEffect, useContext } from 'react';
// import '../../components/styles.css';
import axios from 'axios';
import blogdefault from '../../Assets/blog.jpeg';
import hero from '../../Assets/hero.png';
import { Link, useNavigate } from 'react-router-dom';
import HeartDiseaseForm from '../../components/HeartDiseaseForm';
import { AuthContext } from '../../context/AuthContext';


function HomePage() {
  const [showHeartDiseaseForm, setShowHeartDiseaseForm] = useState(false);
  const [latestBlogs, setLatestBlogs] = useState([]);// To store the latest saved blogs
  const [savedBlogs, setSavedBlogs] = useState([]); // To store bookmarked blogs
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  

  useEffect(() => {
    // Fetch the latest 3 blogs from the API
    const fetchLatestBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/blogs/blogs/');
        // Get the latest 3 blogs
        setLatestBlogs(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching latest blogs:', error);
      }
    };

     // Fetch all bookmarked blogs for the logged-in user
    const fetchSavedBlogs = async () => {
      if (auth.isAuthenticated) {
        try {
          const response = await axios.get('http://localhost:8000/api/blogs/users/bookmarked/', {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          // Ensure we always set an array
          if (Array.isArray(response.data)) {
            setSavedBlogs(response.data);
          } else if (response.data && response.data.message) {
            // Handle case when no bookmarked blogs found
            setSavedBlogs([]);
          } else {
            setSavedBlogs([]);
          }
        } catch (error) {
          console.error('Error fetching bookmarked blogs:', error);
        }
      }
    };
    fetchLatestBlogs();
    fetchSavedBlogs();

  }, [auth.isAuthenticated, auth.token]);

  // Handle bookmark functionality
  const handleBookmark = async (blogId) => {
    if (!auth.isAuthenticated) {
      alert('Please log in to bookmark blogs.');
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8000/api/blogs/blogs/bookmark/${blogId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Include the token in the headers
          },
        }
      );

      const blogToSave = latestBlogs.find(blog => blog.id === blogId);
      if (blogToSave) {
        setSavedBlogs((prev) => [...prev, blogToSave]);
      }
      alert('Blog bookmarked successfully');
    } catch (error) {
      console.error('Error bookmarking blog:', error);
      if (error.response?.data?.error === 'Blog already bookmarked') {
        alert('Blog is already bookmarked');
      } else {
        alert('Error bookmarking blog');
      }
    }
  };

  // Handle unbookmark functionality
  const handleUnbookmark = async (blogId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/blogs/blogs/unbookmark/${blogId}/`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      // Remove the blog from the bookmarked state
       setSavedBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      alert('Blog removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Error removing bookmark');
    }
  };

  // Check if the blog is bookmarked
  const isBookmarked = (blogId) => {
    return auth.isAuthenticated && Array.isArray(savedBlogs) && savedBlogs.some((blog) => blog.id === blogId);
  };

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
              {/* <button className="btn fw-bold px-4 py-2 disease-btn">Predict Diabetes</button> */}
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
              <h5 className="mb-2">Nearby Hospitals</h5>
              <p>Checkup in time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Health Blogs */}
      <section className="container mb-5">
        <h5 className="fw-bold mb-4">Health Blogs</h5>
        <div className="row g-4">
          {latestBlogs.length > 0 ? (
            latestBlogs.map((blog) => (
              <div className="col-12 col-md-6 col-lg-6 col-xl-4 mb-4 " key={blog.id}>
                <div className="blog-card shadow-sm rounded">
                  <div className="blog-image">
                    <img
                      src={blog.featured_image ? `http://localhost:8000${blog.featured_image}` : blogdefault}
                      className="card-img-top img-fluid rounded-top"
                      alt="Blog"
                      style={{ height: '190px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="text-white p-4">
                    <Link to={`/blog/${blog.slug}`} className="blog-title" style={{ textDecoration: 'underline', color: 'white', fontWeight: 'bold' }}>
                      <h5>{blog.title}</h5>
                    </Link>

                    <p className="blog-excerpt" dangerouslySetInnerHTML={{ __html: blog.content.slice(0, 80) + '...' }}></p>
                    <div className="blog-footer d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-calendar-day"></i> {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="fas fa-eye"></i> {blog.views_count} Views
                      </span>
                    </div>

                    {auth ? (
                      isBookmarked(blog.id) ? (
                        <button className="btn btn-danger mt-4" onClick={() => handleUnbookmark(blog.id)}>
                          Unsave Blog
                        </button>
                      ) : (
                        <button className="btn btn-primary mt-4" onClick={() => handleBookmark(blog.id)}>
                          Save Blog
                        </button>
                      )
                    ) : (
                      <Link to="/login" className="btn btn-primary mt-4">
                        Login to Save Blog
                      </Link>
                    )}

                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No latest blogs found.</p>
            </div>
          )}
        </div>

        <div className="text-end">
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
