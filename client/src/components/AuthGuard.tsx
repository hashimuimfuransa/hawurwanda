import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}) => {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedRole = useMemo(() => (user?.role as string | undefined)?.toLowerCase?.() ?? '', [user]);
  const normalizedRequiredRoles = useMemo(() => requiredRoles.map((role) => role.toLowerCase()), [requiredRoles]);

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) return;

    // If no user is authenticated, redirect to login
    if (!user) {
      // Store the current location to redirect back after login
      const currentPath = location.pathname + location.search;
      navigate(redirectTo, { 
        state: { from: currentPath },
        replace: true 
      });
      return;
    }

    // If specific roles are required, check if user has the required role
    if (normalizedRequiredRoles.length > 0 && !normalizedRequiredRoles.includes(normalizedRole)) {
      // Redirect to appropriate dashboard based on user role
      const roleDashboardMap: Record<string, string> = {
        'client': '/profile',
        'barber': '/dashboard/staff',
        'hairstylist': '/dashboard/staff',
        'nail_technician': '/dashboard/staff',
        'massage_therapist': '/dashboard/staff',
        'esthetician': '/dashboard/staff',
        'receptionist': '/dashboard/staff',
        'manager': '/dashboard/staff',
        'owner': '/dashboard/owner',
        'admin': '/admin',
        'superadmin': '/superadmin'
      };

      const userDashboard = roleDashboardMap[normalizedRole] || '/profile';
      navigate(userDashboard, { replace: true });
      return;
    }
  }, [user, isLoading, normalizedRequiredRoles, navigate, location, redirectTo, normalizedRole]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render children (redirect will happen)
  if (!user) {
    return null;
  }

  // If user doesn't have required role, don't render children (redirect will happen)
  if (normalizedRequiredRoles.length > 0 && !normalizedRequiredRoles.includes(normalizedRole)) {
    return null;
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default AuthGuard;
