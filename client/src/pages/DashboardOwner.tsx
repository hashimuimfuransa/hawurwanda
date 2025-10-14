import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { salonService, bookingService, userService } from '../services/api';
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
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardOwner: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useTranslationStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

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
  const { data: salon, isLoading: salonLoading } = useQuery({
    queryKey: ['owner-salon'],
    queryFn: () => salonService.getSalon(user?.salonId!),
    enabled: !!user?.salonId,
  });

  // Get salon bookings
  const { data: bookings } = useQuery({
    queryKey: ['salon-bookings'],
    queryFn: () => bookingService.getBookings({ salonId: user?.salonId }),
    enabled: !!user?.salonId,
  });

  // Get salon barbers
  const { data: barbers } = useQuery({
    queryKey: ['salon-barbers'],
    queryFn: () => salonService.getBarbers(user?.salonId!),
    enabled: !!user?.salonId,
  });

  // Get salon services
  const { data: services } = useQuery({
    queryKey: ['salon-services'],
    queryFn: () => salonService.getServices(user?.salonId!),
    enabled: !!user?.salonId,
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
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add service');
    },
  });

  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['salon-bookings'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handlePaymentRecord = async (bookingId: string) => {
    toast.info('Payment recording feature coming soon!');
  };

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
  const pendingBookings = bookings?.bookings?.filter((booking: any) => 
    booking.status === 'pending'
  ) || [];

  // Define sidebar items early so they can be used in pending state
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, badge: undefined },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: pendingBookings.length || undefined },
    { id: 'barbers', label: 'Team', icon: Users, badge: undefined },
    { id: 'services', label: 'Services', icon: Package, badge: undefined },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: undefined },
    { id: 'settings', label: 'Settings', icon: Settings, badge: undefined },
  ];

  // Show pending approval state if salon exists but not verified
  if (salon && !salon.verified) {
    return (
      <DashboardLayout
        title="Salon Owner"
        subtitle="Owner Dashboard"
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
                  Pending Verification
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
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    <span>Edit Salon Details</span>
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

  const todayBookings = bookings?.bookings?.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  }) || [];

  const completedBookings = bookings?.bookings?.filter((booking: any) => 
    booking.status === 'completed'
  ) || [];

  const totalRevenue = completedBookings.reduce((sum: number, booking: any) => 
    sum + booking.amountTotal, 0
  );

  const confirmedBookings = bookings?.bookings?.filter((booking: any) => 
    booking.status === 'confirmed'
  ) || [];

  // Overview Tab Content
  const renderOverview = () => (
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
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{barbers?.barbers?.length || 0}</p>
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
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{services?.services?.length || 0}</p>
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
              onClick={() => setActiveTab('bookings')}
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
              onClick={() => setActiveTab('barbers')}
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {barbers?.barbers?.length || 0}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Team</h3>
                <p className="text-sm text-purple-100">Add and manage your barbers</p>
              </div>
            </button>

            {/* Manage Services */}
            <button
              onClick={() => setActiveTab('services')}
              className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {services?.services?.length || 0}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Services</h3>
                <p className="text-sm text-emerald-100">Update your service offerings</p>
              </div>
            </button>

            {/* View Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
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
              onClick={() => setActiveTab('settings')}
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
                  <p className="text-2xl font-bold text-blue-900">{bookings?.bookings?.length || 0}</p>
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
              onClick={() => setActiveTab('bookings')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1 hover:underline"
            >
              <span>View All</span>
              <ArrowUp className="h-4 w-4 rotate-90" />
            </button>
          </div>
          {bookings?.bookings?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No bookings yet</p>
              <p className="text-sm text-slate-500 mt-1">Bookings will appear here once customers start booking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings?.bookings?.slice(0, 5).map((booking: any) => (
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

  // Bookings Tab Content
  const renderBookings = () => (
    <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">All Bookings</h2>
            <p className="text-sm text-slate-600">Manage all your salon bookings</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Total: <span className="font-bold text-slate-900">{bookings?.bookings?.length || 0}</span></span>
          </div>
        </div>
        {bookings?.bookings?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-600">Your booking list is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings?.bookings?.map((booking: any) => (
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
  );

  // Barbers Tab Content
  const renderBarbers = () => (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Team Management</h2>
            <p className="text-sm text-slate-600">Manage your barber team and staff</p>
          </div>
          <button className="group flex items-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl lg:rounded-2xl hover:from-blue-700 hover:to-indigo-800 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 font-semibold">
            <UserPlus className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Barber
          </button>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        {barbers?.barbers?.length === 0 ? (
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
              No barbers added yet. Add team members to start accepting bookings and growing your salon.
            </p>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25">
              <UserPlus className="h-5 w-5" />
              <span>Add Your First Barber</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {barbers?.barbers?.map((barber: any, index: number) => (
              <div 
                key={barber._id} 
                className="group bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                      {barber.profilePhoto ? (
                        <img
                          src={barber.profilePhoto}
                          alt={barber.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {barber.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-lg truncate">{barber.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{barber.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium">{barber.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      barber.isVerified 
                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800' 
                        : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800'
                    }`}>
                      {barber.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center justify-center space-x-1">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Services Tab Content
  const renderServices = () => (
    <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Service Management</h2>
            <p className="text-sm text-slate-600">Manage your salon services and pricing</p>
          </div>
          <button className="group flex items-center px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl lg:rounded-2xl hover:from-purple-700 hover:to-indigo-800 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 font-semibold">
            <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Service
          </button>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        {services?.services?.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                <Package className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Create Your Service Menu</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              No services added yet. Create your service offerings to start accepting bookings from customers.
            </p>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              <Plus className="h-5 w-5" />
              <span>Add Your First Service</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services?.services?.map((service: any, index: number) => (
              <div 
                key={service._id} 
                className="group bg-gradient-to-r from-white to-purple-50/30 border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start space-x-4 mb-3">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-purple-500/25 transition-shadow shrink-0">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-xl mb-2">{service.title}</h3>
                        {service.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">{service.durationMinutes} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start lg:items-end space-y-3 w-full lg:w-auto">
                    <div className="text-left lg:text-right">
                      <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                        {service.price.toLocaleString()} RWF
                      </div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        service.isActive 
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800' 
                          : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                      }`}>
                        {service.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 w-full lg:w-auto">
                      <button className="flex-1 lg:flex-initial px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-semibold flex items-center justify-center space-x-1">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Analytics Tab Content
  const renderAnalytics = () => {
    // Calculate analytics data
    const totalBookings = bookings?.bookings?.length || 0;
    const completedBookingsCount = completedBookings.length;
    const pendingBookings = bookings?.bookings?.filter((b: any) => b.status === 'pending').length || 0;
    const cancelledBookings = bookings?.bookings?.filter((b: any) => b.status === 'cancelled').length || 0;
    
    // Revenue calculations
    const totalRevenue = completedBookings.reduce((sum: number, booking: any) => 
      sum + (booking.service?.price || 0), 0
    );
    
    // Monthly data (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthBookings = bookings?.bookings?.filter((b: any) => {
        const bookingDate = new Date(b.timeSlot);
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear();
      }) || [];
      
      const monthRevenue = monthBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.service?.price || 0), 0);
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        bookings: monthBookings.length,
        revenue: monthRevenue,
        completed: monthBookings.filter((b: any) => b.status === 'completed').length
      };
    });

    // Top services
    const serviceStats = services?.services?.map((service: any) => {
      const serviceBookings = bookings?.bookings?.filter((b: any) => 
        b.service?._id === service._id
      ) || [];
      const serviceRevenue = serviceBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.service?.price || 0), 0);
      
      return {
        ...service,
        bookingCount: serviceBookings.length,
        revenue: serviceRevenue
      };
    }).sort((a: any, b: any) => b.bookingCount - a.bookingCount) || [];

    // Top barbers
    const barberStats = barbers?.barbers?.map((barber: any) => {
      const barberBookings = bookings?.bookings?.filter((b: any) => 
        b.barber?._id === barber._id
      ) || [];
      const barberRevenue = barberBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.service?.price || 0), 0);
      
      return {
        ...barber,
        bookingCount: barberBookings.length,
        revenue: barberRevenue,
        completionRate: barberBookings.length > 0 
          ? (barberBookings.filter((b: any) => b.status === 'completed').length / barberBookings.length * 100).toFixed(1)
          : 0
      };
    }).sort((a: any, b: any) => b.bookingCount - a.bookingCount) || [];

    // Peak hours analysis
    const hourlyBookings = Array.from({ length: 24 }, (_, hour) => {
      const count = bookings?.bookings?.filter((b: any) => {
        const bookingHour = new Date(b.timeSlot).getHours();
        return bookingHour === hour;
      }).length || 0;
      return { hour, count };
    }).filter(h => h.count > 0);

    const peakHours = hourlyBookings.sort((a, b) => b.count - a.count).slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalBookings}</div>
            <div className="text-blue-100 text-sm">Total Bookings</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6" />
              </div>
              <ArrowUp className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalRevenue.toLocaleString()} RWF</div>
            <div className="text-emerald-100 text-sm">Total Revenue</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <Target className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{completedBookingsCount}</div>
            <div className="text-purple-100 text-sm">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-6 w-6" />
              </div>
              <Zap className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{pendingBookings}</div>
            <div className="text-amber-100 text-sm">Pending</div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Monthly Trends</h2>
            <p className="text-sm text-slate-600">Bookings and revenue over the last 6 months</p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-slate-900">{month.month}</div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600 font-medium">{month.bookings} bookings</span>
                      <span className="text-emerald-600 font-medium">{month.revenue.toLocaleString()} RWF</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((month.bookings / Math.max(...monthlyData.map(m => m.bookings))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
            <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-indigo-50/30">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Top Services</h2>
              <p className="text-sm text-slate-600">Most popular services by bookings</p>
            </div>
            <div className="p-6 lg:p-8">
              {serviceStats.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No service data available</div>
              ) : (
                <div className="space-y-4">
                  {serviceStats.slice(0, 5).map((service: any, index: number) => (
                    <div key={service._id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{service.title}</div>
                        <div className="text-sm text-slate-500">{service.bookingCount} bookings • {service.revenue.toLocaleString()} RWF</div>
                      </div>
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Barbers */}
          <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
            <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-emerald-50 to-teal-50/30">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Top Performers</h2>
              <p className="text-sm text-slate-600">Best performing team members</p>
            </div>
            <div className="p-6 lg:p-8">
              {barberStats.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No barber data available</div>
              ) : (
                <div className="space-y-4">
                  {barberStats.slice(0, 5).map((barber: any, index: number) => (
                    <div key={barber._id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{barber.name}</div>
                        <div className="text-sm text-slate-500">
                          {barber.bookingCount} bookings • {barber.completionRate}% completion
                        </div>
                      </div>
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-amber-50 to-orange-50/30">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Peak Hours</h2>
            <p className="text-sm text-slate-600">Busiest times of the day</p>
          </div>
          <div className="p-6 lg:p-8">
            {peakHours.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No booking data available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peakHours.map((peak, index) => (
                  <div key={peak.hour} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/60">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="h-8 w-8 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {peak.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="text-sm text-slate-600">{peak.count} bookings</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-gradient-to-br from-white via-white to-slate-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Booking Status Distribution</h2>
            <p className="text-sm text-slate-600">Overview of all booking statuses</p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200/60">
                <CheckCircle className="h-8 w-8 text-emerald-600 mb-3" />
                <div className="text-2xl font-bold text-slate-900 mb-1">{completedBookingsCount}</div>
                <div className="text-sm text-slate-600">Completed</div>
                <div className="text-xs text-emerald-600 font-semibold mt-2">
                  {totalBookings > 0 ? ((completedBookingsCount / totalBookings) * 100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200/60">
                <Clock className="h-8 w-8 text-amber-600 mb-3" />
                <div className="text-2xl font-bold text-slate-900 mb-1">{pendingBookings}</div>
                <div className="text-sm text-slate-600">Pending</div>
                <div className="text-xs text-amber-600 font-semibold mt-2">
                  {totalBookings > 0 ? ((pendingBookings / totalBookings) * 100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200/60">
                <XCircle className="h-8 w-8 text-red-600 mb-3" />
                <div className="text-2xl font-bold text-slate-900 mb-1">{cancelledBookings}</div>
                <div className="text-sm text-slate-600">Cancelled</div>
                <div className="text-xs text-red-600 font-semibold mt-2">
                  {totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/60">
                <BarChart3 className="h-8 w-8 text-blue-600 mb-3" />
                <div className="text-2xl font-bold text-slate-900 mb-1">{totalBookings}</div>
                <div className="text-sm text-slate-600">Total</div>
                <div className="text-xs text-blue-600 font-semibold mt-2">100%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Settings Tab Content
  const renderSettings = () => {
    const [editMode, setEditMode] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState<any>({});

    const handleEditClick = (section: string) => {
      setEditMode(section);
      if (section === 'basic') {
        setFormData({
          name: salon?.name || '',
          description: salon?.description || '',
          phone: salon?.phone || '',
          email: salon?.email || '',
        });
      } else if (section === 'location') {
        setFormData({
          address: salon?.address || '',
          province: salon?.province || '',
          district: salon?.district || '',
          sector: salon?.sector || '',
        });
      } else if (section === 'hours') {
        setFormData(salon?.workingHours || {});
      }
    };

    const handleSave = async (section: string) => {
      try {
        let updateData = {};
        
        if (section === 'basic') {
          updateData = {
            name: formData.name,
            description: formData.description,
            phone: formData.phone,
            email: formData.email,
          };
        } else if (section === 'location') {
          updateData = {
            address: formData.address,
            province: formData.province,
            district: formData.district,
            sector: formData.sector,
          };
        } else if (section === 'hours') {
          updateData = {
            workingHours: formData,
          };
        }

        await salonService.updateSalon(user?.salonId!, updateData);
        toast.success('Settings updated successfully!');
        setEditMode(null);
        queryClient.invalidateQueries({ queryKey: ['owner-salon'] });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update settings');
      }
    };

    const handleCancel = () => {
      setEditMode(null);
      setFormData({});
    };

    const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        toast.loading('Uploading images...');
        await salonService.uploadGallery(user?.salonId!, files);
        toast.dismiss();
        toast.success('Images uploaded successfully!');
        queryClient.invalidateQueries({ queryKey: ['owner-salon'] });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.response?.data?.message || 'Failed to upload images');
      }
    };

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Basic Information</h2>
                <p className="text-sm text-slate-600">Update your salon's basic details</p>
              </div>
              {editMode !== 'basic' && (
                <button
                  onClick={() => handleEditClick('basic')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-6 lg:p-8">
            {editMode === 'basic' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salon Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleSave('basic')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Building2 className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Salon Name</div>
                    <div className="text-lg font-semibold text-slate-900">{salon?.name}</div>
                  </div>
                </div>
                {salon?.description && (
                  <div className="flex items-start space-x-4">
                    <ImageIcon className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Description</div>
                      <div className="text-slate-900">{salon.description}</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Phone</div>
                      <div className="text-slate-900">{salon?.phone || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Email</div>
                      <div className="text-slate-900">{salon?.email || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-emerald-50 to-teal-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Location</h2>
                <p className="text-sm text-slate-600">Manage your salon's address and location</p>
              </div>
              {editMode !== 'location' && (
                <button
                  onClick={() => handleEditClick('location')}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-6 lg:p-8">
            {editMode === 'location' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sector</label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleSave('location')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 transition-all font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Full Address</div>
                    <div className="text-slate-900">{salon?.address}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Province</div>
                    <div className="text-slate-900 font-semibold">{salon?.province}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">District</div>
                    <div className="text-slate-900 font-semibold">{salon?.district}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Sector</div>
                    <div className="text-slate-900 font-semibold">{salon?.sector || 'Not set'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Working Hours</h2>
                <p className="text-sm text-slate-600">Set your salon's operating hours</p>
              </div>
              {editMode !== 'hours' && (
                <button
                  onClick={() => handleEditClick('hours')}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-6 lg:p-8">
            {editMode === 'hours' ? (
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={!formData[day]?.closed}
                          onChange={(e) => setFormData({
                            ...formData,
                            [day]: { ...formData[day], closed: !e.target.checked }
                          })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="font-semibold text-slate-900 capitalize">{day}</span>
                      </div>
                      {!formData[day]?.closed && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="time"
                            value={formData[day]?.open || '08:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              [day]: { ...formData[day], open: e.target.value }
                            })}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <span className="text-slate-500">to</span>
                          <input
                            type="time"
                            value={formData[day]?.close || '18:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              [day]: { ...formData[day], close: e.target.value }
                            })}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      {formData[day]?.closed && (
                        <span className="text-red-600 font-semibold">Closed</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleSave('hours')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-slate-900 capitalize w-28">{day}</span>
                    </div>
                    {salon?.workingHours?.[day]?.closed ? (
                      <span className="text-red-600 font-semibold">Closed</span>
                    ) : (
                      <span className="text-slate-700 font-medium">
                        {salon?.workingHours?.[day]?.open || '08:00'} - {salon?.workingHours?.[day]?.close || '18:00'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery & Media */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-amber-50 to-orange-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Gallery & Media</h2>
                <p className="text-sm text-slate-600">Manage your salon's photos and videos</p>
              </div>
              <label className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Add Media</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {salon?.gallery?.length > 0 ? (
                salon.gallery.map((image: string, index: number) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-500 transition-colors">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                        <Eye className="h-4 w-4 text-slate-700" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No images in gallery yet</p>
                  <label className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all font-semibold cursor-pointer">
                    <Plus className="h-5 w-5" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-indigo-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Business Settings</h2>
                <p className="text-sm text-slate-600">Configure booking and business preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Booking Settings */}
              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Auto-confirm Bookings</h3>
                  </div>
                  <p className="text-sm text-slate-600 ml-8">Automatically confirm new bookings without manual approval</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Advance Booking</h3>
                  </div>
                  <p className="text-sm text-slate-600 ml-8">Maximum days in advance customers can book</p>
                </div>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30" selected>30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertCircle className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Cancellation Policy</h3>
                  </div>
                  <p className="text-sm text-slate-600 ml-8">Minimum hours before appointment for free cancellation</p>
                </div>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="4">4 hours</option>
                  <option value="24" selected>24 hours</option>
                  <option value="48">48 hours</option>
                </select>
              </div>

              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">Walk-in Customers</h3>
                  </div>
                  <p className="text-sm text-slate-600 ml-8">Accept walk-in customers without appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gradient-to-br from-white via-white to-violet-50/50 rounded-2xl lg:rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200/60 bg-gradient-to-r from-violet-50 to-purple-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-slate-600">Manage how you receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">New Booking Notifications</h3>
                  <p className="text-sm text-slate-600">Get notified when a new booking is made</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Cancellation Notifications</h3>
                  <p className="text-sm text-slate-600">Get notified when a booking is cancelled</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Daily Summary</h3>
                  <p className="text-sm text-slate-600">Receive a daily summary of bookings and revenue</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Marketing Updates</h3>
                  <p className="text-sm text-slate-600">Receive tips and updates about growing your business</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 rounded-2xl lg:rounded-3xl border border-red-200/60 shadow-lg overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-red-200/60 bg-gradient-to-r from-red-50 to-red-100/30">
            <h2 className="text-xl lg:text-2xl font-bold text-red-900 mb-1">Danger Zone</h2>
            <p className="text-sm text-red-700">Irreversible and destructive actions</p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-red-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Deactivate Salon</h3>
                  <p className="text-sm text-slate-600">Temporarily disable your salon from accepting bookings</p>
                </div>
                <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-semibold whitespace-nowrap">
                  Deactivate
                </button>
              </div>
              <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-red-200">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Delete Salon</h3>
                  <p className="text-sm text-slate-600">Permanently delete your salon and all associated data</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold whitespace-nowrap">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'bookings':
        return renderBookings();
      case 'barbers':
        return renderBarbers();
      case 'services':
        return renderServices();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout
      title="Salon Owner"
      subtitle="Owner Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerActions={
        <div className="flex items-center space-x-2">
          <span className="hidden lg:inline-block text-sm text-slate-600">
            Managing: <span className="font-semibold text-slate-900">{salon?.name}</span>
          </span>
        </div>
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default DashboardOwner;