import React, { useState, useContext, useEffect, useRef } from 'react';
import logo from '../../Assets/logo.png';
// import '../../components/admin.css';
import { AuthContext } from '../../context/AuthContext';
import { NavLink, useNavigate, Link } from 'react-router-dom';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // State for managing sidebar visibility
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const sidebarRef = useRef(null); // Create a ref for the sidebar element

  useEffect(() => {
    // Close sidebar when clicking outside of it
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false); // Close the sidebar if the click is outside
      }
    };

    // Adding event listener to handle click outside
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
   }, [navigate]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';  // Redirect to login after logout
  };

  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    navigate("/admin-users");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle sidebar visibility
  };

  return (
    <>
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
         <Link className="p-3"  onClick={handleLogoClick}>
                  <img src={logo} className="logo img-fluid" alt="Logo"  />
          </Link>
        <ul className="sidebar-menu mt-4">
          {/* <li>
            <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </NavLink>
          </li> */}

          <li>
            <NavLink to="/admin-users" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-users"></i> Users
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin-blogs" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="fas fa-blog"></i> Blogs
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin-disease-prediction">
              <i className="fas fa-stethoscope"></i> Disease Prediction
            </NavLink>
          </li>

          <li>
            <a href="#" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Hamburger menu */}
      <button className="sidebar-toggle" id="sidebar-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
    </>
  );
}

export default Sidebar;
