import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { adminService, bookingService, notificationService, salonService } from '../services/api';
import { 
  Users, 
  Building2, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Bell,
  Search,
  Filter,
  Eye,
  Shield,
  Home,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  Download,
  PieChart,
  LineChart,
  Settings,
  Zap,
  FileText,
  AlertTriangle,
  Target,
  Award,
  Briefcase,
  Star,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RefreshCw,
  Heart,
  Timer,
  Camera,
  User,
  Scissors,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import CreateUserModal from '../components/admin/CreateUserModal';
import SalonDetailsModal from '../components/admin/SalonDetailsModal';

const AdminPanel: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { language } = useTranslationStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showSalonDetailsModal, setShowSalonDetailsModal] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [selectedSalonData, setSelectedSalonData] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [salonStatusFilter, setSalonStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  // Staff management state
  const [showStaffDetailsModal, setShowStaffDetailsModal] = useState(false);
  const [showStaffMigrationModal, setShowStaffMigrationModal] = useState(false);
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedSalonForMigration, setSelectedSalonForMigration] = useState<string>('');
  const [selectedStaffServices, setSelectedStaffServices] = useState<string[]>([]);
  
  // Booking management state
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Redirect super admins to super admin dashboard
  useEffect(() => {
    if (user?.role === 'superadmin') {
      navigate('/superadmin');
    } else if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render if not authorized
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Dashboard data
  const { data: reportsData } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminService.getReports(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
  });

  const { data: salonsData } = useQuery({
    queryKey: ['admin-salons'],
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

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminService.getAllBookings(),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => adminService.getActivities(),
  });

  // Pending salons for verification tab
  const { data: pendingSalonsData } = useQuery({
    queryKey: ['admin-pending-salons'],
    queryFn: () => adminService.getPendingSalons(),
  });

  // Analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics', dateRange],
    queryFn: () => adminService.getComprehensiveStats(),
  });

  // Staff management data
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['admin-staff', searchTerm, selectedRole],
    queryFn: () => adminService.getAllStaff({ search: searchTerm, role: selectedRole }),
  });

  // Extract data from API responses (handle both direct arrays and nested data structures)
  const users = Array.isArray(usersData) ? usersData : (usersData?.data?.users || usersData?.data || []);
  const salons = Array.isArray(salonsData) ? salonsData : ((salonsData as any)?.data?.salons || (salonsData as any)?.data || []);
  const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data?.bookings || bookingsData?.data || []);
  const staff = Array.isArray(staffData) ? staffData : (staffData?.data?.staff || staffData?.data || []);
  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data?.notifications || notificationsData?.data || []);
  const reports = reportsData?.data || reportsData || {};
  const analytics = analyticsData?.data || analyticsData || {};
  const pendingSalons = Array.isArray(pendingSalonsData) ? pendingSalonsData : (pendingSalonsData?.data?.salons || pendingSalonsData?.data || []);
  const activities = Array.isArray(activitiesData) ? activitiesData : (activitiesData?.data?.activities || activitiesData?.data || []);

  // Derived owners from users
  const owners = (users || []).filter((u: any) => u.role === 'owner');

  // Salon details query
  const { data: salonDetails, isLoading: salonDetailsLoading } = useQuery({
    queryKey: ['salon-details', selectedSalonId],
    queryFn: () => adminService.getSalonDetails(selectedSalonId!),
    enabled: !!selectedSalonId && showSalonDetailsModal,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => adminService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User created successfully');
      setShowCreateUserModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const verifySalonMutation = useMutation({
    mutationFn: (salonId: string) => adminService.verifySalon(salonId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-salons'] });
      toast.success('Salon verified successfully');
      setShowSalonDetailsModal(false);
      setSelectedSalonId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify salon');
    },
  });

  const rejectSalonMutation = useMutation({
    mutationFn: (salonId: string) => adminService.verifySalon(salonId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-salons'] });
      toast.success('Salon rejected');
      setShowSalonDetailsModal(false);
      setSelectedSalonId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject salon');
    },
  });

  // Verify owner mutation
  const verifyUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.updateUser(userId, { isVerified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Owner verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify owner');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) => adminService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const markAllNotificationsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const markNotificationRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  // Staff management mutations
  const updateStaffSalonMutation = useMutation({
    mutationFn: ({ staffId, salonId }: { staffId: string; salonId: string }) => 
      adminService.updateStaffSalon(staffId, salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff salon updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff salon');
    },
  });

  const deactivateStaffMutation = useMutation({
    mutationFn: (staffId: string) => adminService.deactivateStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate staff');
    },
  });

  const activateStaffMutation = useMutation({
    mutationFn: (staffId: string) => adminService.activateStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate staff');
    },
  });

  const updateStaffServicesMutation = useMutation({
    mutationFn: ({ staffId, services }: { staffId: string; services: string[] }) => 
      adminService.updateStaffServices(staffId, services),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff services updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff services');
    },
  });

  // Booking management mutations
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) => 
      adminService.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: string) => adminService.deleteBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    },
  });

  // Filter functions
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const filteredSalons = salons.filter((s: any) => {
    const matchesSearch = s.name?.toLowerCase().includes(ownerSearchTerm.toLowerCase());
    const matchesStatus = !salonStatusFilter || (s.verificationStatus || s.status) === salonStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch = b.salonId?.name?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
                         b.clientId?.name?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
                         b.serviceId?.title?.toLowerCase().includes(bookingSearchTerm.toLowerCase());
    const matchesStatus = !bookingStatusFilter || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const stats = {
    totalUsers: users.length,
    totalSalons: salons.length,
    totalBookings: bookings.length,
    pendingSalons: pendingSalons.length || salons.filter((s: any) => s.verificationStatus === 'pending').length,
    verifiedSalons: salons.filter((s: any) => s.verificationStatus === 'verified').length,
    activeBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
    completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
    revenue: bookings
      .filter((b: any) => b.status === 'completed')
      .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
  };

  // Staff management handlers
  const handleViewStaff = (staff: any) => {
    setSelectedStaff(staff);
    setShowStaffDetailsModal(true);
  };

  const handleMigrateStaff = (staff: any) => {
    setSelectedStaff(staff);
    setShowStaffMigrationModal(true);
  };

  const handleStaffMigration = () => {
    if (selectedStaff && selectedSalonForMigration) {
      updateStaffSalonMutation.mutate({
        staffId: selectedStaff._id,
        salonId: selectedSalonForMigration,
      });
      setShowStaffMigrationModal(false);
      setSelectedStaff(null);
      setSelectedSalonForMigration('');
    }
  };

  const handleDeactivateStaff = (staff: any) => {
    if (window.confirm(`Are you sure you want to deactivate ${staff.name}?`)) {
      deactivateStaffMutation.mutate(staff._id);
    }
  };

  const handleActivateStaff = (staff: any) => {
    if (window.confirm(`Are you sure you want to activate ${staff.name}?`)) {
      activateStaffMutation.mutate(staff._id);
    }
  };

  const handleAssignServices = (staff: any) => {
    setSelectedStaff(staff);
    setSelectedStaffServices(staff.assignedServices || []);
    setShowServiceAssignmentModal(true);
  };

  const handleServiceAssignment = () => {
    if (selectedStaff) {
      // Update staff services
      updateStaffServicesMutation.mutate({
        staffId: selectedStaff._id,
        services: selectedStaffServices,
      });
      setShowServiceAssignmentModal(false);
      setSelectedStaff(null);
      setSelectedStaffServices([]);
    }
  };

  const toggleServiceAssignment = (serviceId: string) => {
    setSelectedStaffServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Booking management handlers
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: string) => {
    updateBookingStatusMutation.mutate({ bookingId, status });
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                  <p className="text-blue-100 text-lg">Here's your system overview for today</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white transition-all duration-200 flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                  <div className="text-right text-blue-100">
                    <p className="text-sm">Last updated</p>
                    <p className="text-xs">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Salons</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSalons}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.revenue.toLocaleString()} RWF</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <DollarSign className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 border-2 border-transparent hover:border-blue-200"
                  >
                    <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">View Bookings</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('salons')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-all duration-200 border-2 border-transparent hover:border-green-200"
                  >
                    <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">Manage Salons</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-200 border-2 border-transparent hover:border-purple-200"
                  >
                    <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">User Management</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-all duration-200 border-2 border-transparent hover:border-orange-200"
                  >
                    <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">Analytics</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 border-2 border-transparent hover:border-red-200"
                  >
                    <div className="p-3 bg-red-500 rounded-xl group-hover:scale-110 transition-transform relative">
                      <Bell className="h-6 w-6 text-white" />
                      {notifications.filter((n: any) => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {notifications.filter((n: any) => !n.read).length}
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">Notifications</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="group flex flex-col items-center p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-all duration-200 border-2 border-transparent hover:border-teal-200"
                  >
                    <div className="p-3 bg-teal-500 rounded-xl group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="mt-2 text-sm font-semibold text-gray-700">Reports</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Salons Alert */}
            {stats.pendingSalons > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
                  <div>
                    <h4 className="text-lg font-bold text-amber-900">Pending Salon Verifications</h4>
                    <p className="text-amber-700 mt-1">
                      You have {stats.pendingSalons} salon{stats.pendingSalons > 1 ? 's' : ''} waiting for verification.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">Manage all users in the system</p>
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create User</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="client">Client</option>
                  <option value="owner">Salon Owner</option>
                  <option value="admin">Admin</option>
                  <option value="barber">Barber</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u: any) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{u.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                            u.role === 'barber' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                const name = prompt('Update name', u.name || '');
                                const phone = prompt('Update phone', u.phone || '');
                                const role = prompt('Update role (client/owner/admin/barber)', u.role || 'client');
                                if (name !== null || phone !== null || role !== null) {
                                  updateUserMutation.mutate({ userId: u._id, updates: { name, phone, role } });
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                  deleteUserMutation.mutate(u._id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Salon Verification</h2>
                <p className="text-gray-600 mt-1">Review and approve pending salons</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingSalons.map((salon: any) => (
                <div key={salon._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {salon.coverImages && salon.coverImages[0] && (
                    <div className="h-40 overflow-hidden">
                      <img src={salon.coverImages[0]} alt={salon.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{salon.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{salon.address}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{salon.district || salon.city || 'Rwanda'}</span>
                      </div>
                      {salon.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{salon.phone}</span>
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{salon.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSalonId(salon._id);
                          setSelectedSalonData(salon);
                          setShowSalonDetailsModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => verifySalonMutation.mutate(salon._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => rejectSalonMutation.mutate(salon._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingSalons.length === 0 && (
                <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
                  No pending salons to verify
                </div>
              )}
            </div>
          </div>
        );

      case 'salons':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Salon Management</h2>
              <p className="text-gray-600 mt-1">Verify and manage salon registrations</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search salons..."
                    value={ownerSearchTerm}
                    onChange={(e) => setOwnerSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={salonStatusFilter}
                  onChange={(e) => setSalonStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="flex items-center justify-end">
                  <button onClick={() => { setSalonStatusFilter(''); setOwnerSearchTerm(''); }} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Clear</button>
                </div>
              </div>
            </div>

            {/* Salons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon: any) => (
                <div key={salon._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {salon.coverImages && salon.coverImages[0] && (
                    <div className="h-48 overflow-hidden">
                      <img src={salon.coverImages[0]} alt={salon.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{salon.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{salon.address}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        salon.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        salon.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {salon.verificationStatus}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {salon.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {salon.email}
                      </div>
                      {/* Simple performance highlights derived from bookings */}
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div className="bg-blue-50 text-blue-700 rounded px-2 py-1 text-center">
                          {bookings.filter((b: any) => b.salonId?._id === salon._id).length} bookings
                        </div>
                        <div className="bg-green-50 text-green-700 rounded px-2 py-1 text-center">
                          {bookings.filter((b: any) => b.salonId?._id === salon._id && b.status === 'completed').length} completed
                        </div>
                        <div className="bg-amber-50 text-amber-700 rounded px-2 py-1 text-center">
                          {bookings.filter((b: any) => b.salonId?._id === salon._id && b.status === 'confirmed').length} active
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSalonId(salon._id);
                          setSelectedSalonData(salon);
                          setShowSalonDetailsModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                      {salon.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => verifySalonMutation.mutate(salon._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => rejectSalonMutation.mutate(salon._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'owners':
        function setShowUserModal(arg0: boolean) {
          throw new Error('Function not implemented.');
        }

        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Salon Owners</h2>
              <p className="text-gray-600 mt-1">Manage salon owner accounts</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={ownerSearchTerm}
                  onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-4">
              {owners.map((owner) => (
                <div key={owner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {owner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                        <p className="text-sm text-gray-500">{owner.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      owner.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {owner.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900">{owner.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Salons:</span>
                      <span className="text-gray-900">{owner.salons?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Joined:</span>
                      <span className="text-gray-900">{new Date(owner.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                    <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(owner);
                        setShowUserModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Manage
                    </button>
                    {!owner.isVerified && (
                      <button
                        onClick={() => verifyUserMutation.mutate(owner._id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salons</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {owners.map((owner) => (
                      <tr key={owner._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {owner.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                              <div className="text-sm text-gray-500">{owner.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{owner.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{owner.salons?.length || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            owner.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {owner.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(owner.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(owner);
                                const action = prompt('Owner action: verify/change-role/delete (type one)');
                                if (action === 'verify') {
                                  verifyUserMutation.mutate(owner._id);
                                } else if (action === 'change-role') {
                                  const role = prompt('New role for owner', owner.role);
                                  if (role) updateUserMutation.mutate({ userId: owner._id, updates: { role } });
                                } else if (action === 'delete') {
                                  if (window.confirm('Delete this owner?')) deleteUserMutation.mutate(owner._id);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {!owner.isVerified && (
                              <button
                                onClick={() => verifyUserMutation.mutate(owner._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
              <p className="text-gray-600 mt-1">View and manage all bookings</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{booking._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.clientId?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.salonId?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} {booking.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.totalPrice?.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                  className="text-green-600 hover:text-green-800 font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                                className="text-green-600 hover:text-green-800 font-medium"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
                  <p className="text-gray-600 mt-1">Comprehensive insights and metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(analytics.totalRevenue || stats.revenue)?.toLocaleString() || 0} RWF
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-green-900">
                        {analytics.totalBookings || stats.totalBookings}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+8% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Active Salons</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {analytics.activeSalons || stats.verifiedSalons || 0}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+5% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Customer Satisfaction</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {analytics.satisfaction || '4.8'}/5.0
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+0.2 from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Trends Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Booking Trends</h4>
                  <LineChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would appear here</p>
                  </div>
                </div>
              </div>

              {/* Revenue Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Revenue by Service</h4>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Pie chart visualization would appear here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {bookings.length > 0 ? Math.round((stats.completedBookings / bookings.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {bookings.length > 0 ? Math.round((bookings.filter((b: any) => b.status === 'cancelled').length / bookings.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Cancellation Rate</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {bookings.length > 0 ? Math.round(stats.revenue / bookings.length) : 0} RWF
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Avg. Booking Value</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">System Reports</h3>
                  <p className="text-gray-600 mt-1">Detailed analytics and insights</p>
                </div>
                <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalUsers || stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Salons</p>
                      <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalSalons || stats.totalSalons}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalBookings || stats.totalBookings}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{(reports.summary?.totalRevenue || stats.revenue)?.toLocaleString()} RWF</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users (This Month)</span>
                    <span className="font-semibold text-gray-900">{reports.userGrowth?.thisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold text-gray-900">{reports.userGrowth?.active || users.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-green-600">+{reports.userGrowth?.growthRate || 15}%</span>
                  </div>
                </div>
              </div>

              {/* Salon Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Salon Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verified Salons</span>
                    <span className="font-semibold text-gray-900">{stats.verifiedSalons}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Verification</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingSalons}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Rating</span>
                    <span className="font-semibold text-gray-900">{reports.salonPerformance?.avgRating || '4.5'} ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">System Activities</h3>
                  <p className="text-gray-600 mt-1">Recent system events and logs</p>
                </div>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-activities'] })}>
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((act: any, idx: number) => (
                    <div key={act._id || idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{act.title || act.type || 'Activity'}</p>
                        <p className="text-sm text-gray-600">{act.message || act.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600">No activities yet</div>
              )}
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-6">
            {/* Staff Management Header */}
            <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Staff Management</h3>
                  <p className="text-gray-600 mt-1">
                    Manage all salon staff members across the platform
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search staff by name, email, or salon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="barber">Barbers</option>
                    <option value="hairstylist">Hair Stylists</option>
                    <option value="nail_technician">Nail Technicians</option>
                    <option value="massage_therapist">Massage Therapists</option>
                    <option value="esthetician">Estheticians</option>
                    <option value="receptionist">Receptionists</option>
                    <option value="manager">Managers</option>
                    <option value="owner">Owners</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {staffLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading staff...</p>
                </div>
              ) : staff.length === 0 ? (
                <div className="p-8 text-center">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No staff members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staff.map((staffMember: any) => (
                        <tr key={staffMember._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {staffMember.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {staffMember.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {staffMember.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {staffMember.salonId?.name || 'No Salon'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staffMember.salonId?.address || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {staffMember.role || 'Staff'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              staffMember.isActive !== false 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {staffMember.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(staffMember.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewStaff(staffMember)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAssignServices(staffMember)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Assign Services"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleMigrateStaff(staffMember)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="Migrate to Another Salon"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              {staffMember.isActive !== false ? (
                                <button
                                  onClick={() => handleDeactivateStaff(staffMember)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Deactivate"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateStaff(staffMember)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Activate"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Notifications Header */}
            <div className="bg-gradient-to-br from-white via-white to-red-50/50 rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
                  <p className="text-gray-600 mt-1">
                    {notifications.filter((n: any) => !n.read).length} unread notifications
                  </p>
                </div>
                <button onClick={() => markAllNotificationsRead.mutate()} className="text-blue-600 hover:text-blue-700 font-medium">
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {notifications.length > 0 ? (
                notifications.map((notification: any, index: number) => (
                  <div
                    key={notification._id || index}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        <Bell className={`h-5 w-5 ${
                          notification.type === 'success' ? 'text-green-600' :
                          notification.type === 'warning' ? 'text-yellow-600' :
                          notification.type === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title || 'Notification'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message || notification.body}
                            </p>
                          </div>
                          {!notification.read && (
                            <button onClick={() => notification._id && markNotificationRead.mutate(notification._id)} className="text-xs text-blue-600 hover:underline">
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Select a tab to view content</p>
          </div>
        );
    }
  };

  // Sidebar items for admin dashboard
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'verification', label: 'Salon Verification', icon: Shield, badge: stats.pendingSalons || undefined },
    { id: 'salons', label: 'Salons', icon: Building2 },
    { id: 'owners', label: 'Owners', icon: Briefcase },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter((n: any) => !n.read).length || undefined },
  ];

  return (
    <DashboardLayout
      title="Admin"
      subtitle="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerActions={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {renderContent()}
        <CreateUserModal
          showModal={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSubmit={(userData) => createUserMutation.mutate(userData)}
        />
        <SalonDetailsModal
          showModal={showSalonDetailsModal}
          onClose={() => {
            setShowSalonDetailsModal(false);
            setSelectedSalonId(null);
            setSelectedSalonData(null);
          }}
          salonDetails={salonDetails}
          salonDetailsLoading={salonDetailsLoading}
          fallbackSalonData={selectedSalonData}
        />

        {/* Staff Details Modal */}
        {showStaffDetailsModal && selectedStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Staff Details</h3>
                  <button
                    onClick={() => setShowStaffDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedStaff.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h4>
                    <p className="text-gray-600">{selectedStaff.email}</p>
                    <p className="text-sm text-gray-500">{selectedStaff.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-sm text-gray-900">{selectedStaff.role || 'Staff'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedStaff.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStaff.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Salon</label>
                    <p className="text-sm text-gray-900">{selectedStaff.salonId?.name || 'No Salon'}</p>
                    <p className="text-xs text-gray-500">{selectedStaff.salonId?.address || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStaff.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedStaff.specialties && selectedStaff.specialties.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.specialties.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStaff.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-sm text-gray-900">{selectedStaff.experience} years</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Staff Migration Modal */}
        {showStaffMigrationModal && selectedStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Migrate Staff</h3>
                  <button
                    onClick={() => setShowStaffMigrationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Migrate <strong>{selectedStaff.name}</strong> to a different salon
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Salon
                  </label>
                  <select
                    value={selectedSalonForMigration}
                    onChange={(e) => setSelectedSalonForMigration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a salon...</option>
                    {salons
                      .filter((salon: any) => salon._id !== selectedStaff.salon?._id)
                      .map((salon: any) => (
                        <option key={salon._id} value={salon._id}>
                          {salon.name} - {salon.address}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowStaffMigrationModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStaffMigration}
                    disabled={!selectedSalonForMigration}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Migrate Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Assignment Modal */}
        {showServiceAssignmentModal && selectedStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Assign Services to Staff</h3>
                  <button
                    onClick={() => setShowServiceAssignmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedStaff.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h4>
                    <p className="text-gray-600">{selectedStaff.email}</p>
                    <p className="text-sm text-gray-500">{selectedStaff.salonId?.name || 'No Salon'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Available Services</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {salons
                      .find((salon: any) => salon._id === selectedStaff.salon?._id)
                      ?.services?.map((service: any) => (
                        <div
                          key={service._id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedStaffServices.includes(service._id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleServiceAssignment(service._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{service.title}</h5>
                              <p className="text-sm text-gray-600">{service.description}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{service.durationMinutes} minutes</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium">{service.price.toLocaleString()} RWF</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedStaffServices.includes(service._id) ? (
                                <CheckCircle className="h-6 w-6 text-blue-500" />
                              ) : (
                                <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowServiceAssignmentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleServiceAssignment}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {showBookingDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setShowBookingDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Booking Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                          <p className="text-sm text-gray-900">#{selectedBooking._id.slice(-6)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBooking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedBooking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedBooking.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                          <p className="text-sm text-gray-900 font-semibold">
                            {selectedBooking.totalPrice?.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="text-sm text-gray-900">{selectedBooking.clientId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900">{selectedBooking.clientId?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-sm text-gray-900">{selectedBooking.clientId?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Salon & Service Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Salon Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Salon Name</label>
                          <p className="text-sm text-gray-900">{selectedBooking.salonId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="text-sm text-gray-900">{selectedBooking.salonId?.address || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">District</label>
                          <p className="text-sm text-gray-900">{selectedBooking.salonId?.district || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Service</label>
                          <p className="text-sm text-gray-900">{selectedBooking.serviceId?.title || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <p className="text-sm text-gray-900">{selectedBooking.serviceId?.category || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Duration</label>
                          <p className="text-sm text-gray-900">{selectedBooking.serviceId?.durationMinutes || 'N/A'} minutes</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <p className="text-sm text-gray-900 font-semibold">
                            {selectedBooking.serviceId?.price?.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barber Information */}
                  {selectedBooking.barberId && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Stylist Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="text-sm text-gray-900">{selectedBooking.barberId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900">{selectedBooking.barberId?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-sm text-gray-900">{selectedBooking.barberId?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowBookingDetailsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleUpdateBookingStatus(selectedBooking._id, 'confirmed');
                            setShowBookingDetailsModal(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateBookingStatus(selectedBooking._id, 'cancelled');
                            setShowBookingDetailsModal(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          handleUpdateBookingStatus(selectedBooking._id, 'completed');
                          setShowBookingDetailsModal(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;