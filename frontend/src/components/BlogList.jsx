import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import blogdefault from '../Assets/blog.jpeg';
import { Link, useNavigate } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSavedBlogs, setShowSavedBlogs] = useState(false);
  const { auth } = useContext(AuthContext); // Get auth context
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch blogs from the API
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/blogs/blogs/');
        if (Array.isArray(response.data)) {
          setBlogs(response.data);
          setFilteredBlogs(response.data);
        } else {
          console.error('Error: response.data is not an array', response.data);
        }
        // You can set categories dynamically if you fetch them from the backend
        setCategories(['Heart Disease', 'Diabetes']);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();

    if (auth.isAuthenticated) {
      // Fetch saved blogs for authenticated user
      const fetchSavedBlogs = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/blogs/users/bookmarked/', {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });

          if (Array.isArray(response.data)) {
            setSavedBlogs(response.data);
          } else if (response.data && response.data.message) {
            // Handle case when no bookmarked blogs found
            setSavedBlogs([]);
          } else {
            setSavedBlogs([]);
          }
        } catch (error) {
          console.error('Error fetching saved blogs:', error);
          setSavedBlogs([]);
        }
      };
      fetchSavedBlogs();
    }
  }, [auth.isAuthenticated]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter blogs based on search query and selected category
  useEffect(() => {
    let filtered = showSavedBlogs ? savedBlogs : blogs;

    if (searchQuery) {
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, selectedCategory, blogs, savedBlogs, showSavedBlogs]);

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
      // setSavedBlogs((prev) => [...prev, { id: blogId }]); 
      const blogToSave = blogs.find(blog => blog.id === blogId);
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
      // Remove the blog from the saved blogs list
      setSavedBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      alert('Blog removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Error removing bookmark');
    }
  };

  const isBookmarked = (blogId) => {
    return Array.isArray(savedBlogs) && savedBlogs.some((blog) => blog.id === blogId);
  };


  return (
    <div className="container-fluid mt-5 px-lg-5" id="viewAllBlogs">
      {/* Blog Search and Filters */}
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2">
          <select
            className="form-select filter-dropdown"
            id="categoryFilter"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6 text-md-end">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search Blogs..."
            id="blogSearchInput"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        {auth.isAuthenticated && (
          <div className="col-12 col-md-3 text-md-end">
            <button
              className="btn btn-secondary"
              onClick={() => setShowSavedBlogs((prev) => !prev)}
            >
              {showSavedBlogs ? 'Show All Blogs' : 'Show Saved Blogs'}
            </button>
          </div>
        )}
      </div>

      {/* Blogs List */}
      <div className="row" id="blogList">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="col-12 col-md-6 col-lg-6 col-xl-4 mb-4"
              data-category={blog.category}
            >
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
                  {/* Bookmark Button */}
                  {auth.isAuthenticated && (
                    isBookmarked(blog.id) ? (
                      <button className="btn btn-danger mt-4" onClick={() => handleUnbookmark(blog.id)}>
                        Unsave Blog
                      </button>
                    ) : (
                      <button className="btn btn-primary mt-4" onClick={() => handleBookmark(blog.id)}>
                        Save Blog
                      </button>
                    )
                  )}

                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p>No blogs found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-wrapper text-center mt-5">
        <nav>
          <ul className="pagination justify-content-center">
            {/* You can implement pagination here if needed */}
            <li className="page-item me-1">
              <a className="page-link" href="#">
                Previous
              </a>
            </li>
            <li className="page-item active me-1">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item me-1">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item me-1">
              <a className="page-link" href="#">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default BlogList;
