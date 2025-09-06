import React,{useState, useEffect, useContext, use} from 'react';
// import blog from '../../Assets/blog.jpeg';
import BlogList from '../../components/admin/BlogListAdmin';
import CreateBlogForm from '../../components/admin/CreateBlog';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

function AdminBlogPage() {
  const [showAllBlogs, setShowAllBlogs] = useState(true);
  const [activeButton, setActiveButton] = useState('viewAllBlogs');
  const [showCreateBlogForm, setShowCreateBlogForm] = useState(false);
  const location = useLocation();
  const blogData = location.state?.blog;
  const { auth } = useContext(AuthContext);

  const [stats, setStats] = useState({
  total_blogs: 0,
  total_views: 0,
  total_bookmarks: 0,
});

const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/blogs/stats/', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch blog stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  },[auth.token]);

//If blogData is passed, show the CreateBlogForm with the blog data
   useEffect(() => {
    if (blogData) {
      setActiveButton('createNewBlog');  // Set the active button to "Create New Blog" when blog data is passed
      setShowCreateBlogForm(true);
      setShowAllBlogs(false);
    }
  }, [blogData]);

  // Function to handle the button click and show/hide the blogs section
  const handleViewAllBlogs = () => {
    setShowAllBlogs(true);
     setShowCreateBlogForm(false);
    setActiveButton('viewAllBlogs'); // Set active button to "View All Blogs"
  };

//   const handleMostViewed = () => {
//     setActiveButton('mostViewed');
//     console.log("Most Viewed");
//   };

//   const handleMostBookmarked = () => {
//     setActiveButton('mostBookmarked');
//     console.log("Most Bookmarked");
//   };

  const handleCreateNewBlog = () => {
    setActiveButton('createNewBlog');
    setShowCreateBlogForm(true);
    setShowAllBlogs(false);
  };

  return (
     <div className="main-content" style={{backgroundColor:"white"}}>
         {/* <!-- heading --> */}
        <div className="header d-flex justify-content-between align-items-center mb-5 px-lg-4 p-2">
            <h3 className="m-0"><i className="fas fa-blog"></i> Blog Management</h3>
        </div>

        {/* <!-- stat rows --> */}
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 col-md-6 col-lg-6 col-xl-3 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon blogs">
                            <i className="fas fa-blog"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_blogs}</h3>
                            <p>Total Blogs</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-6  col-xl-3 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon views">
                            <i className="fas fa-eye"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_views}</h3>
                            <p>Total Views</p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-7 col-lg-6 col-xl-4 mb-4">
                    <div className="stat-card">
                        <div className="stat-icon bookmarks">
                            <i className="fas fa-bookmark"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_bookmarks}</h3>
                            <p>Total Bookmarks</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

         {/* <!-- Blog Actions --> */}
        <div className="blog-actions mt-4">
            <h4 className="section-title mb-4">Quick Actions</h4>
            <div className="action-buttons card p-4 shadow-sm rounded">
                <div className="row g-4">
                    {/* <!-- View All Blogs Button --> */}
                      <div className="col-6 col-sm-6  col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'viewAllBlogs' ? 'active' : ''}`}
                              onClick={handleViewAllBlogs}>
                              <i className="fas fa-list"></i> View All Blogs
                          </button>
                    </div>

                    {/* <!-- Most Viewed Button -->
                    <div className="col-6 col-sm-6 col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'mostViewed' ? 'active' : ''}`}
                              onClick={handleMostViewed}>
                              <i className="fas fa-fire"></i> Most Viewed
                          </button>
                    </div>

                    {/* <!-- Most Bookmarked Button --> */}
                    {/* <div className="col-12 col-sm-6 col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'mostBookmarked' ? 'active' : ''}`}
                              onClick={handleMostBookmarked}
                          >
                              <i className="fas fa-star"></i> Most Bookmarked
                          </button>
                    </div>  */}

                    {/* <!-- Create New Blog Button --> */}
                    <div className="col-12 col-sm-6 col-xl-3">
                          <button
                              className={`btn-action w-100 ${activeButton === 'createNewBlog' ? 'active' : ''}`}
                              onClick={handleCreateNewBlog}
                          >
                              <i className="fas fa-plus"></i> Create New Blog
                          </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* View All Blogs Section */}
        {showAllBlogs && <BlogList refreshStats={fetchStats}/>}

         {/* Show/Create Blog Form */}
      {showCreateBlogForm && <CreateBlogForm blog={blogData} refreshStats={fetchStats}/>}


     </div>
  );
}
export default AdminBlogPage;

// here in navbar i write handle for both admin and user but i  don't want it for admin.rather in app.js if user is not admin show navbar and if user is admin show sidebar
