import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any page's content with this component to require login.
 * Optionally pass allowedRoles=['admin', 'project_manager'] to restrict by role.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
