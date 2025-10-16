import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
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
import DashboardBarber from './pages/DashboardBarber';
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if current route is a dashboard route
  const isDashboardRoute = location.pathname === '/admin' || 
                          location.pathname === '/superadmin' || 
                          location.pathname.startsWith('/dashboard/');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
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
          
          {/* Protected routes */}
          {user && (
            <>
              <Route path="/profile" element={<Profile />} />
              {user.role === 'barber' && (
                <Route path="/dashboard/barber" element={<DashboardBarber />} />
              )}
              {user.role === 'owner' && (
                <>
                  <Route path="/dashboard/owner" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/settings" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/bookings" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/barbers" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/services" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/analytics" element={<DashboardOwner />} />
                  <Route path="/dashboard/owner/tour" element={<OwnerTour />} />
                  <Route path="/dashboard/owner/create-salon" element={<CreateSalon />} />
                </>
              )}
              {user.role === 'admin' && (
                <Route path="/admin" element={<AdminPanel />} />
              )}
              {user.role === 'superadmin' && (
                <Route path="/superadmin" element={<SuperAdminDashboard />} />
              )}
            </>
          )}
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
