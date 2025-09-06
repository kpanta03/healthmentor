import React, { useState, useEffect,useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import blogdefault from '../../Assets/blog.jpeg'; // You can set a default image

function BlogDetailAdmin({refreshStats}) {
  const { auth } = useContext(AuthContext);
  const { slug } = useParams(); // Get the blog slug from the URL
  const [blog, setBlog] = useState(null);
  const navigate = useNavigate();  // To navigate programmatically


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/blogs/blogs/${slug}/`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };
    fetchBlog();
  }, [slug]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  const handleEditClick = () => {
    navigate('/admin-blogs', { state: { blog } }); // Pass blog data to CreateBlog
  };

   // Handle Delete
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8000/api/blogs/blogs/delete/${blog.id}/`, {
          headers: {
             Authorization: `Bearer ${auth.token}`, // Assuming you store the token in localStorage
          },
        });
        refreshStats();
        alert('Blog deleted successfully!');
        navigate('/admin-blogs');  // Redirect to admin blog page after delete
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete the blog');
      }
    }
  };

  return (
    <div className="mt-3 main-content">
      <div className="row">
        <div className="col-12">
         
          <div className="blog-detail shadow-sm rounded" style={{ backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "20px" }}>
            {/* Featured Image */}
            <div className="blog-image mb-4">
              <img
                src={blog.featured_image ? `http://localhost:8000${blog.featured_image}` : blogdefault}
                className="img-fluid rounded"
                alt="Blog"
                style={{ height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>

            <div className="blog-content">
              <h3 className="blog-title" style={{ fontSize: "2.5rem", color: "#333", fontWeight: "bold" }}>
                {blog.title}
              </h3>

              {/* Blog Meta Information */}
              <div className="blog-meta mb-4" style={{ color: "#777", fontSize: "0.9rem" }}>
                <span>
                  <i className="fas fa-calendar-day"></i> {new Date(blog.created_at).toLocaleDateString()}
                </span>
                <span className="ms-3">
                  <i className="fas fa-eye"></i> {blog.views_count} Views
                </span>
              </div>

              {/* Blog Content */}
              <div className="blog-body" dangerouslySetInnerHTML={{ __html: blog.content }} style={{ color: "#555", fontSize: "1.1rem" }} />
            </div>
          </div>

           {/* Edit Button */}
            <div className="edit-delete-buttons mt-4 ms-2 mb-3">
            <button 
              className="btn btn-warning" 
              onClick={handleEditClick}
              style={{ fontSize: "1rem", fontWeight: "bold" }}
            >
              Edit Blog
            </button>
            <button 
              className="btn btn-danger ms-3" 
              onClick={handleDelete}
              style={{ fontSize: "1rem", fontWeight: "bold" }}
            >
              Delete Blog
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BlogDetailAdmin;
