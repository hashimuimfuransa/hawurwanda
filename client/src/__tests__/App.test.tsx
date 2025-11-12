import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock child components to isolate App component tests
jest.mock('../pages/Home', () => () => <div>Home Page</div>);
jest.mock('../pages/About', () => () => <div>About Page</div>);
jest.mock('../pages/Events', () => () => <div>Events Page</div>);
jest.mock('../pages/Contact', () => () => <div>Contact Page</div>);
jest.mock('../pages/Publications', () => () => <div>Publications Page</div>);
jest.mock('../pages/Programs', () => () => <div>Programs Page</div>);
jest.mock('../pages/SalonList', () => () => <div>Salon List Page</div>);
jest.mock('../pages/SalonPage', () => () => <div>Salon Page</div>);
jest.mock('../pages/BookingSelection', () => () => <div>Booking Selection Page</div>);
jest.mock('../pages/Booking', () => () => <div>Booking Page</div>);
jest.mock('../pages/Login', () => () => <div>Login Page</div>);
jest.mock('../pages/Register', () => () => <div>Register Page</div>);
jest.mock('../pages/Profile', () => () => <div>Profile Page</div>);
jest.mock('../pages/DashboardStaff', () => () => <div>Staff Dashboard</div>);
jest.mock('../pages/DashboardOwner', () => () => <div>Owner Dashboard</div>);
jest.mock('../pages/AdminPanel', () => () => <div>Admin Panel</div>);
jest.mock('../pages/SuperAdminDashboard', () => () => <div>Super Admin Dashboard</div>);
jest.mock('../pages/OwnerTour', () => () => <div>Owner Tour</div>);
jest.mock('../pages/CreateSalon', () => () => <div>Create Salon</div>);

// Mock the auth store
jest.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock the AuthGuard and RoleGuard components
jest.mock('../components/AuthGuard', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);
jest.mock('../components/RoleGuard', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <App />
      </BrowserRouter>
    );
  });
});