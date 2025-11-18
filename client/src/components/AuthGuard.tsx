import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { bookingService } from '../services/api';
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
  const [isCheckingBookings, setIsCheckingBookings] = useState(false);
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

    // Special handling for clients: check booking status
    if (normalizedRole === 'client') {
      const checkClientRedirect = async () => {
        setIsCheckingBookings(true);
        try {
          // Fetch client's bookings
          const response = await bookingService.getBookings();
          
          // Extract bookings list
          let bookingsList = [];
          if (response.data?.bookings) {
            bookingsList = response.data.bookings;
          } else if (response.data) {
            bookingsList = response.data;
          } else if (Array.isArray(response)) {
            bookingsList = response;
          }
          
          // If client has bookings, go to profile page
          // If client has no bookings, go to salon list page
          if (bookingsList.length > 0) {
            // Client has bookings, go to profile
            if (location.pathname !== '/profile') {
              navigate('/profile', { replace: true });
            }
          } else {
            // Client has no bookings, go to salon list
            if (location.pathname !== '/salons') {
              navigate('/salons', { replace: true });
            }
          }
        } catch (error) {
          // If there's an error fetching bookings, default to profile page
          if (location.pathname !== '/profile') {
            navigate('/profile', { replace: true });
          }
        } finally {
          setIsCheckingBookings(false);
        }
      };

      // Only check bookings if we're not already on the target pages
      if (location.pathname !== '/profile' && location.pathname !== '/salons') {
        checkClientRedirect();
      }
    }
  }, [user, isLoading, normalizedRequiredRoles, navigate, location, redirectTo, normalizedRole]);

  // Show loading spinner while checking authentication
  if (isLoading || isCheckingBookings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            {isCheckingBookings ? 'Checking your bookings...' : 'Checking authentication...'}
          </p>
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

  // For clients, only render if they're on the correct page based on booking status
  if (normalizedRole === 'client') {
    // Children will be rendered if we're on the correct page
    // The useEffect above handles the redirection
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default AuthGuard;