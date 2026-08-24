import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth अजून check होत असेल
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="mt-4 text-sm text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Login केलेला नसेल
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Admin नसेल
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin असेल
  return <Outlet />;
};

export default AdminRoute;