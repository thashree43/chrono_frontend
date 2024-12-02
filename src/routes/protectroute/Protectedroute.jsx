import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router";

export const ProtectedRoute = () => {
    const { userInfo, token } = useSelector((state) => state.user);
    const isAuthenticated = userInfo && token;
  
    const location = useLocation();
  
    // Redirect to home if trying to navigate elsewhere when authenticated
    if (isAuthenticated && location.pathname !== "/home") {
      return <Navigate to="/home" replace />;
    }
  
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  
    // If authenticated, render the child routes
    return <Outlet />;
  };
  