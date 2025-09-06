import React, { useState, useContext} from 'react';
import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AuthContext } from '../../context/AuthContext';
import DOMPurify from 'dompurify';

const CreateBlogForm = ({ blog,refreshStats}) => {
  const { auth } = useContext(AuthContext);
  
   const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    category: blog?.category || '',
    featured_image:null,
    is_active: blog?.is_active || false,
  });


  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      setError('');
      setFormData((prev) => ({ ...prev, featured_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Sanitizing content but allowing specific tags
    const sanitizedContent = DOMPurify.sanitize(formData.content, {
      ALLOWED_TAGS: [
        'strong', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'b', 'i'
      ],
    });

    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', sanitizedContent);
    form.append('category', formData.category);
    form.append('featured_image', formData.featured_image);
    form.append('is_active', formData.is_active);

    try {
       if (blog) {
        // Update existing blog (edit mode)
        await axios.put(`http://localhost:8000/api/blogs/blogs/update/${blog.id}/`, form, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        refreshStats();
        alert('✅ Blog updated successfully!');
      } else {
        // Create a new blog (create mode)
        await axios.post('http://localhost:8000/api/blogs/blogs/create/', form, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        refreshStats();
        alert('✅ Blog created successfully!');
      }

      setFormData({
        title: '',
        content: '',
        category: '',
        featured_image: null,
        is_active:false,
      });
      setImagePreview(null);
      // closeForm();
      
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modify closeForm to reset form content when cancel is clicked
  const handleCancel = () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel? All changes will be lost.');
    if (confirmCancel) {
      setFormData({
        title: '',
        content: '',
        category: '',
        featured_image: null,
        is_active: false,
      });
      setImagePreview(null);
      // closeForm(); // Call closeForm to handle any additional logic
    }
  };

  return (
    <div className="container-fluid mt-4">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row">
          {/* Left Section - Editor */}
          <div className="col-lg-8">
            <div className="mb-3">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control form-control-lg"
                placeholder="Enter blog title here..."
                required
              />
            </div>

            <div className="mb-5">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                className="bg-white"
                placeholder="Write your blog content here..."
                modules={quillModules}
                formats={quillFormats}
                style={{ height: '600px' }}
              />
            </div>
          </div>

          {/* Right Section - Sidebar */}
          <div className="col-lg-4">

            <div className="card shadow-sm p-3 mb-3">
              <h5>Save</h5>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                   {isLoading ? 'Saving...' :blog ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>

              <div className="mb-3">
              <label className="form-label fw-bold">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Health, Mental Wellness"
                required
              />
            </div>

            <div className="card shadow-sm p-3 mb-3">
              <h5>Featured Image</h5>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="img-fluid mt-2 rounded"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              )}
            </div>

             {/* Toggle for is_active */}
            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="is_active">
                  Publish this blog (visible to users)
                </label>
              </div>
            </div>


          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default CreateBlogForm;

// ReactQuill toolbar setup
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    // ['link', 'image'],
     [{ color: [] }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'font',
  'list', 'bullet',
  'align',
  // 'link', 'image',
  'color',
]; 