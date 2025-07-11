
import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Homepage from './pages/user/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './context/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
   <>
   <AuthProvider>
   <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
         <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
      </Routes>
      <Footer />
    </Router>
    </AuthProvider>
   </>
  );
}

export default App;