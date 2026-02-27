import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("cesl_user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
