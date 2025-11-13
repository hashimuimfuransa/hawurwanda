import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { adminService, superAdminService, notificationService, salonService, bookingService } from '../services/api';
import { 
  Users, Building2, CheckCircle, XCircle, BarChart3, Search, Eye,
  Shield, Plus, Trash2, Edit, TrendingUp, Activity, Settings, Crown,
  UserPlus, Home, Calendar, MapPin, Phone, Mail, Clock, Star, Bell,
  Filter, Download, PieChart, LineChart, Zap, FileText, AlertTriangle,
  Target, Award, Briefcase, UserCheck, ArrowUp, ArrowDown, ExternalLink,
  RefreshCw, Heart, Timer, Camera, User, Scissors, X, DollarSign,
  Briefcase as BriefcaseIcon, ArrowRightLeft, Package, LogIn, LogOut,
  UserX, CreditCard, Wrench, Database, Server, User as UserIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import CreateUserModal from '../components/admin/CreateUserModal';
import SalonDetailsModal from '../components/admin/SalonDetailsModal';

//==============================================
// TYPE DEFINITIONS
//==============================================

type UserRole = 'client' | 'barber' | 'hairstylist' | 'nail_technician' | 'massage_therapist' | 'esthetician' | 'receptionist' | 'manager' | 'owner' | 'admin' | 'superadmin';

interface ISalon {
  _id: string;
  name: string;
  address: string;
}

interface IStatistics {
  accountAge?: number;
  bookingsCount?: number;
  lastLogin?: string;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  salonId?: ISalon | string;
  statistics?: IStatistics;
}

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isVerified?: boolean;
  salonId?: string;
}

interface SuperAdminStatsResponse {
    totalUsers: number;
    totalSalons: number;
    totalBookings: number;
    totalAdmins: number;
}

// Custom error type for API calls
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

//==============================================
// MAIN COMPONENT
//==============================================

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useTranslationStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Authorization check
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Don't render if not authorized
  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [salonStatusFilter, setSalonStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  // Additional modal states
  const [showSalonDetailsModal, setShowSalonDetailsModal] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [showStaffDetailsModal, setShowStaffDetailsModal] = useState(false);
  const [showStaffMigrationModal, setShowStaffMigrationModal] = useState(false);
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedSalonForMigration, setSelectedSalonForMigration] = useState<string>('');
  const [selectedStaffServices, setSelectedStaffServices] = useState<string[]>([]);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Settings state - moved from renderSettings to avoid hooks rule violation
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'BeautySpace',
    siteDescription: 'Your premier beauty and wellness booking platform',
    contactEmail: 'admin@beautyspace.com',
    supportPhone: '+250 123 456 789',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxBookingsPerUser: 10,
    bookingCancellationHours: 24,
    defaultBookingDuration: 60,
    platformCommission: 10, // percentage
    paymentMethods: ['cash', 'mobile_money', 'card'],
    supportedLanguages: ['en', 'fr', 'rw'],
    defaultLanguage: 'en',
    timezone: 'Africa/Kigali',
    backupFrequency: 'daily',
    logRetentionDays: 90,
  });

  // Settings handler function - moved from renderSettings to avoid hooks rule violation
  const handleSettingUpdate = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to backend
    toast.success('Setting updated successfully');
  };

  // Reports state - moved from renderReports to avoid hooks rule violation
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // API Queries
  const { data: superAdminStats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: () => superAdminService.getStats(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: () => superAdminService.getAllUsers(),
  });

  const { data: salonsData } = useQuery({
    queryKey: ['super-admin-salons'],
    queryFn: async () => {
      const [verifiedRes, pendingRes] = await Promise.all([
        salonService.getSalons({ verified: true, limit: 1000 }),
        salonService.getSalons({ verified: false, limit: 1000 })
      ]);
      const verified = verifiedRes?.data?.salons || verifiedRes?.data || verifiedRes || [];
      const unverified = pendingRes?.data?.salons || pendingRes?.data || pendingRes || [];
      // Merge and de-duplicate by _id
      const byId: Record<string, any> = {};
      [...verified, ...unverified].forEach((s: any) => { byId[s._id] = s; });
      return Object.values(byId);
    },
  });

  // Enhanced query for bookings with related data
  const { data: bookingsData } = useQuery({
    queryKey: ['super-admin-bookings-enhanced'],
    queryFn: async () => {
      try {
        const [bookingsRes, usersRes, salonsRes] = await Promise.all([
          adminService.getAllBookings(),
          superAdminService.getAllUsers(),
          // salonsData should be available from the existing query
          Promise.resolve(salonsData || [])
        ]);
        
        console.log('Bookings Data:', bookingsRes);
        console.log('Users Data for booking mapping:', usersRes);
        
        const bookings = bookingsRes?.data?.bookings || bookingsRes?.data || bookingsRes || [];
        const users = usersRes?.data?.users || usersRes?.data || usersRes || [];
        const salons = Array.isArray(salonsRes) ? salonsRes : [];
        
        // Create lookup maps
        const userMap = new Map();
        users.forEach((user: any) => {
          userMap.set(user._id, user);
        });
        
        const salonMap = new Map();
        salons.forEach((salon: any) => {
          salonMap.set(salon._id, salon);
        });
        
        // Enrich booking data
        const enrichedBookings = bookings.map((booking: any) => ({
          ...booking,
          client: booking.client || userMap.get(booking.clientId || booking.client?._id),
          salon: booking.salon || salonMap.get(booking.salonId || booking.salon?._id),
          // Service data might need a separate API call if not available
          service: booking.service || { name: booking.serviceName || 'Service Details N/A' }
        }));
        
        return enrichedBookings;
      } catch (error) {
        console.error('Error enriching bookings data:', error);
        // Fallback to original call
        const result = await adminService.getAllBookings();
        console.log('Fallback Bookings Data:', result);
        return result;
      }
    },
  });

  // Enhanced query for staff with salon data  
  const { data: staffData } = useQuery({
    queryKey: ['super-admin-staff-enhanced'],
    queryFn: async () => {
      try {
        const [staffRes, salonsRes] = await Promise.all([
          adminService.getAllStaff(),
          Promise.resolve(salonsData || [])
        ]);
        
        console.log('Staff Data:', staffRes);
        
        const staff = staffRes?.data?.staff || staffRes?.data || staffRes || [];
        const salons = Array.isArray(salonsRes) ? salonsRes : [];
        
        // Create salon lookup map
        const salonMap = new Map();
        salons.forEach((salon: any) => {
          salonMap.set(salon._id, salon);
        });
        
        // Enrich staff data
        const enrichedStaff = staff.map((member: any) => ({
          ...member,
          salon: member.salon || salonMap.get(member.salonId || member.salon?._id),
        }));
        
        return enrichedStaff;
      } catch (error) {
        console.error('Error enriching staff data:', error);
        // Fallback to original call
        const result = await adminService.getAllStaff();
        console.log('Fallback Staff Data:', result);
        return result;
      }
    },
    // Make this depend on salons data being available
    enabled: salonsData !== undefined,
  });

  const { data: reportsData } = useQuery({
    queryKey: ['super-admin-reports'],
    queryFn: () => adminService.getReports(),
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['super-admin-activities'],
    queryFn: () => superAdminService.getSystemActivities(),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['super-admin-notifications'],
    queryFn: () => adminService.getNotifications(),
  });

  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationService.getNotificationCount(),
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => superAdminService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast.success('User created successfully');
      setShowCreateUserModal(false);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: UpdateUserData }) => 
      superAdminService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast.success('User updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => superAdminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const verifySalonMutation = useMutation({
    mutationFn: ({ salonId, verified }: { salonId: string; verified: boolean }) => 
      superAdminService.verifySalon(salonId, verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-salons'] });
      toast.success('Salon verification updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update salon verification');
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      toast.success('All notifications marked as read');
    },
  });

  // Handler functions
  const handleCreateUser = (userData: CreateUserData) => {
    createUserMutation.mutate(userData);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };

  const handleVerifySalon = (salonId: string, verified: boolean) => {
    verifySalonMutation.mutate({ salonId, verified });
  };

  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsReadMutation.mutate();
  };

  // Sidebar items configuration  
  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      href: '#',
      badge: null,
    },
    {
      id: 'users',
      label: 'User Management', 
      icon: Users,
      href: '#',
      badge: null,
    },
    {
      id: 'verification',
      label: 'Salon Verification',
      icon: Shield,
      href: '#',
      badge: salonsData && salonsData.filter((s: any) => !s.verified).length > 0 ? 
        salonsData.filter((s: any) => !s.verified).length : null,
    },
    {
      id: 'salons',
      label: 'Salons',
      icon: Building2,
      href: '#',
      badge: null,
    },
    {
      id: 'owners',
      label: 'Owners',
      icon: Briefcase,
      href: '#',
      badge: null,
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: UserCheck,
      href: '#',
      badge: null,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      href: '#',
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      href: '#',
      badge: null,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      href: '#',
      badge: null,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      href: '#',
      badge: null,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '#',
      badge: notificationCount?.data?.unreadCount > 0 ? notificationCount.data.unreadCount : null,
    },
    {
      id: 'admins',
      label: 'Admin Management',
      icon: Crown,
      href: '#',
      badge: null,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      href: '#',
      badge: null,
    },
  ];

  // Simple render functions to avoid the file being too long
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening on your platform today.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Crown className="h-12 w-12 text-yellow-300 mb-2" />
              <p className="text-sm font-medium">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {superAdminStats?.data?.totalUsers || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                +12% this month
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Salons</p>
              <p className="text-3xl font-bold text-gray-900">
                {superAdminStats?.data?.totalSalons || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                +8% this month
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">
                {superAdminStats?.data?.totalBookings || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                +24% this month
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Admins</p>
              <p className="text-3xl font-bold text-gray-900">
                {superAdminStats?.data?.totalAdmins || 0}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-2">
                <Shield className="h-4 w-4 mr-1" />
                Platform staff
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <Crown className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="group p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <UserPlus className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-blue-900">Add User</p>
              <p className="text-xs text-blue-600">Manage users</p>
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className="group p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-green-900">Verify Salons</p>
              <p className="text-xs text-green-600">
                {salonsData && salonsData.filter((s: any) => !s.verified).length > 0 
                  ? `${salonsData.filter((s: any) => !s.verified).length} pending`
                  : 'All verified'
                }
              </p>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="group p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-purple-900">Analytics</p>
              <p className="text-xs text-purple-600">View insights</p>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Settings</p>
              <p className="text-xs text-gray-600">System config</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">All Systems Operational</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-900">Platform Status</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-900">Database</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-purple-900">Notifications</span>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {(notificationCount?.data?.count || 0)} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
          <button
            onClick={() => setActiveTab('activities')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <ExternalLink className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New user registration</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Salon verification completed</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Peak booking activity detected</p>
              <p className="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render functions for each tab
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateUserModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="barber">Barber</option>
            <option value="hairstylist">Hair Stylist</option>
            <option value="nail_technician">Nail Technician</option>
            <option value="massage_therapist">Massage Therapist</option>
            <option value="esthetician">Esthetician</option>
            <option value="receptionist">Receptionist</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            Total Users: {usersData?.data?.users?.length || usersData?.length || 0}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                (usersData?.data?.users || usersData || [])
                  .filter((user: IUser) => {
                    const matchesSearch = !searchTerm || 
                      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesRole = !selectedRole || user.role === selectedRole;
                    return matchesSearch && matchesRole;
                  })
                  .map((user: IUser) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'manager' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSalonVerification = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Salon Verification</h2>
        <div className="text-sm text-gray-600">
          Pending: {salonsData?.filter((s: any) => !s.verified).length || 0}
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Verification</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {salonsData?.filter((salon: any) => !salon.verified).map((salon: any) => (
            <div key={salon._id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{salon.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{salon.address}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-500">
                      <Phone className="h-4 w-4 inline mr-1" />
                      {salon.phone}
                    </span>
                    <span className="text-sm text-gray-500">
                      <Mail className="h-4 w-4 inline mr-1" />
                      {salon.email}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedSalonId(salon._id);
                      setShowSalonDetailsModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </button>
                  <button 
                    onClick={() => handleVerifySalon(salon._id, true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleVerifySalon(salon._id, false)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )) || (
            <div className="p-6 text-center text-gray-500">
              No pending salon verifications
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSalons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Salon Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={salonStatusFilter}
            onChange={(e) => setSalonStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salonsData?.map((salon: any) => (
          <div key={salon._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{salon.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                salon.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {salon.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {salon.address}
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {salon.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {salon.email}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedSalonId(salon._id);
                  setShowSalonDetailsModal(true);
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        )) || (
          <div className="col-span-full text-center py-12 text-gray-500">
            No salons found
          </div>
        )}
      </div>
    </div>
  );

  const renderOwners = () => {
    const owners = (usersData?.data?.users || usersData || []).filter((u: IUser) => u.role === 'owner');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Owner Management</h2>
          <div className="text-sm text-gray-600">
            Total Owners: {owners.length}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search owners..."
              value={ownerSearchTerm}
              onChange={(e) => setOwnerSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {owners
            .filter((owner: IUser) => 
              !ownerSearchTerm || 
              owner.name?.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
              owner.email?.toLowerCase().includes(ownerSearchTerm.toLowerCase())
            )
            .map((owner: IUser) => (
              <div key={owner._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      owner.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {owner.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone:</span>
                    <span>{owner.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Joined:</span>
                    <span>{new Date(owner.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
        <div className="text-sm text-gray-600">
          Total Staff: {Array.isArray(staffData) ? staffData.length : staffData?.data?.staff?.length || staffData?.length || 0}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(staffData) ? staffData : staffData?.data?.staff || staffData?.data || []).map((staff: any) => (
                <tr key={staff._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.salon?.name || staff.salonId?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (staff.isActive !== false && staff.status !== 'inactive') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {(staff.isActive !== false && staff.status !== 'inactive') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(bookingsData) ? bookingsData : bookingsData?.data?.bookings || bookingsData?.data || []).map((booking: any) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{booking._id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.client?.name || booking.clientId?.name || booking.clientName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.salon?.name || booking.salonId?.name || booking.salonName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.service?.name || booking.serviceId?.name || booking.serviceName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-blue-600">1.2M RWF</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">8,432</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">3.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Integration needed
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart placeholder - Integration needed
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports Center</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">User Report</h3>
              <p className="text-sm text-gray-500">Comprehensive user analytics</p>
            </div>
          </div>
          <button className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
            Generate
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Salon Report</h3>
              <p className="text-sm text-gray-500">Salon performance metrics</p>
            </div>
          </div>
          <button className="w-full bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100">
            Generate
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Revenue Report</h3>
              <p className="text-sm text-gray-500">Financial performance analysis</p>
            </div>
          </div>
          <button className="w-full bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100">
            Generate
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Booking Report</h3>
              <p className="text-sm text-gray-500">Booking trends and patterns</p>
            </div>
          </div>
          <button className="w-full bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100">
            Generate
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Activity className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Activity Report</h3>
              <p className="text-sm text-gray-500">System usage analytics</p>
            </div>
          </div>
          <button className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100">
            Generate
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Issues Report</h3>
              <p className="text-sm text-gray-500">System problems and alerts</p>
            </div>
          </div>
          <button className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100">
            Generate
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {(reportsData?.data?.reports || []).map((report: any, index: number) => (
            <div key={index} className="p-6 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-500">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                <Download className="h-4 w-4 inline mr-1" />
                Download
              </button>
            </div>
          )) || (
            <div className="p-6 text-center text-gray-500">
              No reports generated yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActivities = () => {
    // Mock activities data if none exists
    const mockActivities = [
      {
        _id: '1',
        type: 'login',
        user: { name: user?.name || 'Super Admin' },
        description: 'Logged into super admin dashboard',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        _id: '2',
        type: 'create',
        user: { name: user?.name || 'Super Admin' },
        description: 'Created new user account',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        _id: '3',
        type: 'update',
        user: { name: user?.name || 'Super Admin' },
        description: 'Updated salon verification status',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
      },
      {
        _id: '4',
        type: 'create',
        user: { name: user?.name || 'Super Admin' },
        description: 'New salon registration approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
      },
    ];

    const activities = (activitiesData?.data?.activities || activitiesData || []).length > 0 
      ? (activitiesData?.data?.activities || activitiesData || [])
      : mockActivities;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">System Activities</h2>
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['super-admin-activities'] });
              toast.success('Activities refreshed');
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.map((activity: any) => (
              <div key={activity._id} className="p-6 flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'login' ? 'bg-green-100' :
                  activity.type === 'logout' ? 'bg-red-100' :
                  activity.type === 'create' ? 'bg-blue-100' :
                  activity.type === 'update' ? 'bg-yellow-100' :
                  activity.type === 'delete' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'login' ? <LogIn className="h-4 w-4 text-green-600" /> :
                   activity.type === 'logout' ? <LogOut className="h-4 w-4 text-red-600" /> :
                   activity.type === 'create' ? <Plus className="h-4 w-4 text-blue-600" /> :
                   activity.type === 'update' ? <Edit className="h-4 w-4 text-yellow-600" /> :
                   activity.type === 'delete' ? <Trash2 className="h-4 w-4 text-red-600" /> :
                   <Activity className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user?.name || 'System'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description || activity.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.createdAt || activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <button 
          onClick={handleMarkAllNotificationsRead}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Mark All Read
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {notificationsLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : (
            (notificationsData?.notifications || notificationsData?.data?.notifications || notificationsData || []).map((notification: any) => (
              <div key={notification._id} className={`p-6 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      notification.type === 'success' ? 'text-green-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      notification.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.payload.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.payload.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            )) || (
              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminManagement = () => {
    const admins = (usersData?.data?.users || usersData || []).filter((u: IUser) => u.role === 'admin' || u.role === 'superadmin');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Admin Management</h2>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Crown className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin: IUser) => (
            <div key={admin._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  admin.role === 'superadmin' ? 'bg-red-500' : 'bg-purple-500'
                }`}>
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Role:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'superadmin' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {admin.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admin.isVerified ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone:</span>
                  <span>{admin.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Joined:</span>
                  <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {admin.role !== 'superadmin' && (
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm">
                    Manage Access
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Save All Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Settings Tabs">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'platform', label: 'Platform', icon: Server },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'backup', label: 'Backup', icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSettingsTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSettingsTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => handleSettingUpdate('siteName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <textarea
                  value={systemSettings.siteDescription}
                  onChange={(e) => handleSettingUpdate('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={systemSettings.contactEmail}
                  onChange={(e) => handleSettingUpdate('contactEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                <input
                  type="tel"
                  value={systemSettings.supportPhone}
                  onChange={(e) => handleSettingUpdate('supportPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {activeSettingsTab === 'platform' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Enable maintenance mode for system updates</p>
                </div>
                <button
                  onClick={() => handleSettingUpdate('maintenanceMode', !systemSettings.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    systemSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Allow Registrations</h3>
                  <p className="text-sm text-gray-500">Allow new users to register</p>
                </div>
                <button
                  onClick={() => handleSettingUpdate('allowRegistrations', !systemSettings.allowRegistrations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    systemSettings.allowRegistrations ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    systemSettings.allowRegistrations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
                <input
                  type="number"
                  value={systemSettings.platformCommission}
                  onChange={(e) => handleSettingUpdate('platformCommission', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                <select
                  value={systemSettings.defaultLanguage}
                  onChange={(e) => handleSettingUpdate('defaultLanguage', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Require Email Verification</h3>
                  <p className="text-sm text-gray-500">Require users to verify their email addresses</p>
                </div>
                <button
                  onClick={() => handleSettingUpdate('requireEmailVerification', !systemSettings.requireEmailVerification)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    systemSettings.requireEmailVerification ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    systemSettings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Bookings Per User</label>
                <input
                  type="number"
                  value={systemSettings.maxBookingsPerUser}
                  onChange={(e) => handleSettingUpdate('maxBookingsPerUser', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Cancellation Hours</label>
                <input
                  type="number"
                  value={systemSettings.bookingCancellationHours}
                  onChange={(e) => handleSettingUpdate('bookingCancellationHours', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
            </div>
          )}

          {activeSettingsTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) => handleSettingUpdate('backupFrequency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (Days)</label>
                <input
                  type="number"
                  value={systemSettings.logRetentionDays}
                  onChange={(e) => handleSettingUpdate('logRetentionDays', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Manual Backup</h3>
                <p className="text-sm text-gray-500 mb-3">Create a manual backup of the system</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Backup Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'verification':
        return renderSalonVerification();
      case 'salons':
        return renderSalons();
      case 'owners':
        return renderOwners();
      case 'staff':
        return renderStaffManagement();
      case 'bookings':
        return renderBookings();
      case 'analytics':
        return renderAnalytics();
      case 'reports':
        return renderReports();
      case 'activities':
        return renderActivities();
      case 'notifications':
        return renderNotifications();
      case 'admins':
        return renderAdminManagement();
      case 'settings':
        return renderSystemSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout 
      title="Super Admin Dashboard" 
      subtitle="Manage your entire platform"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNotificationClick={() => setShowNotificationModal(true)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your entire platform</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="relative inline-flex items-center p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {(notificationCount?.data?.count || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount.data.count}
                </span>
              )}
            </button>
            {(activeTab === 'users' || activeTab === 'admins') && (
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                onClick={() => setShowCreateUserModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            )}
          </div>
        </div>

        <div>
          {renderContent()}
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        showModal={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSubmit={handleCreateUser}
      />

      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              </div>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  disabled={deleteUserMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salon Details Modal */}
      {showSalonDetailsModal && selectedSalonId && (
        <SalonDetailsModal
          isOpen={showSalonDetailsModal}
          onClose={() => {
            setShowSalonDetailsModal(false);
            setSelectedSalonId(null);
          }}
          salonId={selectedSalonId}
        />
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Notifications</h3>
            </div>
            <div className="p-4">
              {notificationsLoading ? (
                <div>Loading notifications...</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;