import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (phoneOrEmail: string, password: string) =>
    api.post('/auth/login', { phoneOrEmail, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (userData: any) =>
    api.patch('/auth/me', userData),
};

export const userService = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  
  updateUser: (id: string, userData: any) =>
    api.patch(`/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

export const salonService = {
  getSalons: (params?: any) =>
    api.get('/salons', { params }),
  
  getSalon: (id: string) =>
    api.get(`/salons/${id}`),
  
  createSalon: (salonData: any) => {
    const isFormData = salonData instanceof FormData;
    return api.post('/salons', salonData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },
  
  updateSalon: (id: string, salonData: any) =>
    api.patch(`/salons/${id}`, salonData),
  
  uploadGallery: (id: string, images: FileList) => {
    const formData = new FormData();
    Array.from(images).forEach((image) => {
      formData.append('images', image);
    });
    return api.post(`/salons/${id}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  addService: (id: string, serviceData: any) =>
    api.post(`/salons/${id}/services`, serviceData),
  
  addBarber: (id: string, barberData: any) =>
    api.post(`/salons/${id}/barbers`, barberData),
  
  // Enhanced staff management
  createStaffMember: (id: string, staffData: FormData) =>
    api.post(`/salons/${id}/staff`, staffData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getStaffMembers: (id: string) =>
    api.get(`/salons/${id}/staff`),
  
  updateStaffMember: (salonId: string, staffId: string, staffData: any) =>
    api.patch(`/salons/${salonId}/staff/${staffId}`, staffData),
  
  updateStaffServices: (salonId: string, staffId: string, services: string[]) =>
    api.patch(`/salons/${salonId}/staff/${staffId}/services`, { services }),
  
  deleteStaffMember: (salonId: string, staffId: string) =>
    api.delete(`/salons/${salonId}/staff/${staffId}`),
  
  getServices: (id: string) =>
    api.get(`/salons/${id}/services`),

  updateService: (salonId: string, serviceId: string, serviceData: any) =>
    api.patch(`/salons/${salonId}/services/${serviceId}`, serviceData),

  deleteService: (salonId: string, serviceId: string) =>
    api.delete(`/salons/${salonId}/services/${serviceId}`),

  getBarbers: (id: string) =>
    api.get(`/salons/${id}/barbers`),
};

export const bookingService = {
  createBooking: (bookingData: any) =>
    api.post('/bookings', bookingData),
  
  getBookings: (params?: any) =>
    api.get('/bookings', { params }),
  
  getBooking: (id: string) =>
    api.get(`/bookings/${id}`),
  
  updateBookingStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/bookings/${id}/status`, { status, notes }),
  
  cancelBooking: (id: string) =>
    api.patch(`/bookings/${id}/cancel`),
  
  getAvailableSlots: (barberId: string, date: string) =>
    api.get(`/bookings/availability/${barberId}`, { params: { date } }),
};

export const transactionService = {
  confirmAirtelPayment: (data: any) =>
    api.post('/transactions/airtel/confirm', data),
  
  recordManualPayment: (data: any) =>
    api.post('/transactions/manual', data),
  
  getTransactions: (params?: any) =>
    api.get('/transactions', { params }),
  
  getTransaction: (id: string) =>
    api.get(`/transactions/${id}`),
  
  getPaymentSummary: (bookingId: string) =>
    api.get(`/transactions/booking/${bookingId}/summary`),
};

export const availabilityService = {
  getAvailability: (barberId: string) =>
    api.get(`/availability/${barberId}`),
  
  updateAvailability: (barberId: string, availabilityData: any) =>
    api.put(`/availability/${barberId}`, availabilityData),
  
  blockSlots: (barberId: string, slots: string[]) =>
    api.post(`/availability/${barberId}/block`, { slots }),
  
  unblockSlots: (barberId: string, slots: string[]) =>
    api.post(`/availability/${barberId}/unblock`, { slots }),
};

export const notificationService = {
  getNotifications: (params?: any) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`),
  
  getNotificationCount: () =>
    api.get('/notifications/count'),
};

export const adminService = {
  getPendingSalons: (params?: any) =>
    api.get('/admin/salons/pending', { params }),
  
  getSalonDetails: (id: string) =>
    api.get(`/admin/salons/${id}/details`),
  
  verifySalon: (id: string, verified: boolean) =>
    api.patch(`/admin/salons/${id}/verify`, { verified }),

  createSalon: (salonData: FormData) =>
    api.post('/admin/salons', salonData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getReports: (params?: any) =>
    api.get('/admin/reports', { params }),
  
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  
  getAllUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  
  createAdmin: (userData: any) =>
    api.post('/admin/users', userData),
  
  createUser: (userData: any) =>
    api.post('/admin/users/create', userData),
  
  updateUser: (id: string, userData: any) =>
    api.patch(`/admin/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  
  getComprehensiveStats: () =>
    api.get('/admin/stats/comprehensive'),
  
  getActivities: (params?: any) =>
    api.get('/admin/activities', { params }),
  
  getNotifications: (params?: any) =>
    api.get('/admin/notifications', { params }),

  getAllBookings: (params?: any) =>
    api.get('/admin/bookings', { params }),

  getBookingDetails: (bookingId: string) =>
    api.get(`/admin/bookings/${bookingId}`),

  updateBookingStatus: (bookingId: string, status: string) =>
    api.patch(`/admin/bookings/${bookingId}/status`, { status }),

  deleteBooking: (bookingId: string) =>
    api.delete(`/admin/bookings/${bookingId}`),

  // Staff management
  getAllStaff: (params?: any) =>
    api.get('/admin/staff', { params }),
  
  getStaffDetails: (staffId: string) =>
    api.get(`/admin/staff/${staffId}`),
  
  updateStaffMember: (staffId: string, staffData: FormData) =>
    api.patch(`/admin/staff/${staffId}`, staffData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateStaffSalon: (staffId: string, salonId: string) =>
    api.patch(`/admin/staff/${staffId}/salon`, { salonId }),
  
  deactivateStaff: (staffId: string) =>
    api.patch(`/admin/staff/${staffId}/deactivate`),
  
  activateStaff: (staffId: string) =>
    api.patch(`/admin/staff/${staffId}/activate`),
  
  updateStaffServices: (staffId: string, services: string[]) =>
    api.patch(`/admin/staff/${staffId}/services`, { services }),
  
  updateStaffProfilePhoto: (staffId: string, profilePhoto: FormData | string) => {
    // If profilePhoto is a string (URL), send as JSON
    if (typeof profilePhoto === 'string') {
      return api.patch(`/admin/users/${staffId}`, { profilePhoto }, {
        timeout: 120000, // 2 minute timeout for profile photo uploads
        onUploadProgress: (progressEvent) => {
          // Progress tracking can be implemented in the component if needed
          console.log('Upload progress:', progressEvent);
        },
      });
    }
    
    // If profilePhoto is FormData, send as multipart/form-data
    return api.patch(`/admin/users/${staffId}`, profilePhoto, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minute timeout for profile photo uploads
      onUploadProgress: (progressEvent) => {
        // Progress tracking can be implemented in the component if needed
        console.log('Upload progress:', progressEvent);
      },
    });
  },
  
  createStaffMember: (staffData: FormData) =>
    api.post('/admin/staff/create', staffData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Salon service management (admin only)
  addServiceToSalon: (salonId: string, serviceData: any) =>
    api.post(`/admin/salons/${salonId}/services`, serviceData),
  
  updateSalonService: (salonId: string, serviceId: string, serviceData: any) =>
    api.patch(`/admin/salons/${salonId}/services/${serviceId}`, serviceData),
  
  deleteSalonService: (salonId: string, serviceId: string) =>
    api.delete(`/admin/salons/${salonId}/services/${serviceId}`),

  // File upload to Uploadcare via backend
  uploadToUploadcare: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload/uploadcare', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minute timeout
    });
  },
};

export const superAdminService = {
  // Super Admin specific methods
  getStats: () =>
    api.get('/admin/superadmin/stats'),
  
  getSuperAdminStats: () =>
    api.get('/admin/superadmin/stats'),
  
  getAllUsers: (params?: any) =>
    api.get('/admin/superadmin/users', { params }),
  
  getUserDetails: (id: string) =>
    api.get(`/admin/superadmin/users/${id}`),
  
  createUser: (userData: any) =>
    api.post('/admin/superadmin/users', userData),
  
  updateUserById: (id: string, userData: any) =>
    api.patch(`/admin/superadmin/users/${id}`, userData),
  
  deleteUserById: (id: string) =>
    api.delete(`/admin/superadmin/users/${id}`),
  
  bulkUpdateUsers: (userIds: string[], updates: any) =>
    api.patch('/admin/superadmin/users/bulk', { userIds, updates }),
  
  getSystemActivities: (params?: any) =>
    api.get('/admin/superadmin/activities', { params }),
  
  getAllSalons: (params?: any) =>
    api.get('/admin/superadmin/salons', { params }),
  
  deleteSalon: (id: string) =>
    api.delete(`/admin/superadmin/salons/${id}`),
  
  updateSalon: (id: string, salonData: any) =>
    api.patch(`/admin/superadmin/salons/${id}`, salonData),
  
  createAdmin: (adminData: any) =>
    api.post('/admin/superadmin/create-admin', adminData),
};

export const walkInCustomerService = {
  createWalkIn: (walkInData: any) =>
    api.post('/walk-in-customers', walkInData),
  
  getWalkIns: (params?: any) =>
    api.get('/walk-in-customers', { params }),
  
  getWalkInById: (id: string) =>
    api.get(`/walk-in-customers/${id}`),
  
  updateWalkIn: (id: string, walkInData: any) =>
    api.patch(`/walk-in-customers/${id}`, walkInData),
  
  deleteWalkIn: (id: string) =>
    api.delete(`/walk-in-customers/${id}`),
  
  getSalonWalkIns: (params?: any) =>
    api.get('/walk-in-customers/salon/all', { params }),
};

export const staffEarningsService = {
  getEarnings: (params?: any) =>
    api.get('/staff-earnings', { params }),
  
  getEarningsSummary: (staffId: string, params?: any) =>
    api.get(`/staff-earnings/summary/${staffId}`, { params }),
  
  updateDailyEarnings: (staffId: string, date?: string) =>
    api.post(`/staff-earnings/update/${staffId}`, { date }),
  
  getSalonEarnings: (params?: any) =>
    api.get('/staff-earnings/salon/all', { params }),
};