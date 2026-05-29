import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.admin.token);
  return token ? children : <Navigate to="/admin/login" replace />;
}
