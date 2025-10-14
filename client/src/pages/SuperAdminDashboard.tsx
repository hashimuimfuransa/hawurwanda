import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { adminService, superAdminService } from '../services/api';
import { 
  Users, Building2, CheckCircle, XCircle, BarChart3, Search, Eye,
  Shield, Plus, Trash2, Edit, TrendingUp, Activity, Settings, Crown,
  UserPlus, Home, Calendar, MapPin, Phone, Mail, Clock, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';

//==============================================
// TYPE DEFINITIONS
//==============================================

type UserRole = 'client' | 'barber' | 'owner' | 'admin' | 'superadmin';

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
  salonId?: ISalon;
  statistics?: IStatistics;
}

// Data Transfer Objects (DTOs) for forms and API calls
type CreateUserData = Omit<IUser, '_id' | 'createdAt' | 'statistics' | 'salonId'> & { password?: string; salonId?: string };
type UpdateUserData = Partial<Omit<IUser, '_id' | 'createdAt' | 'statistics' | 'salonId'>> & { salonId?: string };

// API Response Types
interface AllUsersResponse {
  users: IUser[];
  totalPages: number;
  currentPage: number;
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
// MODAL COMPONENTS
//==============================================

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData) => void;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
    isVerified: true,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isVerified') {
      setFormData(prev => ({ ...prev, isVerified: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as UserRole }));
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Create New User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="0781234567" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required minLength={6} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleSelectChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="client">👤 Client</option>
                <option value="barber">✂️ Barber</option>
                <option value="owner">🏢 Owner</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select name="isVerified" value={String(formData.isVerified)} onChange={handleSelectChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="true">✅ Verified</option>
                <option value="false">⏳ Pending</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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
  user: IUser | null;
  onSubmit: (userData: UpdateUserData) => void;
  isLoading: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UpdateUserData>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'client',
        isVerified: user.isVerified ?? false,
        salonId: user.salonId?._id || ''
      });
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isVerified') {
      setFormData(prev => ({ ...prev, isVerified: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" disabled={user?.role === 'superadmin'}>
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
            <select name="isVerified" value={String(formData.isVerified)} onChange={handleChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="true">✅ Verified</option>
              <option value="false">⏳ Pending</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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
  user: IUser | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">User Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{user.name}</h4>
              <p className="text-sm text-slate-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                  user.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                  user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'barber' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {user.role === 'superadmin' && '⚡ '}
                  {user.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${user.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Joined</p>
                  <p className="text-sm font-medium text-slate-900">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600">Account Age</p>
                  <p className="text-sm font-medium text-slate-900">{user.statistics?.accountAge || 0} days</p>
                </div>
              </div>
            </div>
          </div>
          {user.statistics && (
            <div>
              <h5 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Star className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Total Bookings</p>
                    <p className="text-sm font-medium text-slate-900">{user.statistics.bookingsCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Activity className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Last Login</p>
                    <p className="text-sm font-medium text-slate-900">{user.statistics.lastLogin ? new Date(user.statistics.lastLogin).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {user.salonId && (
            <div>
              <h5 className="text-lg font-semibold text-slate-900 mb-4">Salon Information</h5>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Building2 className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.salonId.name}</p>
                  <p className="text-xs text-slate-600">{user.salonId.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-6">
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};


//==============================================
// MAIN DASHBOARD COMPONENT
//==============================================

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '' });

  // Access control
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Super admin data queries
  const { data: superAdminStats } = useQuery<SuperAdminStatsResponse, ApiError>({
    queryKey: ['superadmin-stats'],
    queryFn: async () => (await superAdminService.getSuperAdminStats()).data,
    enabled: user?.role === 'superadmin',
  });

  const { data: allUsersData, isLoading: usersLoading } = useQuery<AllUsersResponse, ApiError>({
    queryKey: ['superadmin-users', { searchTerm, selectedRole, page: currentPage }],
    queryFn: async () => (await superAdminService.getAllUsers({ search: searchTerm, role: selectedRole, page: currentPage, limit: 10 })).data,
    enabled: user?.role === 'superadmin',
  });
  
  // Mutations with proper types
  const createAdminMutation = useMutation<unknown, ApiError, CreateUserData>({
    mutationFn: (adminData) => superAdminService.createAdmin(adminData),
    onSuccess: () => {
      toast.success('Admin user created successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
      setShowCreateAdminModal(false);
      setAdminForm({ name: '', email: '', phone: '', password: '' });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create admin user'),
  });

  const deleteUserMutation = useMutation<unknown, ApiError, string>({
    mutationFn: (userId) => superAdminService.deleteUserById(userId),
    onSuccess: () => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
      setShowDeleteModal(false);
      setUserToDelete(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete user'),
  });

  const createUserMutation = useMutation<unknown, ApiError, CreateUserData>({
    mutationFn: (userData) => superAdminService.createUser(userData),
    onSuccess: () => {
      toast.success('User created successfully!');
      setShowCreateUserModal(false);
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create user'),
  });

  const updateUserMutation = useMutation<unknown, ApiError, { id: string; userData: UpdateUserData }>({
    mutationFn: ({ id, userData }) => superAdminService.updateUserById(id, userData),
    onSuccess: () => {
      toast.success('User updated successfully!');
      setShowEditUserModal(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update user'),
  });

  // Handlers
  const handleCreateAdmin = (e: FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate({ ...adminForm, role: 'admin', isVerified: true });
  };

  const handleDeleteUser = (user: IUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };
  
  const handleViewUser = async (userId: string) => {
    try {
      const response = await superAdminService.getUserDetails(userId);
      setSelectedUser(response.data.user);
      setShowViewUserModal(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to load user details');
    }
  };

  const handleEditUser = (userToEdit: IUser) => {
    setSelectedUser(userToEdit);
    setShowEditUserModal(true);
  };

  const handleSelectAll = () => {
    if (allUsersData && selectedUsers.length === allUsersData.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUsersData?.users.map((u: IUser) => u._id) || []);
    }
  };
  
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

  // Render logic
  const renderOverview = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="group bg-gradient-to-br from-white via-white to-blue-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{superAdminStats?.totalUsers ?? 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                    <Users className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
        <div className="group bg-gradient-to-br from-white via-white to-emerald-50/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">Total Salons</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{superAdminStats?.totalSalons ?? 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                    <Building2 className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
        {/* Add other stat cards similarly */}
    </div>
  );
  
  const renderUsers = () => (
      <div>
        <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button onClick={() => setShowCreateUserModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <UserPlus size={18} /> Create User
            </button>
        </div>
        {/* Add search and filter controls here */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                        <tr><td colSpan={5} className="text-center py-4">Loading users...</td></tr>
                    ) : (
                        allUsersData?.users.map(u => (
                            <tr key={u._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {u.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleViewUser(u._id)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Eye size={18} /></button>
                                    <button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteUser(u)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        {/* Add pagination controls here */}
    </div>
  );

  return (
    <DashboardLayout title="Super Admin Dashboard">
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome back, {user.name}!</p>
            
            {/* Tab Navigation can be added here */}
            
            {/* For simplicity, showing overview and users directly */}
            <div className="space-y-8">
              {renderOverview()}
              {renderUsers()}
            </div>
            
            {/* Modals */}
            <CreateUserModal
                isOpen={showCreateUserModal}
                onClose={() => setShowCreateUserModal(false)}
                onSubmit={(userData) => createUserMutation.mutate(userData)}
                isLoading={createUserMutation.isPending}
            />
            
            {selectedUser && (
                <EditUserModal
                    isOpen={showEditUserModal}
                    onClose={() => setShowEditUserModal(false)}
                    user={selectedUser}
                    onSubmit={(userData) => updateUserMutation.mutate({ id: selectedUser._id, userData })}
                    isLoading={updateUserMutation.isPending}
                />
            )}
            
            <ViewUserModal
                isOpen={showViewUserModal}
                onClose={() => setShowViewUserModal(false)}
                user={selectedUser}
            />
            
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete user: <strong>{userToDelete.name}</strong>? This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                            <button onClick={confirmDeleteUser} disabled={deleteUserMutation.isPending} className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;