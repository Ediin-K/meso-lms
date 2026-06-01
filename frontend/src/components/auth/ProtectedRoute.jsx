
import { Navigate } from "react-router-dom";
import { useAppPreferences } from "../../context/appPreferencesContext.js";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, role } = useAppPreferences();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};

export default ProtectedRoute;
