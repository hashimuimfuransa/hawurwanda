import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { salonService, bookingService, userService, notificationService } from '../services/api';
import BookingCard from '../components/BookingCard';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Building2, 
  Users, 
  DollarSign, 
  BarChart3, 
  Plus,
  Settings,
  Calendar,
  TrendingUp,
  UserPlus,
  Package,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Activity,
  Award,
  Target,
  Zap,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Calendar as CalendarIcon,
  User as UserIcon,
  Bell,
  Trophy,
  Medal,
  TrendingUp as TrendingUpIcon,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardOwner: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useTranslationStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings state - moved from renderSettings to avoid hooks rule violation
  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Add staff form state
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [showEditStaffForm, setShowEditStaffForm] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [showServiceAssignmentModal, setShowServiceAssignmentModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedStaffServices, setSelectedStaffServices] = useState<string[]>([]);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    staffCategory: 'barber',
    specialties: [] as string[],
    experience: '',
    bio: '',
    credentials: [] as string[],
    profilePhoto: null as File | null,
    workSchedule: {
      monday: { start: '08:00', end: '18:00', available: true },
      tuesday: { start: '08:00', end: '18:00', available: true },
      wednesday: { start: '08:00', end: '18:00', available: true },
      thursday: { start: '08:00', end: '18:00', available: true },
      friday: { start: '08:00', end: '18:00', available: true },
      saturday: { start: '09:00', end: '17:00', available: true },
      sunday: { start: '10:00', end: '16:00', available: false },
    }
  });

  // Service management state
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showEditServiceForm, setShowEditServiceForm] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({
    title: '',
    description: '',
    price: '',
    durationMinutes: '',
    category: 'hair',
    targetAudience: ['adults'] as string[],
    isActive: true,
    image: null as File | null,
  });

  // Sync activeTab with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/settings')) {
      setActiveTab('settings');
    } else if (path.includes('/bookings')) {
      setActiveTab('bookings');
    } else if (path.includes('/barbers')) {
      setActiveTab('barbers');
    } else if (path.includes('/services')) {
      setActiveTab('services');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Handle tab changes with URL navigation
  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      navigate('/dashboard/owner');
    } else {
      navigate(`/dashboard/owner/${tab}`);
    }
  };

  const handleCreateSalon = () => {
    if (user?.salonId) {
      navigate('/dashboard/owner');
      return;
    }
    navigate('/dashboard/owner/create-salon');
  };

  const handleWatchTour = () => {
    navigate('/dashboard/owner/tour');
  };

  // Get salon data
  const { data: salonResponse, isLoading: salonLoading, refetch: refetchSalon } = useQuery({
    queryKey: ['owner-salon'],
    queryFn: () => salonService.getSalon(user?.salonId!),
    enabled: !!user?.salonId,
    refetchOnMount: 'always',
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Extract salon from response (API returns { salon: {...} })
  const salon = salonResponse?.data?.salon;

  // Manual refresh function
  const handleRefreshStatus = async () => {
    try {
      await refetchSalon();
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  // Helper function to get salon status (consistent with admin panel)
  const getSalonStatus = (salon: any) => {
    console.log('Full API Response:', salonResponse);
    console.log('Extracted salon data:', salon);
    console.log('Salon verified field:', salon?.verified);
    console.log('Salon verified type:', typeof salon?.verified);
    if (salon?.verified === true) return 'verified';
    if (salon?.verified === false) return 'pending';
    return 'unknown';
  };

  // Get salon bookings
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useQuery({
    queryKey: ['salon-bookings', user?.salonId],
    queryFn: async () => {
      console.log('🔍 Frontend: Fetching bookings for salonId:', user?.salonId);
      const result = await bookingService.getBookings({ salonId: user?.salonId });
      console.log('📦 Frontend: Raw booking API response:', result);
      console.log('📊 Frontend: Bookings data structure:', result?.data);
      console.log('📋 Frontend: Bookings array:', result?.data?.bookings);
      console.log('🔢 Frontend: Number of bookings:', result?.data?.bookings?.length);
      return result;
    },
    enabled: !!user?.salonId,
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Get salon barbers (legacy)
  const { data: barbers } = useQuery({
    queryKey: ['salon-barbers'],
    queryFn: () => salonService.getBarbers(user?.salonId!),
    enabled: !!user?.salonId,
  });

  // Get salon staff (enhanced)
  const { data: staffMembers, refetch: refetchStaff } = useQuery({
    queryKey: ['salon-staff'],
    queryFn: () => salonService.getStaffMembers(user?.salonId!),
    enabled: !!user?.salonId,
  });

  // Get salon services
  const { data: services } = useQuery({
    queryKey: ['salon-services'],
    queryFn: () => salonService.getServices(user?.salonId!),
    enabled: !!user?.salonId,
  });

  // Get notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationService.getNotificationCount(),
  });

  // Get notifications data - moved to top level to avoid hooks rule violation
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['owner-notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  // Add barber mutation
  const addBarberMutation = useMutation({
    mutationFn: (barberData: any) => salonService.addBarber(user?.salonId!, barberData),
    onSuccess: () => {
      toast.success('Barber added successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-barbers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add barber');
    },
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: (serviceData: any) => salonService.addService(user?.salonId!, serviceData),
    onSuccess: () => {
      toast.success('Service added successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
      setShowAddServiceForm(false);
      setServiceFormData({
        title: '',
        description: '',
        price: '',
        durationMinutes: '',
        category: 'hair',
        targetAudience: ['adults'],
        isActive: true,
        image: null,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add service');
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, serviceData }: { serviceId: string; serviceData: any }) => 
      salonService.updateService(user?.salonId!, serviceId, serviceData),
    onSuccess: () => {
      toast.success('Service updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
      setShowEditServiceForm(false);
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => salonService.deleteService(user?.salonId!, serviceId),
    onSuccess: () => {
      toast.success('Service deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: (staffData: FormData) => salonService.createStaffMember(user?.salonId!, staffData),
    onSuccess: () => {
      toast.success('Staff member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-staff'] });
      queryClient.invalidateQueries({ queryKey: ['salon-barbers'] });
      setShowAddStaffForm(false);
      setStaffFormData({
        name: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        staffCategory: 'barber',
        specialties: [],
        experience: '',
        bio: '',
        credentials: [],
        profilePhoto: null,
        workSchedule: {
          monday: { start: '08:00', end: '18:00', available: true },
          tuesday: { start: '08:00', end: '18:00', available: true },
          wednesday: { start: '08:00', end: '18:00', available: true },
          thursday: { start: '08:00', end: '18:00', available: true },
          friday: { start: '08:00', end: '18:00', available: true },
          saturday: { start: '09:00', end: '17:00', available: true },
          sunday: { start: '10:00', end: '16:00', available: false },
        }
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: (staffId: string) => salonService.deleteStaffMember(user?.salonId!, staffId),
    onSuccess: () => {
      toast.success('Staff member deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-staff'] });
      queryClient.invalidateQueries({ queryKey: ['salon-barbers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ staffId, staffData }: { staffId: string; staffData: FormData }) => 
      salonService.updateStaffMember(user?.salonId!, staffId, staffData),
    onSuccess: () => {
      toast.success('Staff member updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-staff'] });
      queryClient.invalidateQueries({ queryKey: ['salon-barbers'] });
      setShowEditStaffForm(false);
      setSelectedStaff(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    },
  });

  // Update staff services mutation
  const updateStaffServicesMutation = useMutation({
    mutationFn: ({ staffId, services }: { staffId: string; services: string[] }) => 
      salonService.updateStaffServices(user?.salonId!, staffId, services),
    onSuccess: () => {
      toast.success('Staff services updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['salon-staff'] });
      queryClient.invalidateQueries({ queryKey: ['salon-barbers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff services');
    },
  });

  // Update salon settings mutation
  const updateSalonMutation = useMutation({
    mutationFn: (salonData: any) => salonService.updateSalon(user?.salonId!, salonData),
    onSuccess: () => {
      toast.success('Salon settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-salon'] });
      setEditMode(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update salon settings');
    },
  });

  // Notification mutations
  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-notifications'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-notifications'] });
    },
  });

  // Calculate staff earnings from completed bookings - moved to top level to avoid hooks rule violation
  const staffEarnings = React.useMemo(() => {
    if (!staffMembers?.data?.staff || !bookings?.data?.data?.bookings) return [];
    
    const completedBookings = bookings.data.data.bookings.filter((booking: any) => 
      booking.status === 'completed' && booking.barber
    );
    
    const earningsMap = new Map();
    
    // Calculate earnings for each staff member
    completedBookings.forEach((booking: any) => {
      const barberId = booking.barber._id;
      const servicePrice = booking.service?.price || 0;
      const commissionRate = 0.7; // 70% commission for staff
      const earnings = servicePrice * commissionRate;
      
      if (earningsMap.has(barberId)) {
        const current = earningsMap.get(barberId);
        earningsMap.set(barberId, {
          ...current,
          totalEarnings: current.totalEarnings + earnings,
          bookingCount: current.bookingCount + 1
        });
      } else {
        earningsMap.set(barberId, {
          staff: booking.barber,
          totalEarnings: earnings,
          bookingCount: 1
        });
      }
    });
    
    // Convert to array and sort by earnings
    return Array.from(earningsMap.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [staffMembers, bookings]);

  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['salon-bookings'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  // Filter and sort bookings helper functions
  const getFilteredAndSortedBookings = () => {
    console.log('🔄 Frontend: getFilteredAndSortedBookings called');
    console.log('📦 Frontend: Full bookings object:', bookings);
    console.log('📊 Frontend: bookings?.data:', bookings?.data);
    console.log('📋 Frontend: bookings?.data?.data?.bookings:', bookings?.data?.data?.bookings);
    
    if (!bookings?.data?.data?.bookings) {
      console.log('❌ Frontend: No bookings data found, returning empty array');
      return [];
    }

    let filteredBookings = bookings.data.data.bookings;
    console.log('✅ Frontend: Initial filtered bookings:', filteredBookings.length);

    // Apply status filter
    if (bookingFilter !== 'all') {
      filteredBookings = filteredBookings.filter((booking: any) => booking.status === bookingFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredBookings = filteredBookings.filter((booking: any) => 
        booking.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.barber?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filteredBookings = [...filteredBookings].sort((a: any, b: any) => {
      switch (bookingSort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'appointment-newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'appointment-oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-high':
          return (b.service?.price || 0) - (a.service?.price || 0);
        case 'price-low':
          return (a.service?.price || 0) - (b.service?.price || 0);
        case 'client-name':
          return (a.client?.name || '').localeCompare(b.client?.name || '');
        default:
          return 0;
      }
    });

    return filteredBookings;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handlePaymentRecord = async (bookingId: string) => {
    toast.success('Payment recording feature coming soon!');
  };

  // Staff category options
  const staffCategories = [
    { value: 'barber', label: 'Barber', icon: '✂️' },
    { value: 'hairstylist', label: 'Hair Stylist', icon: '💇' },
    { value: 'nail_technician', label: 'Nail Technician', icon: '💅' },
    { value: 'massage_therapist', label: 'Massage Therapist', icon: '💆' },
    { value: 'esthetician', label: 'Esthetician', icon: '🧴' },
    { value: 'receptionist', label: 'Receptionist', icon: '📞' },
    { value: 'manager', label: 'Manager', icon: '👔' },
    { value: 'other', label: 'Other', icon: '👤' },
  ];

  // Handle staff form submission
  const handleAddStaff = async () => {
    try {
      // Validate form data before submission
      if (!staffFormData.name || !staffFormData.email || !staffFormData.phone || !staffFormData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^(\+250|250|0)?[0-9]{9}$/;
      if (!phoneRegex.test(staffFormData.phone)) {
        toast.error('Please enter a valid Rwandan phone number (e.g., +250788123456)');
        return;
      }

      // Validate national ID format if provided
      if (staffFormData.nationalId) {
        const nationalIdRegex = /^[0-9]{16}$/;
        if (!nationalIdRegex.test(staffFormData.nationalId)) {
          toast.error('Please enter a valid 16-digit national ID');
          return;
        }
      }

      const formData = new FormData();
      
      // Basic information
      formData.append('name', staffFormData.name);
      formData.append('email', staffFormData.email);
      formData.append('phone', staffFormData.phone);
      formData.append('nationalId', staffFormData.nationalId);
      formData.append('password', staffFormData.password);
      formData.append('staffCategory', staffFormData.staffCategory);
      
      // Optional information
      if (staffFormData.experience) formData.append('experience', staffFormData.experience);
      if (staffFormData.bio) formData.append('bio', staffFormData.bio);
      
      // Arrays
      formData.append('specialties', JSON.stringify(staffFormData.specialties));
      formData.append('credentials', JSON.stringify(staffFormData.credentials));
      formData.append('workSchedule', JSON.stringify(staffFormData.workSchedule));
      
      // Profile photo
      if (staffFormData.profilePhoto) {
        formData.append('profilePhoto', staffFormData.profilePhoto);
      }
      
      await addStaffMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  // Handle staff actions
  const handleViewStaff = (staff: any) => {
    setSelectedStaff(staff);
    setShowStaffDetails(true);
  };

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setStaffFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      nationalId: staff.nationalId || '',
      password: '', // Don't pre-fill password for security
      staffCategory: staff.staffCategory || 'barber',
      specialties: staff.specialties || [],
      experience: staff.experience || '',
      bio: staff.bio || '',
      credentials: staff.credentials || [],
      profilePhoto: null,
      workSchedule: staff.workSchedule || {
        monday: { start: '08:00', end: '18:00', available: true },
        tuesday: { start: '08:00', end: '18:00', available: true },
        wednesday: { start: '08:00', end: '18:00', available: true },
        thursday: { start: '08:00', end: '18:00', available: true },
        friday: { start: '08:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false },
      }
    });
    setShowEditStaffForm(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      deleteStaffMutation.mutate(staffId);
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

  const handleUpdateStaff = async () => {
    try {
      // Validate form data before submission
      if (!staffFormData.name || !staffFormData.email || !staffFormData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^(\+250|250|0)?[0-9]{9}$/;
      if (!phoneRegex.test(staffFormData.phone)) {
        toast.error('Please enter a valid Rwandan phone number (e.g., +250788123456)');
        return;
      }

      // Validate national ID format if provided
      if (staffFormData.nationalId) {
        const nationalIdRegex = /^[0-9]{16}$/;
        if (!nationalIdRegex.test(staffFormData.nationalId)) {
          toast.error('Please enter a valid 16-digit national ID');
          return;
        }
      }

      const formData = new FormData();
      
      // Basic information
      formData.append('name', staffFormData.name);
      formData.append('email', staffFormData.email);
      formData.append('phone', staffFormData.phone);
      formData.append('nationalId', staffFormData.nationalId);
      formData.append('staffCategory', staffFormData.staffCategory);
      
      // Optional information
      if (staffFormData.experience) formData.append('experience', staffFormData.experience);
      if (staffFormData.bio) formData.append('bio', staffFormData.bio);
      
      // Arrays
      formData.append('specialties', JSON.stringify(staffFormData.specialties));
      formData.append('credentials', JSON.stringify(staffFormData.credentials));
      formData.append('workSchedule', JSON.stringify(staffFormData.workSchedule));
      
      // Profile photo
      if (staffFormData.profilePhoto) {
        formData.append('profilePhoto', staffFormData.profilePhoto);
      }
      
      await updateStaffMutation.mutateAsync({ 
        staffId: selectedStaff._id, 
        staffData: formData 
      });
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  // Service handler functions
  const handleViewService = (service: any) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setServiceFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price?.toString() || '',
      durationMinutes: service.durationMinutes?.toString() || '',
      category: service.category || 'hair',
      targetAudience: service.targetAudience || ['adults'],
      isActive: service.isActive !== undefined ? service.isActive : true,
      image: null,
    });
    setShowEditServiceForm(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleAddService = async () => {
    try {
      // Validate form data
      if (!serviceFormData.title || !serviceFormData.price || !serviceFormData.durationMinutes) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate duration (minimum 15 minutes)
      const duration = parseInt(serviceFormData.durationMinutes);
      if (duration < 15) {
        toast.error('Duration must be at least 15 minutes');
        return;
      }

      // Validate target audience
      if (serviceFormData.targetAudience.length === 0) {
        toast.error('Please select at least one target audience');
        return;
      }

      const serviceData = {
        title: serviceFormData.title,
        description: serviceFormData.description,
        price: parseFloat(serviceFormData.price),
        durationMinutes: duration,
        category: serviceFormData.category,
        targetAudience: serviceFormData.targetAudience,
        isActive: serviceFormData.isActive,
      };

      console.log('Sending service data:', serviceData);
      await addServiceMutation.mutateAsync(serviceData);
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdateService = async () => {
    try {
      // Validate form data
      if (!serviceFormData.title || !serviceFormData.price || !serviceFormData.durationMinutes) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate duration (minimum 15 minutes)
      const duration = parseInt(serviceFormData.durationMinutes);
      if (duration < 15) {
        toast.error('Duration must be at least 15 minutes');
        return;
      }

      // Validate target audience
      if (serviceFormData.targetAudience.length === 0) {
        toast.error('Please select at least one target audience');
        return;
      }

      const serviceData = {
        title: serviceFormData.title,
        description: serviceFormData.description,
        price: parseFloat(serviceFormData.price),
        durationMinutes: duration,
        category: serviceFormData.category,
        targetAudience: serviceFormData.targetAudience,
        isActive: serviceFormData.isActive,
      };

      console.log('Updating service data:', serviceData);
      await updateServiceMutation.mutateAsync({ 
        serviceId: selectedService._id, 
        serviceData 
      });
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  // Service categories
  const serviceCategories = [
    { value: 'hair', label: 'Hair Services', icon: '💇‍♀️' },
    { value: 'nails', label: 'Nail Services', icon: '💅' },
    { value: 'skincare', label: 'Skincare', icon: '✨' },
    { value: 'massage', label: 'Massage', icon: '💆‍♀️' },
    { value: 'makeup', label: 'Makeup', icon: '💄' },
    { value: 'other', label: 'Other', icon: '🔧' },
  ];

  // Target audience options
  const targetAudienceOptions = [
    { value: 'children', label: 'Children', icon: '👶' },
    { value: 'adults', label: 'Adults', icon: '👤' },
    { value: 'men', label: 'Men', icon: '👨' },
    { value: 'women', label: 'Women', icon: '👩' },
    { value: 'both', label: 'Both Genders', icon: '👥' },
  ];

  // Helper function to get category display info
  const getCategoryInfo = (category: string) => {
    const info = staffCategories.find(cat => cat.value === category);
    return info || { value: 'other', label: 'Other', icon: '👤' };
  };

  // Helper function to get service category display info
  const getServiceCategoryInfo = (category: string) => {
    const info = serviceCategories.find(cat => cat.value === category);
    return info || { value: 'other', label: 'Other', icon: '🔧' };
  };

  // Render settings function
  function renderSettings() {
    const isEditingBasic = editMode === 'basic';
    const displayName = formData.name || salon?.name || '';
    const displayPhone = formData.phone || salon?.phone || '';
    const displayEmail = formData.email || salon?.email || '';
    const displayAddress = formData.address || salon?.address || '';
    const displayDistrict = formData.district || salon?.district || '';

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Salon Information</h2>
              <p className="text-sm text-slate-600">Update your salon details</p>
            </div>
            {!isEditingBasic && (
              <button
                onClick={() => {
                  setFormData({
                    name: salon?.name || '',
                    phone: salon?.phone || '',
                    email: salon?.email || '',
                    address: salon?.address || '',
                    district: salon?.district || '',
                  });
                  setEditMode('basic');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
          </div>
          
          <div className="p-6 lg:p-8">
            {isEditingBasic ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Salon Name*</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Salon name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Phone*</label>
                  <input
                    type="tel"
                    value={displayPhone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+250788123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email*</label>
                  <input
                    type="email"
                    value={displayEmail}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="salon@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Address*</label>
                  <input
                    type="text"
                    value={displayAddress}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">District*</label>
                  <input
                    type="text"
                    value={displayDistrict}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="District"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setEditMode(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.name || !formData.phone || !formData.email || !formData.address || !formData.district) {
                        toast.error('Please fill in all required fields');
                        return;
                      }
                      updateSalonMutation.mutate(formData);
                    }}
                    disabled={updateSalonMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition-all font-semibold"
                  >
                    {updateSalonMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Salon Name</p>
                  <p className="text-lg font-semibold text-slate-900">{salon?.name}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Phone</p>
                  <p className="text-lg font-semibold text-slate-900">{salon?.phone || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Email</p>
                  <p className="text-lg font-semibold text-slate-900">{salon?.email || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Address</p>
                  <p className="text-lg font-semibold text-slate-900">{salon?.address || 'Not provided'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 font-semibold uppercase mb-1">District</p>
                  <p className="text-lg font-semibold text-slate-900">{salon?.district || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl lg:rounded-3xl border border-blue-200/60 shadow-lg p-6 lg:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            Need More Help?
          </h3>
          <p className="text-sm text-slate-700 mb-4">For additional changes or support, contact our team.</p>
          <a href="mailto:support@hawurwanda.com" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-slate-200/60">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
          <p className="text-slate-600">This page is for salon owners only.</p>
        </div>
      </div>
    );
  }

  if (salonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading salon data...</p>
        </div>
      </div>
    );
  }

  // Calculate booking stats for sidebar badges
  const pendingBookings = bookings?.data?.data?.bookings?.filter((booking: any) => 
    booking.status === 'pending'
  ) || [];

  // Define sidebar items early so they can be used in pending state
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, badge: undefined },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: pendingBookings.length || undefined },
    { id: 'barbers', label: 'Team', icon: Users, badge: undefined },
    { id: 'services', label: 'Services', icon: Package, badge: undefined },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award, badge: undefined },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount?.data?.unreadCount || undefined },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: undefined },
    { id: 'settings', label: 'Settings', icon: Settings, badge: undefined },
  ];

  // Show pending approval state if salon exists but not verified
  if (salon && getSalonStatus(salon) === 'pending') {
    // Handle settings navigation even in pending state
    if (activeTab === 'settings') {
      return (
        <DashboardLayout
          title="Salon Owner"
          subtitle="Owner Dashboard"
          sidebarItems={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNotificationClick={() => setActiveTab('notifications')}
          headerActions={
            <div className="flex items-center space-x-2">
              <span className="hidden lg:inline-block text-sm text-slate-600">
                Managing: <span className="font-semibold text-slate-900">{salon?.name}</span>
              </span>
            </div>
          }
        >
          {renderSettings()}
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout
        title="Salon Owner"
        subtitle="Owner Dashboard"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNotificationClick={() => setActiveTab('notifications')}
        headerActions={
          <div className="flex items-center space-x-2">
            <span className="hidden lg:inline-block text-sm text-slate-600">
              Managing: <span className="font-semibold text-slate-900">{salon?.name}</span>
            </span>
          </div>
        }
      >
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-200/60 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_40%)]" />
              
              <div className="relative px-6 sm:px-10 lg:px-12 py-12 sm:py-16 text-center">
                {/* Animated Clock Icon */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30">
                    <Clock className="h-12 w-12 text-white animate-pulse" />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-6 shadow-lg border border-amber-200">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2.5 animate-pulse"></span>
                  {getSalonStatus(salon) === 'pending' ? 'Pending Verification' : 'Under Review'}
                </div>

                {/* Main Message */}
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                  Your Salon is Under Review
                </h2>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                  Thank you for creating your salon profile! Our team is currently reviewing your submission to ensure quality and authenticity. This process typically takes 24-48 hours.
                </p>

                {/* Salon Info Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 p-6 mb-8 text-left shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{salon.name}</h3>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                          <span>{salon.address}, {salon.district}</span>
                        </div>
                        {salon.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{salon.phone}</span>
                          </div>
                        )}
                        {salon.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{salon.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200/60 p-6 mb-8 text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                    What Happens Next?
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
                      <span><strong>Verification:</strong> Our team reviews your salon details, location, and contact information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
                      <span><strong>Approval:</strong> Once verified, you'll receive an email notification and full access to your dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
                      <span><strong>Go Live:</strong> Your salon will be visible to customers and ready to accept bookings</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <button
                    onClick={handleRefreshStatus}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Activity className="h-5 w-5 mr-2" />
                    <span>Refresh Status</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('settings')}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    <span>Customize Salon Settings</span>
                  </button>
                  <button
                    onClick={handleWatchTour}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-300 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    <span>Watch Tour</span>
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-sm text-slate-500 mt-8">
                  Need help? Contact our support team at{' '}
                  <a href="mailto:support@hawurwanda.com" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                    support@hawurwanda.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/70 border border-blue-100/60 rounded-3xl shadow-xl shadow-blue-500/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.15),transparent_40%)]" />
            <div className="relative px-4 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-14 lg:py-16">
              <div className="flex flex-col xl:flex-row items-center xl:items-start gap-10 xl:gap-14">
                <div className="w-full xl:w-1/2 text-center xl:text-left max-w-2xl">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/60 text-blue-700 font-semibold text-sm mb-6 shadow-inner">
                    <Building2 className="h-4 w-4 mr-2" />
                    Ready to launch your salon HQ?
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Create your salon hub and start managing everything in one place
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                    Design your digital salon, invite your barbers, publish services, and keep bookings under control. Your clients are waiting—let's make your brand shine.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
                    <li className="flex items-start space-x-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <div>
                        <p className="font-semibold text-slate-800">Build your salon profile</p>
                        <p className="text-sm text-slate-500">Add location, contact details, gallery, and brand story</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <div>
                        <p className="font-semibold text-slate-800">Publish your services</p>
                        <p className="text-sm text-slate-500">Create categories, set pricing, and availability in minutes</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <div>
                        <p className="font-semibold text-slate-800">Invite your team</p>
                        <p className="text-sm text-slate-500">Give barbers their own dashboards and calendars</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                      <div>
                        <p className="font-semibold text-slate-800">Track growth in real time</p>
                        <p className="text-sm text-slate-500">Monitor bookings, revenue trends, and team performance</p>
                      </div>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <button
                      onClick={handleCreateSalon}
                      className="inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      <span>Create Your Salon Now</span>
                    </button>
                    <button
                      onClick={handleWatchTour}
                      className="inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold border border-blue-200 shadow-sm hover:border-blue-300 hover:text-blue-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      <span>Watch quick tour</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative rounded-3xl bg-white/90 shadow-2xl shadow-blue-500/20 border border-slate-200/70 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-200/20" />
                    <div className="relative p-6 sm:p-8">
                      <h3 className="text-xl font-semibold text-slate-900 mb-4">Owner Workspace Preview</h3>
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-800">Salon Analytics</span>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-medium">Live</div>
                          </div>
                          <p className="text-sm text-slate-500">Track bookings, revenue and customer trends at a glance</p>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2">
                              <p className="font-semibold">+18%</p>
                              <p className="text-xs">Monthly bookings</p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2">
                              <p className="font-semibold">45</p>
                              <p className="text-xs">Active clients</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-md">
                          <span className="font-semibold text-slate-800">Team Planner</span>
                          <p className="text-sm text-slate-500 mt-1">Assign shifts, approve leave, and sync calendars</p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">AN</div>
                            <div className="text-sm">
                              <p className="font-semibold text-slate-800">Anita Uwase</p>
                              <p className="text-xs text-slate-500">Senior Stylist • 5 bookings today</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-md">
                          <span className="font-semibold text-slate-800">Smart Automations</span>
                          <p className="text-sm text-slate-500 mt-1">Auto-confirm bookings, send SMS reminders, and reward loyal clients.</p>
                          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">Coming soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todayBookings = bookings?.data?.data?.bookings?.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  }) || [];

  const completedBookings = bookings?.data?.data?.bookings?.filter((booking: any) => 
    booking.status === 'completed'
  ) || [];

  const totalRevenue = completedBookings.reduce((sum: number, booking: any) => 
    sum + booking.amountTotal, 0
  );

  const confirmedBookings = bookings?.data?.data?.bookings?.filter((booking: any) => 
    booking.status === 'confirmed'
  ) || [];

  // Overview Tab Content
  function renderOverview() {
    return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Today's Bookings */}
        <div className="group bg-gradient-to-br from-white to-blue-50/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
              <Calendar className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold">
              <ArrowUp className="h-4 w-4" />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-sm lg:text-base font-medium text-slate-600 mb-1">Today's Bookings</h3>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{todayBookings.length}</p>
          <p className="text-xs lg:text-sm text-slate-500 mt-2">{confirmedBookings.length} confirmed</p>
        </div>

        {/* Total Revenue */}
        <div className="group bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 lg:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">
              <DollarSign className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold">
              <ArrowUp className="h-4 w-4" />
              <span>+24%</span>
            </div>
          </div>
          <h3 className="text-sm lg:text-base font-medium text-slate-600 mb-1">Total Revenue</h3>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs lg:text-sm text-slate-500 mt-2">RWF this month</p>
        </div>

        {/* Team Members */}
        <div className="group bg-gradient-to-br from-white to-purple-50/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 lg:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
              <Users className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-sm font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Active</span>
            </div>
          </div>
          <h3 className="text-sm lg:text-base font-medium text-slate-600 mb-1">Team Members</h3>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{(staffMembers?.data?.staff || (staffMembers as any)?.staff || [])?.length || 0}</p>
          <p className="text-xs lg:text-sm text-slate-500 mt-2">Barbers & Staff</p>
        </div>

        {/* Services */}
        <div className="group bg-gradient-to-br from-white to-amber-50/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 lg:p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg group-hover:shadow-amber-500/25 transition-shadow">
              <Package className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <h3 className="text-sm lg:text-base font-medium text-slate-600 mb-1">Services</h3>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{(services?.data?.services || (services as any)?.services || [])?.length || 0}</p>
          <p className="text-xs lg:text-sm text-slate-500 mt-2">Active offerings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <p className="text-sm lg:text-base text-slate-600">Navigate to key areas of your salon management</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* View Bookings */}
            <button
              onClick={() => handleTabChange('bookings')}
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  {pendingBookings.length > 0 && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {pendingBookings.length}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">View Bookings</h3>
                <p className="text-sm text-blue-100">Manage appointments and schedules</p>
              </div>
            </button>

            {/* Manage Team */}
            <button
              onClick={() => handleTabChange('barbers')}
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {(staffMembers?.data?.staff || (staffMembers as any)?.staff || [])?.length || 0}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Team</h3>
                <p className="text-sm text-purple-100">Add and manage your barbers</p>
              </div>
            </button>

            {/* Manage Services */}
            <button
              onClick={() => handleTabChange('services')}
              className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {(services?.data?.services || (services as any)?.services || [])?.length || 0}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Services</h3>
                <p className="text-sm text-emerald-100">Update your service offerings</p>
              </div>
            </button>

            {/* View Analytics */}
            <button
              onClick={() => handleTabChange('analytics')}
              className="group relative bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-white text-xs font-bold">
                    <ArrowUp className="h-4 w-4" />
                    <span>+24%</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">View Analytics</h3>
                <p className="text-sm text-amber-100">Track performance and insights</p>
              </div>
            </button>

            {/* Salon Settings */}
            <button
              onClick={() => handleTabChange('settings')}
              className="group relative bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Salon Settings</h3>
                <p className="text-sm text-slate-300">Configure your salon details</p>
              </div>
            </button>

            {/* View Salon Page */}
            <button
              onClick={() => navigate(`/salons/${user?.salonId}`)}
              className="group relative bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">View Salon Page</h3>
                <p className="text-sm text-rose-100">See your public salon profile</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Salon Status Card */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">Salon Status</h2>
              <p className="text-sm lg:text-base text-slate-600">Overview of your salon information</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
              salon.verified 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
            }`}>
              {salon.verified ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Pending Verification
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Salon Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Salon Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Name</p>
                    <p className="text-sm font-semibold text-slate-900">{salon.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Address</p>
                    <p className="text-sm font-semibold text-slate-900">{salon.address}</p>
                    <p className="text-xs text-slate-500">{salon.district}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{salon.phone || 'Not provided'}</p>
                  </div>
                </div>
                {salon.email && (
                  <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                    <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="text-sm font-semibold text-slate-900">{salon.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900">{bookings?.data?.data?.bookings?.length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                  <p className="text-xs text-amber-600 font-medium mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-900">{pendingBookings.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-900">{completedBookings.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                  <p className="text-xs text-purple-600 font-medium mb-1">Revenue</p>
                  <p className="text-lg font-bold text-purple-900">{(totalRevenue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Verified Salon */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => handleTabChange('settings')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Settings className="h-5 w-5 mr-2" />
                <span>Customize Salon Settings</span>
              </button>
              <button
                onClick={() => handleTabChange('bookings')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Calendar className="h-5 w-5 mr-2" />
                <span>Manage Bookings</span>
              </button>
              <button
                onClick={() => handleTabChange('barbers')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Users className="h-5 w-5 mr-2" />
                <span>Manage Staff</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Recent Bookings</h2>
              <p className="text-sm text-slate-600">Latest booking requests and appointments</p>
            </div>
            <button
              onClick={() => handleTabChange('bookings')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1 hover:underline"
            >
              <span>View All</span>
              <ArrowUp className="h-4 w-4 rotate-90" />
            </button>
          </div>
          {bookings?.data?.data?.bookings?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No bookings yet</p>
              <p className="text-sm text-slate-500 mt-1">Bookings will appear here once customers start booking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings?.data?.data?.bookings?.slice(0, 5).map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onStatusChange={handleBookingStatusChange}
                  onPaymentRecord={handlePaymentRecord}
                  userRole={user.role}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }

  // Bookings Tab Content
  function renderBookings() {
    if (bookingsError) {
      const errorMessage = (bookingsError as any)?.response?.data?.message || 'Failed to load bookings';
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Bookings</h3>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          <button
            onClick={() => refetchBookings()}
            disabled={bookingsLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {bookingsLoading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      );
    }

    const filteredBookings = getFilteredAndSortedBookings();
    const statusCounts = {
      all: bookings?.data?.data?.bookings?.length || 0,
      pending: bookings?.data?.data?.bookings?.filter((b: any) => b.status === 'pending').length || 0,
      confirmed: bookings?.data?.data?.bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
      completed: bookings?.data?.data?.bookings?.filter((b: any) => b.status === 'completed').length || 0,
      cancelled: bookings?.data?.data?.bookings?.filter((b: any) => b.status === 'cancelled').length || 0,
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Header with Controls */}
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-indigo-50/50 to-blue-50/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-indigo-600" />
                  Booking Management
                </h2>
                <p className="text-sm text-slate-600">Monitor, filter, and manage all salon bookings</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => refetchBookings()}
                  disabled={bookingsLoading}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh bookings"
                >
                  <RefreshCw className={`h-5 w-5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Total Bookings:</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-full">
                    {statusCounts.all}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {/* Status Filter Pills */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Bookings', count: statusCounts.all, color: 'slate' },
                  { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'amber' },
                  { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed, color: 'blue' },
                  { key: 'completed', label: 'Completed', count: statusCounts.completed, color: 'emerald' },
                  { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'red' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setBookingFilter(filter.key)}
                    className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border ${
                      bookingFilter === filter.key
                        ? filter.color === 'slate'
                          ? 'bg-slate-600 text-white border-slate-600 shadow-lg shadow-slate-500/25'
                          : filter.color === 'amber'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25'
                          : filter.color === 'blue'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                          : filter.color === 'emerald'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25'
                        : filter.color === 'slate'
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : filter.color === 'amber'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : filter.color === 'blue'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : filter.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {getStatusIcon(filter.key === 'all' ? 'all' : filter.key)}
                    <span className="ml-2">{filter.label}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      bookingFilter === filter.key
                        ? 'bg-white/20 text-white'
                        : filter.color === 'slate'
                        ? 'bg-slate-200 text-slate-700'
                        : filter.color === 'amber'
                        ? 'bg-amber-200 text-amber-700'
                        : filter.color === 'blue'
                        ? 'bg-blue-200 text-blue-700'
                        : filter.color === 'emerald'
                        ? 'bg-emerald-200 text-emerald-700'
                        : 'bg-red-200 text-red-700'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by client name, service, or barber..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="lg:w-64">
                <select
                  value={bookingSort}
                  onChange={(e) => setBookingSort(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-900 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="appointment-newest">Latest Appointments</option>
                  <option value="appointment-oldest">Earliest Appointments</option>
                  <option value="price-high">Highest Price</option>
                  <option value="price-low">Lowest Price</option>
                  <option value="client-name">Client Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            {(bookingFilter !== 'all' || searchQuery.trim()) && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <p className="text-sm text-indigo-700">
                  <span className="font-semibold">
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                  </span>
                  {bookingFilter !== 'all' && (
                    <span> with status "{bookingFilter}"</span>
                  )}
                  {searchQuery.trim() && (
                    <span> matching "{searchQuery}"</span>
                  )}
                  {(bookingFilter !== 'all' || searchQuery.trim()) && (
                    <button
                      onClick={() => {
                        setBookingFilter('all');
                        setSearchQuery('');
                      }}
                      className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Clear filters
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="p-6 lg:p-8">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  {searchQuery.trim() || bookingFilter !== 'all' ? (
                    <Search className="h-12 w-12 text-indigo-600" />
                  ) : (
                    <Calendar className="h-12 w-12 text-indigo-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {searchQuery.trim() || bookingFilter !== 'all' 
                    ? 'No matching bookings found' 
                    : 'No bookings yet'
                  }
                </h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery.trim() || bookingFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters'
                    : 'Your booking list is empty. Bookings will appear here once customers start booking appointments.'
                  }
                </p>
                {(searchQuery.trim() || bookingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setBookingFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking: any, index: number) => (
                  <div 
                    key={booking._id}
                    className="group transform transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideInUp 0.3s ease-out forwards'
                    }}
                  >
                    <BookingCard
                      booking={booking}
                      onStatusChange={handleBookingStatusChange}
                      onPaymentRecord={handlePaymentRecord}
                      userRole={user.role}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Team Management Tab Content
  function renderBarbers() {
    const currentStaff = staffMembers?.data?.staff || (staffMembers as any)?.staff || [];
    
    // Debug logging
    console.log('Staff Members Data:', staffMembers);
    console.log('Current Staff:', currentStaff);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Team Management</h2>
                <p className="text-sm text-slate-600">Manage your salon staff across all categories</p>
              </div>
              <button 
                onClick={() => setShowAddStaffForm(true)}
                className="group flex items-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl lg:rounded-2xl hover:from-blue-700 hover:to-indigo-800 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:scale-110 transition-transform" />
                Add Staff Member
              </button>
            </div>
          </div>
          
          {/* Staff Grid */}
          <div className="p-6 lg:p-8">
            {currentStaff.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Build Your Team</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  No staff members added yet. Add team members to start accepting bookings and growing your salon.
                </p>
                <button 
                  onClick={() => setShowAddStaffForm(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add Your First Staff Member</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {currentStaff.map((staff: any, index: number) => {
                  const categoryInfo = getCategoryInfo(staff.staffCategory || 'other');
                  return (
                    <div 
                      key={staff._id} 
                      className="group bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideInUp 0.5s ease-out forwards'
                      }}
                    >
                      {/* Profile Header */}
                      <div className="flex items-center mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                            {staff.profilePhoto ? (
                              <img
                                src={staff.profilePhoto}
                                alt={staff.name}
                                className="w-16 h-16 rounded-2xl object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-xl">
                                {staff.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-xs">{categoryInfo.icon}</span>
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-lg truncate">{staff.name}</h3>
                          <p className="text-sm text-slate-500 truncate">{staff.email}</p>
                        </div>
                      </div>
                      
                      {/* Staff Info */}
                      <div className="space-y-3 mb-4">
                        {/* Category */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">Role:</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800">
                            {categoryInfo.icon} {categoryInfo.label}
                          </span>
                        </div>
                        
                        {/* Staff Category (if different from role) */}
                        {staff.staffCategory && staff.staffCategory !== staff.role && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-medium">Category:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">
                              {getCategoryInfo(staff.staffCategory).icon} {getCategoryInfo(staff.staffCategory).label}
                            </span>
                          </div>
                        )}
                        
                        {/* Phone */}
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="font-medium">{staff.phone}</span>
                        </div>
                        
                        {/* Experience */}
                        {staff.experience && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Award className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{staff.experience}</span>
                          </div>
                        )}
                        
                        {/* Specialties */}
                        {staff.specialties && staff.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium"
                              >
                                {specialty}
                              </span>
                            ))}
                            {staff.specialties.length > 3 && (
                              <span className="text-xs text-slate-500 px-2 py-1">
                                +{staff.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            staff.isVerified 
                              ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800' 
                              : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800'
                          }`}>
                            {staff.isVerified ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewStaff(staff)}
                          className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleAssignServices(staff)}
                          className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-semibold flex items-center justify-center space-x-1"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Services</span>
                        </button>
                        <button 
                          onClick={() => handleEditStaff(staff)}
                          className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-semibold flex items-center justify-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(staff._id)}
                          disabled={deleteStaffMutation.isPending}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteStaffMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Staff Form Modal */}
        {showAddStaffForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999] overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Add New Staff Member</h3>
                  <button
                    onClick={() => setShowAddStaffForm(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+250..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      National ID
                    </label>
                    <input
                      type="text"
                      value={staffFormData.nationalId}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890123456"
                      maxLength={16}
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional - 16-digit national ID number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create password"
                      required
                    />
                  </div>
                </div>

                {/* Staff Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Staff Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {staffCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setStaffFormData(prev => ({ ...prev, staffCategory: category.value }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                          staffFormData.staffCategory === category.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{category.icon}</div>
                        <div className="text-sm font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setStaffFormData(prev => ({ ...prev, profilePhoto: file }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Experience and Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={staffFormData.experience}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={staffFormData.bio}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Specialties and Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specialties (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={staffFormData.specialties.join(', ')}
                      onChange={(e) => {
                        const specialties = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setStaffFormData(prev => ({ ...prev, specialties }));
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Hair Cutting, Coloring, Extensions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Credentials/Certifications (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={staffFormData.credentials.join(', ')}
                      onChange={(e) => {
                        const credentials = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                        setStaffFormData(prev => ({ ...prev, credentials }));
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Certified Barber, Color Specialist"
                    />
                  </div>
                </div>

                {/* Work Schedule */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Work Schedule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(staffFormData.workSchedule).map(([day, schedule]) => (
                      <div key={day} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700 capitalize">
                            {day}
                          </label>
                          <input
                            type="checkbox"
                            checked={schedule.available}
                            onChange={(e) => {
                              setStaffFormData(prev => ({
                                ...prev,
                                workSchedule: {
                                  ...prev.workSchedule,
                                  [day]: { ...schedule, available: e.target.checked }
                                }
                              }));
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        {schedule.available && (
                          <div className="flex space-x-2">
                            <input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => {
                                setStaffFormData(prev => ({
                                  ...prev,
                                  workSchedule: {
                                    ...prev.workSchedule,
                                    [day]: { ...schedule, start: e.target.value }
                                  }
                                }));
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => {
                                setStaffFormData(prev => ({
                                  ...prev,
                                  workSchedule: {
                                    ...prev.workSchedule,
                                    [day]: { ...schedule, end: e.target.value }
                                  }
                                }));
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddStaffForm(false)}
                  className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  disabled={addStaffMutation.isPending || !staffFormData.name || !staffFormData.email || !staffFormData.phone || !staffFormData.password}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {addStaffMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{addStaffMutation.isPending ? 'Adding...' : 'Add Staff Member'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Staff Details Modal */}
        {showStaffDetails && selectedStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999] overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Staff Member Details</h3>
                  <button
                    onClick={() => setShowStaffDetails(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {selectedStaff.profilePhoto ? (
                      <img
                        src={selectedStaff.profilePhoto}
                        alt={selectedStaff.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {selectedStaff.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedStaff.name}</h2>
                    <p className="text-slate-600">{selectedStaff.email}</p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedStaff.isVerified 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedStaff.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <p className="text-slate-900">{selectedStaff.phone}</p>
                    </div>
                    {selectedStaff.nationalId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">National ID</label>
                        <p className="text-slate-900">{selectedStaff.nationalId}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                        {getCategoryInfo(selectedStaff.staffCategory || 'other').icon} {getCategoryInfo(selectedStaff.staffCategory || 'other').label}
                      </span>
                    </div>
                    {selectedStaff.experience && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                        <p className="text-slate-900">{selectedStaff.experience}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {selectedStaff.specialties && selectedStaff.specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Specialties</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedStaff.specialties.map((specialty: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 font-medium"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedStaff.credentials && selectedStaff.credentials.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Credentials</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedStaff.credentials.map((credential: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-medium"
                            >
                              {credential}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedStaff.bio && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">{selectedStaff.bio}</p>
                  </div>
                )}

                {/* Work Schedule */}
                {selectedStaff.workSchedule && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Work Schedule</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedStaff.workSchedule).map(([day, schedule]: [string, any]) => (
                        <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-700 capitalize">{day}</span>
                          <span className="text-sm text-slate-600">
                            {schedule.available 
                              ? `${schedule.start} - ${schedule.end}` 
                              : 'Not available'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStaffDetails(false)}
                  className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowStaffDetails(false);
                    handleEditStaff(selectedStaff);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Form Modal */}
        {showEditStaffForm && selectedStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999] overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Edit Staff Member</h3>
                  <button
                    onClick={() => {
                      setShowEditStaffForm(false);
                      setSelectedStaff(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+250..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      National ID
                    </label>
                    <input
                      type="text"
                      value={staffFormData.nationalId}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890123456"
                      maxLength={16}
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional - 16-digit national ID number</p>
                  </div>
                </div>

                {/* Staff Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Staff Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {staffCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setStaffFormData(prev => ({ ...prev, staffCategory: category.value }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                          staffFormData.staffCategory === category.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience and Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={staffFormData.experience}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={staffFormData.bio}
                      onChange={(e) => setStaffFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditStaffForm(false);
                    setSelectedStaff(null);
                  }}
                  className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStaff}
                  disabled={updateStaffMutation.isPending || !staffFormData.name || !staffFormData.email || !staffFormData.phone}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {updateStaffMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{updateStaffMutation.isPending ? 'Updating...' : 'Update Staff Member'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Services Tab Content
  function renderServices() {
    const currentServices = services?.data?.services || services?.data?.services || (services as any)?.services || [];
    
    return (
    <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Service Management</h2>
            <p className="text-sm text-slate-600">Manage your salon services and pricing</p>
          </div>
          <button 
            onClick={() => {
              setServiceFormData({
                title: '',
                description: '',
                price: '',
                durationMinutes: '',
                category: 'hair',
                targetAudience: ['adults'],
                isActive: true,
                image: null,
              });
              setSelectedService(null);
              setShowAddServiceForm(true);
            }}
            className="group flex items-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl lg:rounded-2xl hover:from-purple-700 hover:to-indigo-800 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Service
          </button>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        {currentServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Services Yet</h3>
            <p className="text-slate-600 mb-6">Start building your service catalog by adding your first service</p>
            <button 
              onClick={() => {
                setServiceFormData({
                  title: '',
                  description: '',
                  price: '',
                  durationMinutes: '',
                  category: 'hair',
                  targetAudience: ['adults'],
                  isActive: true,
                  image: null,
                });
                setSelectedService(null);
                setShowAddServiceForm(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {currentServices.map((service: any) => (
              <div
                key={service._id}
                className="group bg-white rounded-xl border border-slate-200/80 hover:border-purple-300 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">{service.title || service.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-6 mt-3 text-sm text-slate-500 flex-wrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>{service.durationMinutes || service.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1.5" />
                        <span>${parseFloat(service.price || 0).toFixed(2)}</span>
                      </div>
                      {service.category && (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1.5" />
                          <span className="capitalize">{service.category}</span>
                        </div>
                      )}
                      {service.isActive !== undefined && (
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditService(service)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

  // Main component render - verified salon dashboard
  const renderVerifiedDashboard = () => {
    return (
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'barbers' && renderBarbers()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    );
  };

  function renderLeaderboard() {
    return (
      <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Top Earners</h2>
            <p className="text-sm text-slate-600">Staff performance based on completed bookings</p>
          </div>
        </div>
        
        <div className="p-6 lg:p-8">
          {staffEarnings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Yet</h3>
              <p className="text-slate-600 mb-6">Complete bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staffEarnings.map((earning: any, index: number) => (
                <div
                  key={earning.staff._id}
                  className="group bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/80 hover:border-blue-300 p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <Medal className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <Medal className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <Medal className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index > 2 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shadow-lg font-bold text-white">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{earning.staff.name}</h4>
                      <p className="text-sm text-slate-600">{earning.staff.staffCategory}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">${earning.totalEarnings.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{earning.bookingCount} bookings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderNotifications() {
    const getNotificationStyles = (type: string) => {
      switch (type) {
        case 'success':
          return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100', iconColor: 'text-emerald-600' };
        case 'warning':
          return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100', iconColor: 'text-amber-600' };
        case 'error':
          return { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100', iconColor: 'text-red-600' };
        default:
          return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100', iconColor: 'text-blue-600' };
      }
    };

    const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5" />;
        case 'error':
          return <XCircle className="h-5 w-5" />;
        default:
          return <Bell className="h-5 w-5" />;
      }
    };

    const unreadCount = notificationsData?.data?.notifications?.filter((n: any) => !n.read).length || 0;

    return (
      <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Notifications</h2>
            <p className="text-sm text-slate-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsReadMutation.mutate()}
              disabled={markAllNotificationsReadMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="p-6 lg:p-8">
          {notificationsData?.data?.notifications?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Notifications</h3>
              <p className="text-slate-600">You're all caught up! Check back later for new notifications.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notificationsData?.data?.notifications?.map((notification: any) => {
                const styles = getNotificationStyles(notification.type);
                return (
                  <div
                    key={notification._id}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 ${
                      notification.read
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : `${styles.bg} ${styles.border} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.read ? 'bg-slate-200' : styles.icon
                      }`}>
                        <span className={notification.read ? 'text-slate-500' : styles.iconColor}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-slate-500' : 'text-slate-600'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markNotificationReadMutation.mutate(notification._id)}
                              disabled={markNotificationReadMutation.isPending}
                              className="ml-2 flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAnalytics() {
    const allBookings = bookings?.data?.data?.bookings || [];
    const completedBookings = allBookings.filter((b: any) => b.status === 'completed');
    const confirmedBookings = allBookings.filter((b: any) => b.status === 'confirmed');
    const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
    const cancelledBookings = allBookings.filter((b: any) => b.status === 'cancelled');
    
    const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.amountTotal || 0), 0);
    const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
    
    const serviceBookingCounts = new Map();
    completedBookings.forEach((booking: any) => {
      const serviceName = booking.service?.title || booking.service?.name || 'Unknown';
      serviceBookingCounts.set(serviceName, (serviceBookingCounts.get(serviceName) || 0) + 1);
    });
    
    const topServices = Array.from(serviceBookingCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/60 p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-2">From {completedBookings.length} completed bookings</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/60 p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-semibold mb-2">Completed</p>
                <p className="text-3xl font-bold text-slate-900">{completedBookings.length}</p>
                <p className="text-xs text-emerald-600 mt-2">Avg: ${avgBookingValue.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 rounded-xl border border-blue-200/60 p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold mb-2">Confirmed</p>
                <p className="text-3xl font-bold text-slate-900">{confirmedBookings.length}</p>
                <p className="text-xs text-blue-600 mt-2">Awaiting completion</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-xl border border-amber-200/60 p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-amber-600 font-semibold mb-2">Pending</p>
                <p className="text-3xl font-bold text-slate-900">{pendingBookings.length}</p>
                <p className="text-xs text-amber-600 mt-2">Awaiting confirmation</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600 opacity-30" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Distribution */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-slate-600" />
              Booking Status Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Completed', count: completedBookings.length, color: 'bg-emerald-500', total: allBookings.length },
                { label: 'Confirmed', count: confirmedBookings.length, color: 'bg-blue-500', total: allBookings.length },
                { label: 'Pending', count: pendingBookings.length, color: 'bg-amber-500', total: allBookings.length },
                { label: 'Cancelled', count: cancelledBookings.length, color: 'bg-red-500', total: allBookings.length }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-slate-600" />
              Top Services
            </h3>
            {topServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 text-sm">No completed bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{service.name}</p>
                      <p className="text-xs text-slate-600">{service.count} booking{service.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{service.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
            All Bookings Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.slice(0, 10).map((booking: any) => (
                  <tr key={booking._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">{booking.client?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-700">{booking.service?.title || booking.service?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-700">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">${(booking.amountTotal || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allBookings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600">No bookings yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderPendingStatus = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Salon Under Review</h2>
          <p className="text-slate-600 mb-6">
            Your salon registration is currently being reviewed by our team. 
            You'll receive an email notification once the verification is complete.
          </p>
          <button
            onClick={handleRefreshStatus}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
        </div>
      </div>
    );
  };

  const renderUnknownStatus = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Status Unknown</h2>
          <p className="text-slate-600 mb-6">
            We're having trouble determining your salon's verification status. 
            Please contact support if this issue persists.
          </p>
          <button
            onClick={handleRefreshStatus}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
        </div>
      </div>
    );
  };

  // Salon not found state
  if (!salon) {
    return (
      <DashboardLayout
        title="Salon Owner"
        subtitle="Owner Dashboard"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNotificationClick={() => setActiveTab('notifications')}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Salon Found</h2>
            <p className="text-slate-600 mb-6">
              It looks like you don't have a salon registered yet. 
              Please contact support to set up your salon profile.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main component return
  return (
    <DashboardLayout
      title="Salon Owner"
      subtitle="Owner Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNotificationClick={() => setActiveTab('notifications')}
      headerActions={
        <div className="flex items-center space-x-2">
          <span className="hidden lg:inline-block text-sm text-slate-600">
            Managing: <span className="font-semibold text-slate-900">{salon?.name}</span>
          </span>
        </div>
      }
    >
      {/* Content based on verification status */}
      {getSalonStatus(salon) === 'pending' && renderPendingStatus()}
      {getSalonStatus(salon) === 'unknown' && renderUnknownStatus()}
      {getSalonStatus(salon) === 'verified' && renderVerifiedDashboard()}

      {/* Add Service Modal */}
      {showAddServiceForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-indigo-50/30 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Service</h2>
              <button
                onClick={() => setShowAddServiceForm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Service Name*</label>
                <input
                  type="text"
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Men's Haircut"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Price ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (minutes)*</label>
                  <input
                    type="number"
                    value={serviceFormData.durationMinutes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, durationMinutes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {serviceCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                  <select
                    value={serviceFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  {targetAudienceOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceFormData.targetAudience.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceFormData({
                              ...serviceFormData,
                              targetAudience: [...serviceFormData.targetAudience, option.value]
                            });
                          } else {
                            setServiceFormData({
                              ...serviceFormData,
                              targetAudience: serviceFormData.targetAudience.filter(a => a !== option.value)
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{option.icon} {option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200/60 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddServiceForm(false)}
                className="px-4 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                disabled={addServiceMutation.isPending}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 transition-all"
              >
                {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceForm && selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50/30 px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Service</h2>
              <button
                onClick={() => {
                  setShowEditServiceForm(false);
                  setSelectedService(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Service Name*</label>
                <input
                  type="text"
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Men's Haircut"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Price ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (minutes)*</label>
                  <input
                    type="number"
                    value={serviceFormData.durationMinutes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, durationMinutes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {serviceCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                  <select
                    value={serviceFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  {targetAudienceOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceFormData.targetAudience.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceFormData({
                              ...serviceFormData,
                              targetAudience: [...serviceFormData.targetAudience, option.value]
                            });
                          } else {
                            setServiceFormData({
                              ...serviceFormData,
                              targetAudience: serviceFormData.targetAudience.filter(a => a !== option.value)
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{option.icon} {option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200/60 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditServiceForm(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateService}
                disabled={updateServiceMutation.isPending}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition-all"
              >
                {updateServiceMutation.isPending ? 'Updating...' : 'Update Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardOwner;