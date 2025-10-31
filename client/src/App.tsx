import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Publications from './pages/Publications';
import Programs from './pages/Programs';
import SalonList from './pages/SalonList';
import SalonPage from './pages/SalonPage';
import BookingSelection from './pages/BookingSelection';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import DashboardStaff from './pages/DashboardStaff';
import DashboardOwner from './pages/DashboardOwner';
import AdminPanel from './pages/AdminPanel';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerTour from './pages/OwnerTour';
import CreateSalon from './pages/CreateSalon';

function App() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  // Check if current route is a dashboard route
  const isDashboardRoute = location.pathname === '/admin' || 
                          location.pathname === '/superadmin' || 
                          location.pathname.startsWith('/dashboard/');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/salons" element={<SalonList />} />
          <Route path="/salons/:id" element={<SalonPage />} />
          <Route path="/booking" element={<BookingSelection />} />
          <Route path="/booking/:salonId" element={<Booking />} />
          <Route path="/booking/:salonId/:barberId/:serviceId" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/profile" element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          } />
          
          {/* Staff Dashboard Routes */}
          <Route path="/dashboard/staff" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/bookings" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/customers" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/walkins" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/earnings" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/schedule" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/digital-card" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/notifications" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          <Route path="/dashboard/staff/settings" element={
            <AuthGuard requiredRoles={['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager']}>
              <DashboardStaff />
            </AuthGuard>
          } />
          
          {/* Owner Dashboard Routes */}
          <Route path="/dashboard/owner" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/settings" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/bookings" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/barbers" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/services" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/analytics" element={
            <AuthGuard requiredRoles={['owner']}>
              <DashboardOwner />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/tour" element={
            <AuthGuard requiredRoles={['owner']}>
              <OwnerTour />
            </AuthGuard>
          } />
          <Route path="/dashboard/owner/create-salon" element={
            <AuthGuard requiredRoles={['owner']}>
              <CreateSalon />
            </AuthGuard>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AuthGuard requiredRoles={['admin']}>
              <AdminPanel />
            </AuthGuard>
          } />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin" element={
            <AuthGuard requiredRoles={['superadmin']}>
              <SuperAdminDashboard />
            </AuthGuard>
          } />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
