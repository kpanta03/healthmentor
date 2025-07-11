
import './styles.css';
import logo from '../Assets/logo.png';
import {NavLink, Link, useNavigate} from "react-router-dom";
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");  // Redirect to login page after logout
  };

  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    if (auth.role === 'admin') {
      navigate("/admin-dashboard");  // Redirect to admin dashboard if the user is admin
    } else {
      navigate("/");  // Otherwise, redirect to home
    }
  };

  return (
    <>
     {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark px-4 py-3">
              <div className="container-fluid">
                <Link className="navbar-brand text-info fw-bold"  onClick={handleLogoClick}>
                  <img src={logo} className="logo" alt="Logo"  />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse mt-1" id="navbarNav">
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-5">
                    {auth.role === 'admin' ? (
                <>
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => (isActive ? "active nav-link" : "nav-link")} to="/admin-dashboard">Admin Dashboard</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => (isActive ? "active nav-link" : "nav-link")} to="/add-blog">Add Blogs</NavLink>
                  </li>
                </>
              ):( 
                <>
                    <li className="nav-item">
                        <NavLink className={({isActive})=>(isActive?"active nav-link":"nav-link")} aria-current="page" to="/" end>Home</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className={({isActive})=>(isActive?"active nav-link":"nav-link")}  to="/hospitals">Hospitals</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className={({isActive})=>(isActive?"active nav-link":"nav-link")}  to="/blogs">Blogs</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className={({isActive})=>(isActive?"active nav-link":"nav-link")}  to="/questions">Ask questions</NavLink>
                    </li>
                    </>   
              )}
                  </ul>


                  {/* Conditionally render Login/Logout button */}
                 {auth.isAuthenticated ? (
              <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
               ) : (
              <Link className="btn login-btn" to="/login">Login</Link>
               )}
                
                </div>
              </div>
            </nav>
    </>
  )
}

export default Navbar
