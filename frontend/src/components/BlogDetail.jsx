import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import blogdefault from '../Assets/blog.jpeg'; // You can set a default image

function BlogDetail() {
  const { slug } = useParams(); // Get the blog slug from the URL
  const [blog, setBlog] = useState(null);

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


  return (
    <div className="mb-3 container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="blog-detail shadow-sm rounded " style={{ backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "20px"}}>
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

        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
