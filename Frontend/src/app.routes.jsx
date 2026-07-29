import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './features/components/Navbar';
import Footer from './features/components/Footer';
import Home from './features/pages/Home';
import Login from './features/pages/Login';
import Register from './features/pages/Register';
import Dashboard from './features/pages/Dashboard';
import ProtectedRoute from './features/components/ProtectedRoute';
import PublicRoute from './features/components/PublicRoute';

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default AppRoutes;
