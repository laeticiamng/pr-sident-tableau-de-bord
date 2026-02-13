import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Re-export useAuth from the centralized AuthContext
export { useAuth } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";

// Protected route hook
export function useRequireAuth(redirectTo = "/auth") {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo, { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, redirectTo, location.pathname]);

  return { user, loading };
}
