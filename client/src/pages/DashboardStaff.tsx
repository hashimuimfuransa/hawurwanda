import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { bookingService, availabilityService, notificationService, walkInCustomerService, staffEarningsService, salonService } from '../services/api';
import BookingCard from '../components/BookingCard';
import WalkInCustomerForm from '../components/WalkInCustomerForm';
import WalkInCustomerList from '../components/WalkInCustomerList';
import StaffBookingManagement from '../components/StaffBookingManagement';
import StaffCustomerList from '../components/StaffCustomerList';
import EarningsSummary from '../components/EarningsSummary';
import StaffDashboardSummary from '../components/StaffDashboardSummary';
import StaffSidebar from '../components/StaffSidebar';
import StaffMainContent from '../components/StaffMainContent';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Settings,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Bell,
  BarChart3,
  UserPlus,
  ClipboardList,
  AlertCircle,
  QrCode,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardStaff: React.FC = () => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [staffQrDownloading, setStaffQrDownloading] = useState(false);
  const staffFrontCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const staffBackCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // Get staff's bookings (including pending ones)
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['staff-bookings', user?.id],
    queryFn: () => bookingService.getBookings({}), // Backend automatically filters by user role
    enabled: !!user && !!user.id,
  });


  // Get availability
  useQuery({
    queryKey: ['staff-availability', user?.id],
    queryFn: () => availabilityService.getAvailability(user!.id),
    enabled: !!user && !!user.id,
  });

  // Get salon information
  const { data: salon } = useQuery({
    queryKey: ['salon', user?.salonId],
    queryFn: () => salonService.getSalon(user!.salonId),
    enabled: !!user && !!user.salonId,
  });

  const salonData = React.useMemo(() => salon?.data?.salon || salon?.data, [salon]);

  const staffProfileUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    if (user?._id) return `${origin}/staff/${user._id}`;
    return origin;
  }, [user?._id]);

  const staffQrUrl = React.useMemo(() => {
    if (!staffProfileUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(staffProfileUrl)}`;
  }, [staffProfileUrl]);

  const downloadQrImage = React.useCallback(async (url: string, filename: string, setLoading: (value: boolean) => void) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error('REQUEST_FAILED');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('QR code downloaded');
    } catch (_error) {
      toast.error('Unable to download QR code');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadImage = React.useCallback((src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      if (!src) {
        reject(new Error('EMPTY'));
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('LOAD_ERROR'));
      img.src = src;
    });
  }, []);

  const getImage = React.useCallback(async (src?: string | null) => {
    if (!src) return null;
    try {
      return await loadImage(src);
    } catch (_error) {
      return null;
    }
  }, [loadImage]);

  const drawWrappedText = React.useCallback(
    (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      if (!text) return;
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      words.forEach((word, index) => {
        const testLine = line ? `${line} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, x, currentY, maxWidth);
          line = word;
          currentY += lineHeight;
        } else {
          line = testLine;
        }
        if (index === words.length - 1) {
          ctx.fillText(line, x, currentY, maxWidth);
        }
      });
    },
    []
  );

  const drawRoundedRect = React.useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    },
    []
  );

  const handleDownloadCanvas = React.useCallback((canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Card downloaded');
    } catch (_error) {
      toast.error('Unable to download card');
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    let raf: number | null = null;

    const draw = async () => {
      const frontCanvas = staffFrontCanvasRef.current;
      const backCanvas = staffBackCanvasRef.current;
      if (!frontCanvas || !backCanvas) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      const width = 460;
      const height = 300;
      const ratio = window.devicePixelRatio || 1;
      const frontCtx = frontCanvas.getContext('2d');
      const backCtx = backCanvas.getContext('2d');
      if (!frontCtx || !backCtx) return;
      const [profileImage, salonLogo, qrImage] = await Promise.all([
        getImage(user?.profilePhoto),
        getImage(salonData?.logo),
        getImage(staffQrUrl),
      ]);
      if (cancelled) return;
      const shortUrl = staffProfileUrl ? staffProfileUrl.replace(/^https?:\/\//, '') : '';

      frontCanvas.width = width * ratio;
      frontCanvas.height = height * ratio;
      frontCanvas.style.width = '100%';
      frontCanvas.style.maxWidth = '30rem';
      frontCanvas.style.height = 'auto';
      frontCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      frontCtx.clearRect(0, 0, width, height);

      const frontGradient = frontCtx.createLinearGradient(0, 0, width, height);
      frontGradient.addColorStop(0, '#020617');
      frontGradient.addColorStop(0.55, '#1d4ed8');
      frontGradient.addColorStop(1, '#7c3aed');
      frontCtx.fillStyle = frontGradient;
      frontCtx.fillRect(0, 0, width, height);

      frontCtx.fillStyle = 'rgba(255,255,255,0.12)';
      frontCtx.beginPath();
      frontCtx.ellipse(width * 0.84, height * 0.24, 150, 90, 0.4, 0, Math.PI * 2);
      frontCtx.fill();
      frontCtx.beginPath();
      frontCtx.ellipse(width * 0.28, height * 0.82, 130, 75, -0.5, 0, Math.PI * 2);
      frontCtx.fill();

      frontCtx.fillStyle = '#ffffff';
      frontCtx.textAlign = 'left';
      frontCtx.textBaseline = 'alphabetic';
      frontCtx.font = '600 32px "Poppins","Helvetica",sans-serif';
      frontCtx.fillText(user?.name || 'Staff Member', 36, 96, width - 220);
      frontCtx.font = '500 18px "Poppins","Helvetica",sans-serif';
      frontCtx.fillText(user?.role?.replace(/_/g, ' ').toUpperCase() || 'ROLE', 36, 132, width - 240);
      frontCtx.fillStyle = 'rgba(226,232,240,0.82)';
      frontCtx.font = '400 16px "Poppins","Helvetica",sans-serif';
      drawWrappedText(frontCtx, salonData?.tagline || 'Dedicated to enhancing your signature style.', 36, 170, width - 240, 22);

      const avatarX = width - 132;
      const avatarY = 112;
      frontCtx.save();
      frontCtx.beginPath();
      frontCtx.arc(avatarX, avatarY, 62, 0, Math.PI * 2);
      frontCtx.fillStyle = 'rgba(255,255,255,0.24)';
      frontCtx.fill();
      frontCtx.restore();
      frontCtx.save();
      frontCtx.beginPath();
      frontCtx.arc(avatarX, avatarY, 54, 0, Math.PI * 2);
      frontCtx.closePath();
      frontCtx.clip();
      if (profileImage) {
        frontCtx.drawImage(profileImage, avatarX - 54, avatarY - 54, 108, 108);
      } else {
        frontCtx.fillStyle = '#1d4ed8';
        frontCtx.fillRect(avatarX - 54, avatarY - 54, 108, 108);
        frontCtx.fillStyle = '#ffffff';
        frontCtx.font = '700 44px "Poppins","Helvetica",sans-serif';
        frontCtx.textAlign = 'center';
        frontCtx.textBaseline = 'middle';
        frontCtx.fillText(user?.name?.charAt(0).toUpperCase() || 'S', avatarX, avatarY);
        frontCtx.textAlign = 'left';
        frontCtx.textBaseline = 'alphabetic';
      }
      frontCtx.restore();

      frontCtx.fillStyle = 'rgba(15,23,42,0.42)';
      drawRoundedRect(frontCtx, 36, height - 96, width - 72, 60, 18);
      frontCtx.fill();
      frontCtx.fillStyle = '#ffffff';
      frontCtx.font = '600 16px "Poppins","Helvetica",sans-serif';
      frontCtx.fillText('Salon', 56, height - 62, width - 112);
      frontCtx.font = '500 16px "Poppins","Helvetica",sans-serif';
      drawWrappedText(frontCtx, salonData?.name || 'Hawu Rwanda Salon', 56, height - 36, width - 112, 22);

      backCanvas.width = width * ratio;
      backCanvas.height = height * ratio;
      backCanvas.style.width = '100%';
      backCanvas.style.maxWidth = '30rem';
      backCanvas.style.height = 'auto';
      backCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      backCtx.clearRect(0, 0, width, height);

      const backGradient = backCtx.createLinearGradient(0, 0, width, height);
      backGradient.addColorStop(0, '#f9fafb');
      backGradient.addColorStop(1, '#e8edff');
      backCtx.fillStyle = backGradient;
      backCtx.fillRect(0, 0, width, height);

      backCtx.fillStyle = 'rgba(99,102,241,0.12)';
      backCtx.beginPath();
      backCtx.ellipse(width * 0.24, height * 0.22, 120, 72, 0.2, 0, Math.PI * 2);
      backCtx.fill();
      backCtx.beginPath();
      backCtx.ellipse(width * 0.78, height * 0.86, 130, 84, -0.45, 0, Math.PI * 2);
      backCtx.fill();

      const headerHeight = 92;
      backCtx.fillStyle = '#1f2937';
      backCtx.font = '700 26px "Poppins","Helvetica",sans-serif';
      backCtx.textAlign = 'left';
      backCtx.fillText(user?.name || 'Staff Member', 36, 60, width - 72);
      backCtx.fillStyle = '#475569';
      backCtx.font = '500 16px "Poppins","Helvetica",sans-serif';
      backCtx.fillText(user?.role ? user.role.replace(/_/g, ' ').toUpperCase() : 'ROLE', 36, 88, width - 72);

      if (salonLogo) {
        const logoSize = 80;
        backCtx.save();
        drawRoundedRect(backCtx, width - logoSize - 36, 36, logoSize, logoSize, 18);
        backCtx.clip();
        backCtx.drawImage(salonLogo, width - logoSize - 36, 36, logoSize, logoSize);
        backCtx.restore();
      } else if (salonData?.name) {
        backCtx.fillStyle = 'rgba(148,163,184,0.4)';
        drawRoundedRect(backCtx, width - 140, 36, 104, 60, 16);
        backCtx.fill();
        backCtx.fillStyle = '#1f2937';
        backCtx.font = '600 16px "Poppins","Helvetica",sans-serif';
        backCtx.textAlign = 'center';
        backCtx.textBaseline = 'middle';
        backCtx.fillText(salonData.name.slice(0, 12), width - 140 + 52, 66);
        backCtx.textAlign = 'left';
        backCtx.textBaseline = 'alphabetic';
      }

      const qrSize = 148;
      const qrX = width - qrSize - 48;
      const qrY = headerHeight + 24;
      if (qrImage) {
        backCtx.save();
        backCtx.shadowColor = 'rgba(15,23,42,0.22)';
        backCtx.shadowBlur = 24;
        backCtx.shadowOffsetY = 12;
        backCtx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
        backCtx.restore();
      } else {
        backCtx.fillStyle = 'rgba(255,255,255,0.7)';
        backCtx.fillRect(qrX, qrY, qrSize, qrSize);
        backCtx.strokeStyle = 'rgba(148,163,184,0.8)';
        backCtx.lineWidth = 2;
        backCtx.strokeRect(qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
        backCtx.fillStyle = 'rgba(51,65,85,0.8)';
        backCtx.font = '600 16px "Poppins","Helvetica",sans-serif';
        backCtx.textAlign = 'center';
        backCtx.textBaseline = 'middle';
        backCtx.fillText('QR unavailable', qrX + qrSize / 2, qrY + qrSize / 2);
        backCtx.textAlign = 'left';
        backCtx.textBaseline = 'alphabetic';
      }

      backCtx.textAlign = 'center';
      backCtx.fillStyle = '#1f2937';
      backCtx.font = '600 14px "Poppins","Helvetica",sans-serif';
      backCtx.fillText('Scan to view profile &', qrX + qrSize / 2, qrY + qrSize + 18, width - 72);
      backCtx.fillText('book appointments', qrX + qrSize / 2, qrY + qrSize + 36, width - 72);
      backCtx.textAlign = 'left';

      let infoY = headerHeight + 36;
      const infoWidth = qrX - 48;
      backCtx.fillStyle = '#1f2937';
      backCtx.font = '500 15px "Poppins","Helvetica",sans-serif';
      if (user.phone) {
        backCtx.fillText(`Phone: ${user.phone}`, 36, infoY, infoWidth);
        infoY += 28;
      }
      if (user.email) {
        backCtx.fillText(`Email: ${user.email}`, 36, infoY, infoWidth);
        infoY += 28;
      }
      if (salonData?.name) {
        backCtx.fillText(`Salon: ${salonData.name}`, 36, infoY, infoWidth);
        infoY += 28;
      }
      if (shortUrl) {
        backCtx.fillStyle = '#4338ca';
        backCtx.font = '600 15px "Poppins","Helvetica",sans-serif';
        backCtx.fillText(shortUrl, 36, infoY, infoWidth);
      }
    };
    draw();

    return () => {
      cancelled = true;
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [drawRoundedRect, drawWrappedText, getImage, salonData?.logo, salonData?.name, salonData?.tagline, staffProfileUrl, staffQrUrl, user?.email, user?.name, user?.phone, user?.profilePhoto, user?.role]);

  // Get notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['staff-notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
  });

  // Get notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['staff-notification-count'],
    queryFn: () => notificationService.getNotificationCount(),
    enabled: !!user,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) =>
      bookingService.updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      toast.success('Booking status updated!');
      queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['staff-earnings-today'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    },
  });

  // Block/unblock slots mutation
  const blockSlotsMutation = useMutation({
    mutationFn: ({ slots, action }: { slots: string[]; action: 'block' | 'unblock' }) => {
      if (action === 'block') {
        return availabilityService.blockSlots(user!._id, slots);
      } else {
        return availabilityService.unblockSlots(user!._id, slots);
      }
    },
    onSuccess: () => {
      toast.success('Availability updated!');
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Notification mutations
  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notification-count'] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notification-count'] });
    },
  });

  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    await updateBookingMutation.mutateAsync({ bookingId, status });
  };

  const handlePaymentRecord = async (bookingId: string) => {
    toast('Payment recording feature coming soon!');
  };

  const handleBlockSlot = (slot: string) => {
    blockSlotsMutation.mutate({ slots: [slot], action: 'block' });
  };

  const handleUnblockSlot = (slot: string) => {
    blockSlotsMutation.mutate({ slots: [slot], action: 'unblock' });
  };

  if (!user || !['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(user.role)) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-600">Access denied. Staff members only.</p>
          </div>
        </div>
      </div>
    );
  }

  const allBookings = bookings?.data?.data?.bookings || [];
  
  // Debug logging
  console.log('Staff Dashboard - User:', user);
  console.log('Staff Dashboard - Bookings response:', bookings);
  console.log('Staff Dashboard - All bookings:', allBookings);
  
  const todayBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  });

  const upcomingBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.timeSlot);
    const now = new Date();
    return bookingDate > now && booking.status !== 'completed' && booking.status !== 'cancelled';
  });

  const completedBookings = allBookings.filter((booking: any) => 
    booking.status === 'completed'
  );

  const pendingBookings = allBookings.filter((booking: any) => 
    booking.status === 'pending'
  );

  const totalEarnings = completedBookings.reduce((sum: number, booking: any) => 
    sum + booking.amountTotal, 0
  );

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Today's Summary */}
      <StaffDashboardSummary />

      {/* Loading State */}
      {bookingsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {bookingsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">Error loading bookings: {bookingsError.message}</p>
        </div>
      )}

      {/* Today's Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
            Today's Bookings
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          {todayBookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">No bookings for today</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You have {allBookings.length} total bookings</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {todayBookings.map((booking: any) => (
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

      {/* Upcoming Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 sm:mr-3" />
            Upcoming Bookings
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">No upcoming bookings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Check back later for new appointments</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {upcomingBookings.slice(0, 5).map((booking: any) => (
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

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2 sm:mr-3" />
              Pending Bookings
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {pendingBookings.map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onStatusChange={handleBookingStatusChange}
                  onPaymentRecord={handlePaymentRecord}
                  userRole={user.role}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );

  const renderDigitalCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
        <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
        Digital Profile Card
      </h2>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl text-white p-5 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider">Staff Member</p>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-xs text-blue-200 capitalize">{user.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-inner">
            {staffQrUrl ? (
              <img src={staffQrUrl} alt="Staff QR" className="w-full rounded-xl bg-white" />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">QR unavailable</div>
            )}
          </div>
          <button
            onClick={() => staffQrUrl && downloadQrImage(staffQrUrl, 'staff-profile-qr.png', setStaffQrDownloading)}
            disabled={!staffQrUrl || staffQrDownloading}
            className="mt-5 inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {staffQrDownloading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mr-3" />
            ) : (
              <Download className="h-5 w-5 mr-3" />
            )}
            Download QR Code
          </button>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleDownloadCanvas(staffFrontCanvasRef.current, 'staff-card-front.png')}
              className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Front
            </button>
            <button
              type="button"
              onClick={() => handleDownloadCanvas(staffBackCanvasRef.current, 'staff-card-back.png')}
              className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Back
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 p-5 shadow-inner">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Card Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl overflow-hidden shadow-lg bg-white p-4 flex justify-center">
              <div className="relative w-full max-w-[30rem] mx-auto">
                <canvas ref={staffFrontCanvasRef} className="w-full h-auto" />
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-lg bg-white p-4 flex justify-center">
              <div className="relative w-full max-w-[30rem] mx-auto">
                <canvas ref={staffBackCanvasRef} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <StaffBookingManagement />
  );

  const renderWalkIns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Walk-in Customers</h2>
        <button
          onClick={() => setShowWalkInForm(true)}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Walk-in Customer
        </button>
      </div>
      <WalkInCustomerList />
    </div>
  );

  const renderCustomers = () => (
    <StaffCustomerList />
  );

  const renderEarnings = () => (
    <EarningsSummary />
  );

  const renderSchedule = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Manage Schedule</h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Schedule management coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            You'll be able to block/unblock time slots and manage your availability.
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {notificationsData?.data?.notifications?.filter((n: any) => !n.read).length > 0 && (
            <button
              onClick={() => markAllNotificationsReadMutation.mutate()}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {notificationsData?.data?.notifications?.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-2">
              You'll receive notifications about bookings, payments, and updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificationsData?.data?.notifications?.map((notification: any) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border-l-4 ${
                  !notification.read ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                } cursor-pointer hover:shadow-md transition-all duration-200`}
                onClick={() => !notification.read && markNotificationReadMutation.mutate(notification._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.payload.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.payload.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Staff Settings</h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Settings panel coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            You'll be able to update your profile, services, and preferences.
          </p>
        </div>
      </div>
    </div>
  );

  const getCurrentView = () => {
    const path = window.location.pathname;
    if (path.includes('/bookings')) return renderBookings();
    if (path.includes('/walkins')) return renderWalkIns();
    if (path.includes('/customers')) return renderCustomers();
    if (path.includes('/earnings')) return renderEarnings();
    if (path.includes('/schedule')) return renderSchedule();
    if (path.includes('/digital-card')) return renderDigitalCard();
    if (path.includes('/notifications')) return renderNotifications();
    if (path.includes('/settings')) return renderSettings();
    return renderOverview();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} salon={salon?.data} />
      
      {/* Main Content */}
      <StaffMainContent 
        onMenuClick={() => setSidebarOpen(true)}
        title="Staff Dashboard"
        subtitle={`Welcome back, ${user.name}!`}
        salon={salon?.data}
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {getCurrentView()}
        </div>
      </StaffMainContent>

      {/* Walk-in Customer Form Modal */}
      {showWalkInForm && (
        <WalkInCustomerForm onClose={() => setShowWalkInForm(false)} />
      )}
    </div>
  );
};

export default DashboardStaff;