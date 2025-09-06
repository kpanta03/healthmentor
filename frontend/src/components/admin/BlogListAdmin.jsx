import React, { useState, useEffect } from 'react';
import axios from 'axios';
import blogdefault from '../../Assets/blog.jpeg';
import { Link } from 'react-router-dom'; 

function BlogListAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  useEffect(() => {
    // Fetch blogs from the API
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/blogs/blogs/');
        // Sort blogs from latest to oldest based on 'created_at' field
        const sortedBlogs = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setBlogs(sortedBlogs);
        setFilteredBlogs(response.data);
        setCategories(['Heart Disease', 'Diabetes']);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

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
    let filtered = blogs;

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
  }, [searchQuery, selectedCategory, blogs]);

  // Pagination Logic: Get the blogs for the current page
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle Previous and Next page
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredBlogs.length / blogsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container-fluid mt-5" id="viewAllBlogs">
      {/* Blog Search and Filters */}
      <div className="row mb-4">
        <div className="col-12 col-lg-6 mb-2">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search Blogs..."
            id="blogSearchInput"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="col-12 col-lg-6 text-md-end">
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
      </div>

      {/* Blogs List */}
      <div className="row" id="blogList">
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
            <div
              key={blog.id}
              className="col-12 col-sm-9 col-md-12 col-lg-6 col-xl-4 mb-4"
              data-category={blog.category}
            >
              <div className="blog-card shadow-sm rounded">
                <div className="blog-image">
                  <img
                    src={blog.featured_image ? `http://localhost:8000${blog.featured_image}` : blogdefault}
                    className="card-img-top img-fluid rounded-top"
                    alt="Blog"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <div className="text-white p-4">
                  <Link to={`/blog/admin/${blog.slug}`} className="blog-title" style={{ textDecoration: 'underline', color:'white', fontWeight: 'bold'}}>
                    <h5 style={{fontSize: '1.2rem' }}>{blog.title}</h5>
                  </Link>

                 <p className="blog-excerpt" dangerouslySetInnerHTML={{ __html: blog.content.slice(0, 90) + '...' }} style={{fontSize:'0.9rem'}}></p>
                  <div className="blog-footer d-flex justify-content-between align-items-center">
                    <span style={{fontSize:'0.9rem'}}>
                      <i className="fas fa-calendar-day" ></i> {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                    <span style={{fontSize:'0.9rem'}}>
                      <i className="fas fa-eye"></i> {blog.views_count} Views
                    </span>
                  </div>
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
            <li className="page-item me-1">
              <button className="page-link" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
            </li>
            {[...Array(Math.ceil(filteredBlogs.length / blogsPerPage))].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className="page-item me-1">
              <button className="page-link" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredBlogs.length / blogsPerPage)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default BlogListAdmin;
