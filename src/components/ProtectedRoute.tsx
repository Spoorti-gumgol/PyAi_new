import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signup" />;
  }

  return <>{children}</>;
}