import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore, t } from '../stores/translationStore';
import { adminService } from '../services/api';
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
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Crown,
  UserPlus,
  Home,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';

// Modal Components
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
    isVerified: true,
    salonId: ''
  });

  const [salons] = useState([]); // TODO: Load salons if needed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Create New User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0781234567"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="client">👤 Client</option>
                <option value="barber">✂️ Barber</option>
                <option value="owner">🏢 Owner</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.isVerified.toString()}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === 'true' })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="true">✅ Verified</option>
                <option value="false">⏳ Pending</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSubmit: (userData: any) => void;
  isLoading: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'client',
    isVerified: user?.isVerified || false,
    salonId: user?.salonId?._id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={user?.role === 'superadmin'}
              >
                <option value="client">👤 Client</option>
                <option value="barber">✂️ Barber</option>
                <option value="owner">🏢 Owner</option>
                <option value="admin">🛡️ Admin</option>
                {user?.role === 'superadmin' && <option value="superadmin">⚡ Super Admin</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={formData.isVerified.toString()}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === 'true' })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="true">✅ Verified</option>
              <option value="false">⏳ Pending</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white rounded-full ${
                user?.isVerified ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{user?.name}</h4>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                  user?.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                  user?.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'barber' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {user?.role === 'superadmin' && '⚡ '}
                  {user?.role === 'admin' && '🛡️ '}
                  {user?.role === 'owner' && '🏢 '}
                  {user?.role === 'barber' && '✂️ '}
                  {user?.role === 'client' && '👤 '}
                  {user?.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                  user?.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {user?.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{user?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h5 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Joined</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Account Age</p>
                  <p className="text-sm font-medium text-slate-900">
                    {user?.statistics?.accountAge || 0} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics (if available) */}
          {user?.statistics && (
            <div>
              <h5 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Star className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Total Bookings</p>
                    <p className="text-sm font-medium text-slate-900">{user?.statistics?.bookingsCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Activity className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Last Login</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user?.statistics?.lastLogin 
                        ? new Date(user.statistics.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Salon Information (if applicable) */}
          {user?.salonId && (
            <div>
              <h5 className="text-lg font-semibold text-slate-900 mb-4">Salon Information</h5>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Building2 className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{user?.salonId?.name}</p>
                  <p className="text-xs text-slate-600">{user?.salonId?.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { language } = useTranslationStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Access control
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      navigate('/');
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

  // Create admin form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Super admin data queries
  const { data: superAdminStats } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const response = await adminService.getSuperAdminStats();
      return response.data;
    },
    enabled: user?.role === 'superadmin',
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['superadmin-users', { searchTerm, selectedRole, page: currentPage }],
    queryFn: async () => {
      const response = await adminService.getAllUsers({ 
        search: searchTerm, 
        role: selectedRole,
        page: currentPage,
        limit: 10
      });
      return response.data;
    },
    enabled: user?.role === 'superadmin',
  });

  const { data: systemActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['system-activities'],
    queryFn: async () => {
      const response = await adminService.getSystemActivities();
      return response.data;
    },
    enabled: user?.role === 'superadmin',
  });

  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['superadmin-bookings', { searchTerm }],
    queryFn: async () => {
      const response = await adminService.getAllBookings({ search: searchTerm });
      return response.data;
    },
    enabled: user?.role === 'superadmin',
  });

  const { data: allSalons, isLoading: salonsLoading } = useQuery({
    queryKey: ['superadmin-salons', { searchTerm }],
    queryFn: async () => {
      const response = await adminService.getAllSalons({ search: searchTerm });
      return response.data;
    },
    enabled: user?.role === 'superadmin',
  });

  // Mutations
  const createAdminMutation = useMutation({
    mutationFn: (adminData: any) => adminService.createAdmin(adminData),
    onSuccess: () => {
      toast.success('Admin user created successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
      setShowCreateAdminModal(false);
      setAdminForm({ name: '', email: '', phone: '', password: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create admin user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUserById(userId),
    onSuccess: () => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => adminService.createUser(userData),
    onSuccess: () => {
      toast.success('User created successfully!');
      setShowCreateUserModal(false);
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) => 
      adminService.updateUserById(id, userData),
    onSuccess: () => {
      toast.success('User updated successfully!');
      setShowEditUserModal(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const updateSalonMutation = useMutation({
    mutationFn: ({ id, salonData }: { id: string; salonData: any }) =>
      adminService.updateSalon(id, salonData),
    onSuccess: () => {
      toast.success('Salon updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
    },
    onError: () => {
      toast.error('Failed to update salon');
    },
  });

  const deleteSalonMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSalon(id),
    onSuccess: () => {
      toast.success('Salon deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
    },
    onError: () => {
      toast.error('Failed to delete salon');
    },
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'admins', label: 'Admin Management', icon: Shield },
    { id: 'bookings', label: 'Bookings Management', icon: Calendar },
    { id: 'salons', label: 'Salons Management', icon: Building2 },
    { id: 'activity', label: 'System Activity', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate({
      ...adminForm,
      role: 'admin',
      isVerified: true
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ _id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };

  // New user management handlers
  const handleViewUser = async (userId: string) => {
    try {
      const response = await adminService.getUserDetails(userId);
      setSelectedUser(response.data.user);
      setShowViewUserModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load user details');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === (allUsers?.users?.length || 0)) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUsers?.users?.map((user: any) => user._id) || []);
    }
  };

  const handleBulkAction = async (action: 'verify' | 'unverify') => {
    try {
      const updates = { isVerified: action === 'verify' };
      await adminService.bulkUpdateUsers(selectedUsers, updates);
      toast.success(`Successfully ${action === 'verify' ? 'verified' : 'unverified'} ${selectedUsers.length} users`);
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update users');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Enhanced Mobile-Responsive Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Total Users Card */}
              <div className="group bg-gradient-to-br from-white via-white to-blue-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto">
                    <div className="p-2.5 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow shrink-0">
                      <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Total Users</p>
                      <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 lg:mt-1">
                        {superAdminStats?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="inline-flex items-center px-2 lg:px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs lg:text-sm font-semibold">
                      <TrendingUp className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1" />
                      +12%
                    </div>
                    <p className="text-xs text-slate-500 mt-1 lg:mt-2">vs last month</p>
                  </div>
                </div>
                <div className="mt-3 lg:mt-4 h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 animate-pulse" style={{width: '75%'}}></div>
                </div>
              </div>

              {/* Total Salons Card */}
              <div className="group bg-gradient-to-br from-white via-white to-emerald-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto">
                    <div className="p-2.5 lg:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl lg:rounded-2xl shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow shrink-0">
                      <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Total Salons</p>
                      <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 lg:mt-1">
                        {superAdminStats?.totalSalons || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="inline-flex items-center px-2 lg:px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs lg:text-sm font-semibold">
                      <TrendingUp className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1" />
                      +8%
                    </div>
                    <p className="text-xs text-slate-500 mt-1 lg:mt-2">vs last month</p>
                  </div>
                </div>
                <div className="mt-3 lg:mt-4 h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 animate-pulse" style={{width: '62%'}}></div>
                </div>
              </div>

              {/* Admin Users Card */}
              <div className="group bg-gradient-to-br from-white via-white to-amber-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto">
                    <div className="p-2.5 lg:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl lg:rounded-2xl shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow shrink-0">
                      <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">Admin Users</p>
                      <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 lg:mt-1">
                        {superAdminStats?.adminCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="inline-flex items-center px-2 lg:px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs lg:text-sm font-semibold">
                      <TrendingUp className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1" />
                      +2
                    </div>
                    <p className="text-xs text-slate-500 mt-1 lg:mt-2">this month</p>
                  </div>
                </div>
                <div className="mt-3 lg:mt-4 h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000 animate-pulse" style={{width: '45%'}}></div>
                </div>
              </div>

              {/* Monthly Bookings Card */}
              <div className="group bg-gradient-to-br from-white via-white to-purple-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] h-fit">
                <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0 sm:min-h-0">
                  <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto min-w-0">
                    <div className="p-2.5 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow shrink-0">
                      <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-slate-600 truncate leading-tight">Monthly Bookings</p>
                      <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-0.5 lg:mt-1 leading-none">
                        {superAdminStats?.monthlyBookings || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto shrink-0">
                    <div className="inline-flex items-center px-2 lg:px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs lg:text-sm font-semibold">
                      <TrendingUp className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1" />
                      +18%
                    </div>
                    <p className="text-xs text-slate-500 mt-1 lg:mt-2 leading-tight">vs last month</p>
                  </div>
                </div>
                <div className="mt-3 lg:mt-4 h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 animate-pulse" style={{width: '88%'}}></div>
                </div>
              </div>
            </div>

            {/* Enhanced Mobile-Responsive Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Modern Role Distribution Card */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/60 p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900">User Role Distribution</h3>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 self-start sm:self-auto">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  {superAdminStats?.roleDistribution?.map((role: any) => (
                    <div key={role._id} className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-slate-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full shadow-sm ${
                            role._id === 'client' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                            role._id === 'barber' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                            role._id === 'owner' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                            role._id === 'admin' ? 'bg-gradient-to-br from-red-400 to-red-600' : 
                            'bg-gradient-to-br from-slate-400 to-slate-600'
                          }`}></div>
                          <span className="font-semibold text-slate-700 capitalize group-hover:text-slate-900 transition-colors">
                            {role._id}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{role.count}</span>
                          <p className="text-xs text-slate-500">users</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            role._id === 'client' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            role._id === 'barber' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                            role._id === 'owner' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                            role._id === 'admin' ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                            'bg-gradient-to-r from-slate-400 to-slate-600'
                          }`}
                          style={{
                            width: `${Math.min((role.count / Math.max(...(superAdminStats?.roleDistribution?.map((r: any) => r.count) || [1]))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No user data available</p>
                      <p className="text-slate-400 text-sm">Role distribution will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modern System Activity Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/60 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Recent System Activity</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  {Array.isArray(systemActivities) && systemActivities?.slice(0, 6).map((activity: any, index: number) => (
                    <div key={index} className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 group-hover:text-slate-800 transition-colors">
                          {activity.message || activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-xs text-emerald-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No recent activity</p>
                      <p className="text-slate-400 text-sm">System activities will appear here</p>
                    </div>
                  )}
                </div>
                {Array.isArray(systemActivities) && systemActivities.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      View All Activity →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="bg-gradient-to-br from-white via-white to-indigo-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 flex items-center">
                    <Users className="h-6 w-6 lg:h-7 lg:w-7 mr-3 text-indigo-600" />
                    User Management
                  </h3>
                  <p className="text-slate-600 text-sm lg:text-base">Manage all platform users, roles, and permissions</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 text-sm"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="client">👤 Client</option>
                    <option value="barber">✂️ Barber</option>
                    <option value="owner">🏢 Owner</option>
                    <option value="admin">🛡️ Admin</option>
                    <option value="superadmin">⚡ Super Admin</option>
                  </select>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-indigo-500/25 text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === (allUsers?.users?.length || 0) && allUsers?.users?.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-600">Loading users...</p>
                          </div>
                        </td>
                      </tr>
                    ) : Array.isArray(allUsers?.users) && allUsers.users.length > 0 ? (
                      allUsers.users.map((user: any) => (
                        <tr 
                          key={user._id} 
                          className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/30 transition-all duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleUserSelect(user._id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-sm">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 h-4 w-4 border-2 border-white rounded-full ${
                                  user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}></div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                <div className="text-sm text-slate-500">{user.email}</div>
                                <div className="text-xs text-slate-400">{user.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              user.role === 'superadmin' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' :
                              user.role === 'admin' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800' :
                              user.role === 'owner' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' :
                              user.role === 'barber' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
                              'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800'
                            }`}>
                              {user.role === 'superadmin' && '⚡ '}
                              {user.role === 'admin' && '🛡️ '}
                              {user.role === 'owner' && '🏢 '}
                              {user.role === 'barber' && '✂️ '}
                              {user.role === 'client' && '👤 '}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              user.isVerified 
                                ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800' 
                                : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800'
                            }`}>
                              {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUser(user._id)}
                                className="group/btn p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="group/btn p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                              {user.role !== 'superadmin' && (
                                <button
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  className="group/btn p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="h-16 w-16 text-slate-300 mb-4" />
                            <p className="text-slate-500 text-lg font-medium">No users found</p>
                            <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {allUsers?.pagination && allUsers.pagination.pages > 1 && (
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Showing page {allUsers.pagination.current} of {allUsers.pagination.pages} 
                    ({allUsers.pagination.total} total users)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!allUsers.pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-900">
                      {allUsers.pagination.current}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!allUsers.pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 min-w-96">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleBulkAction('verify')}
                      className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleBulkAction('unverify')}
                      className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Unverify
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'admins':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Admin Management Header */}
            <div className="bg-gradient-to-br from-white via-white to-indigo-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900">Admin Management</h3>
                  <p className="text-sm text-slate-600 mt-1">Create and manage administrator accounts</p>
                </div>
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="group flex items-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl lg:rounded-2xl hover:from-blue-700 hover:to-indigo-800 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 font-medium"
                >
                  <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Create Admin
                </button>
              </div>
              
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="group text-center p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-xl lg:rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{superAdminStats?.adminCount || 0}</p>
                  <p className="text-xs lg:text-sm text-slate-600 font-medium">Total Admins</p>
                </div>
                <div className="group text-center p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 rounded-xl lg:rounded-2xl hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">1</p>
                  <p className="text-xs lg:text-sm text-slate-600 font-medium">Super Admins</p>
                </div>
                <div className="group text-center p-4 lg:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-xl lg:rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-3 shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{superAdminStats?.activeAdmins || 0}</p>
                  <p className="text-xs lg:text-sm text-slate-600 font-medium">Active This Month</p>
                </div>
              </div>
            </div>

            {/* Enhanced Admin List Section */}
            <div className="bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 lg:py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-lg lg:text-xl font-bold text-slate-900">Administrator Accounts</h4>
                    <p className="text-sm text-slate-600 mt-1">View and manage admin users</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs lg:text-sm font-semibold">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span>Admin Users</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === (allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length || 0) && allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length > 0}
                          onChange={(e) => {
                            const adminUsers = allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin') || [];
                            if (e.target.checked) {
                              setSelectedUsers(adminUsers.map((user: any) => user._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Admin User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-slate-600">Loading admin users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Shield className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium mb-2">No admin users found</p>
                            <p className="text-slate-400 text-sm">Create your first admin user to get started</p>
                            <button
                              onClick={() => setShowCreateAdminModal(true)}
                              className="mt-4 flex items-center mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create Admin User
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      allUsers?.users
                        ?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')
                        ?.slice((currentPage - 1) * 10, currentPage * 10)
                        ?.map((user: any, index: number) => (
                        <tr 
                          key={user._id} 
                          className="hover:bg-slate-50 transition-colors animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleUserSelect(user._id)}
                              disabled={user.role === 'superadmin'}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-semibold text-lg">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 h-4 w-4 border-2 border-white rounded-full ${
                                  user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-sm text-slate-600 truncate">
                                  {user.email}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {user.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {user.role === 'superadmin' ? '⚡ Super Admin' : '🛡️ Admin'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                              user.isVerified 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUser(user._id)}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                disabled={user.role === 'superadmin'}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                              {user.role !== 'superadmin' && (
                                <button
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) || []
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Admin Users */}
              {allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length > 10 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-slate-600">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length || 0)} of {allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length || 0} admin users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage * 10 >= (allUsers?.users?.filter((user: any) => user.role === 'admin' || user.role === 'superadmin')?.length || 0)}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Actions for Admin Users */}
              {selectedUsers.length > 0 && (
                <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm font-medium text-indigo-900">
                      {selectedUsers.length} admin user{selectedUsers.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUsers([]);
                        }}
                        className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkVerifyUsers}
                        className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Verify Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            {/* Enhanced Search and Filter Header */}
            <div className="bg-gradient-to-br from-white via-white to-purple-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">📅 Bookings Management</h3>
                  <p className="text-slate-600 text-sm lg:text-base">Monitor and manage all system bookings</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-4">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : allBookings?.bookings?.length > 0 ? (
                allBookings.bookings.map((booking: any, index: number) => (
                  <div
                    key={booking._id}
                    className={`bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{booking.service?.name}</h4>
                          <p className="text-xs text-slate-600">{booking.salon?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-slate-600">
                        <Users className="h-3 w-3 mr-2" />
                        <span>{booking.client?.name} • {booking.barber?.name}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Clock className="h-3 w-3 mr-2" />
                        <span>{new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <DollarSign className="h-3 w-3 mr-2" />
                        <span className="font-semibold">{booking.totalAmount} RWF</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">No Bookings Found</h4>
                  <p className="text-slate-600 max-w-md mx-auto">
                    No bookings match your current search criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Service & Client</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Salon & Barber</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : allBookings?.bookings?.length > 0 ? (
                      allBookings.bookings.map((booking: any, index: number) => (
                        <tr 
                          key={booking._id} 
                          className={`hover:bg-purple-50/50 transition-colors animate-fade-in-up`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{booking.service?.name}</div>
                                <div className="text-sm text-slate-600">{booking.client?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">{booking.salon?.name}</div>
                              <div className="text-slate-600">{booking.barber?.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">{new Date(booking.appointmentDate).toLocaleDateString()}</div>
                              <div className="text-slate-600">{booking.appointmentTime}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{booking.totalAmount} RWF</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-purple-600" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 mb-2">No Bookings Found</h4>
                          <p className="text-slate-600 max-w-md mx-auto">
                            No bookings match your current search criteria. Try adjusting your filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'salons':
        return (
          <div className="space-y-6">
            {/* Enhanced Search and Filter Header */}
            <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">🏪 Salons Management</h3>
                  <p className="text-slate-600 text-sm lg:text-base">Manage all salon registrations and details</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search salons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full sm:w-64 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-4">
              {salonsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : allSalons?.salons?.length > 0 ? (
                allSalons.salons.map((salon: any, index: number) => (
                  <div
                    key={salon._id}
                    className={`bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{salon.name}</h4>
                          <p className="text-xs text-slate-600">{salon.owner?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          salon.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {salon.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-slate-600">
                        <MapPin className="h-3 w-3 mr-2" />
                        <span>{salon.address}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{salon.phone}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{salon.email}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Users className="h-3 w-3 mr-2" />
                        <span>{salon.barbers?.length || 0} barbers • {salon.services?.length || 0} services</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(salon.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">No Salons Found</h4>
                  <p className="text-slate-600 max-w-md mx-auto">
                    No salons match your current search criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Salon Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Team & Services</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {salonsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : allSalons?.salons?.length > 0 ? (
                      allSalons.salons.map((salon: any, index: number) => (
                        <tr 
                          key={salon._id} 
                          className={`hover:bg-emerald-50/50 transition-colors animate-fade-in-up`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{salon.name}</div>
                                <div className="text-sm text-slate-600 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {salon.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">{salon.owner?.name}</div>
                              <div className="text-slate-600 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {salon.owner?.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 flex items-start">
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{salon.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-slate-900">{salon.barbers?.length || 0} barbers</div>
                              <div className="text-slate-600">{salon.services?.length || 0} services</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              salon.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {salon.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this salon? This action cannot be undone.')) {
                                    deleteSalonMutation.mutate(salon._id);
                                  }
                                }}
                                disabled={deleteSalonMutation.isPending}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 mb-2">No Salons Found</h4>
                          <p className="text-slate-600 max-w-md mx-auto">
                            No salons match your current search criteria. Try adjusting your filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Activity Monitor</h3>
              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                ) : Array.isArray(systemActivities) && systemActivities.length > 0 ? (
                  systemActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">{activity.message || activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent system activity</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">System configuration and settings management coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout
        title="Super Admin Dashboard"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerActions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Admin
            </button>
          </div>
        }
      >
        {renderContent()}
      </DashboardLayout>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Admin User</h3>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 w-full sm:w-auto"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSubmit={createUserMutation.mutate}
          isLoading={createUserMutation.isPending}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          isOpen={showEditUserModal}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={(userData) => 
            updateUserMutation.mutate({ id: selectedUser._id, userData })
          }
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <ViewUserModal
          isOpen={showViewUserModal}
          onClose={() => {
            setShowViewUserModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </>
  );
};

export default SuperAdminDashboard;