
import './App.css';
import './components/admin.css';
import './components/styles.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Homepage from './pages/user/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './context/ProtectedRoute';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import { useContext, useEffect } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext'; 
import Sidebar from './components/admin/Sidebar';
import BlogDetailAdmin from './components/admin/BlogDetailAdmin'; 
import AdminDashBoard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDisease from './pages/admin/AdminDisease';
import BlogPage from './pages/user/BlogPage';
import BlogDetail from './components/BlogDetail';
import HospitalsPage from './pages/user/HospitalsPage';

function Main() {
  // Now `useContext` will work because it's inside the AuthProvider
  const { auth } = useContext(AuthContext);
  // const location = useLocation();
  // const isAdminRoute = location.pathname.startsWith("/admin");

   useEffect(() => {
    if (auth.role === 'admin') {
      document.body.classList.add('admin');
      document.body.classList.remove('user');
    } 
    else {
      document.body.classList.add('user');
      document.body.classList.remove('admin');
    }
  }, [auth.role]);

  return (
    <>
       {/* Conditionally render Navbar or Sidebar based on user's role */}
      {/* {auth.role === 'admin' && isAdminRoute ? ( */}
      
      {auth.role === 'admin'? (
        <ProtectedRoute>
          <Sidebar />  {/* Wrap Sidebar in ProtectedRoute */}
        </ProtectedRoute>
      ) : (
        <Navbar />
      )}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/blogs" element={<BlogPage/>}/>
        <Route path="/hospitals" element={<HospitalsPage/>} />
        <Route path="/blog/:slug" element={<BlogDetail/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-blogs"
          element={
            <ProtectedRoute>
              <AdminBlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-disease-prediction"
          element={
            <ProtectedRoute>
              <AdminDisease />
            </ProtectedRoute>
          }
        />
        <Route path="/blog/admin/:slug" 
        element={
            <ProtectedRoute>
              <BlogDetailAdmin />
            </ProtectedRoute>}
             /> 
      </Routes>
       {auth.role !== 'admin' && <Footer />} 
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Main />
      </Router>
    </AuthProvider>
  );
}

export default App;