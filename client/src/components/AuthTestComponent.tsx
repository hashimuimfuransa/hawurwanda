import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AuthTestComponent: React.FC = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-700 dark:text-blue-300 text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300 text-sm">Not authenticated</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-green-700 dark:text-green-300 text-sm">
          Authenticated as: <strong>{user.name}</strong> ({user.role})
        </span>
      </div>
    </div>
  );
};

export default AuthTestComponent;
