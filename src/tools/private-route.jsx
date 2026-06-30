import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded?.role !== "ADMIN") {
      localStorage.removeItem("accessToken");
      return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }
  } catch (error) {
    localStorage.removeItem("accessToken");
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
