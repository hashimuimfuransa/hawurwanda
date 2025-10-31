import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  ShieldCheck,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'barber' | 'hairstylist' | 'nail_technician' | 'massage_therapist' | 'esthetician' | 'receptionist' | 'manager' | 'owner';
}

const Register: React.FC = () => {
  const { register: registerUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const highlights = [
    { id: 'members', value: '8K+', label: 'Active members' },
    { id: 'partners', value: '120+', label: 'Partner salons' },
    { id: 'districts', value: '30', label: 'Districts served' }
  ];

  const benefits = [
    {
      id: 'training',
      title: 'Professional training',
      description: 'Access workshops, certifications, and mentors tailored to your craft.',
      icon: CheckCircle
    },
    {
      id: 'community',
      title: 'Premium community',
      description: 'Connect with salon owners, creative leaders, and nationwide partners.',
      icon: Users
    },
    {
      id: 'support',
      title: 'All-round support',
      description: 'Unlock guidance on finance, legal matters, and wellbeing whenever you need it.',
      icon: ShieldCheck
    }
  ];

  const steps = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Share who you are, your contact details, and your professional focus.'
    },
    {
      id: 'choose',
      title: 'Choose your role',
      description: 'Select the membership that matches how you contribute to the industry.'
    },
    {
      id: 'launch',
      title: 'Activate your account',
      description: 'Start exploring programs, events, and tailored growth opportunities.'
    }
  ];

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast.success('Registration successful!');
      if (data.role === 'owner') {
        navigate('/dashboard/owner');
      } else if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(data.role)) {
        navigate('/dashboard/staff');
      } else if (data.role === 'client') {
        navigate('/salons');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950"></div>
        <div className="absolute left-[15%] top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl"></div>
        <div className="absolute right-[10%] top-36 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl"></div>
        <div className="absolute bottom-[-8rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-purple-500/20 blur-[140px]"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M40 0l40 80H0z'/%3E%3C/g%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="order-2 space-y-10 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 shadow-lg shadow-emerald-500/10 backdrop-blur dark:bg-slate-900/70 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              HAWU Collective
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-slate-100">
                Build your future with HAWU
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl dark:text-slate-300">
                Join Rwanda’s vibrant network of stylists, barbers, therapists, and beauty entrepreneurs. Unlock mentorship, resources, and opportunities designed for your next leap.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/50 bg-white/75 px-6 py-5 text-center shadow-xl shadow-emerald-500/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">
                Why join HAWU
              </h3>
              <div className="mt-6 grid gap-6">
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">
                How registration works
              </h3>
              <div className="mt-6 space-y-5">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-inner shadow-emerald-500/20 dark:text-emerald-200">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{index + 1}. {step.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 -translate-x-5 translate-y-6 rounded-3xl bg-gradient-to-br from-emerald-400/25 via-sky-400/25 to-purple-500/25 blur-3xl"></div>
            <div className="relative rounded-3xl border border-white/40 bg-white/90 p-10 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/85">
              <div className="mb-10 space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-sky-500 to-purple-600 shadow-lg shadow-emerald-500/40">
                  <Scissors className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Create your account
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Register to unlock member benefits</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fill in your details to access tailored programs, events, and exclusive partner perks.</p>
                </div>
              </div>
              <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      })}
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: 'Please enter a valid email',
                        },
                      })}
                      type="email"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^(\+250|250|0)?[0-9]{9}$/,
                          message: 'Please enter a valid Rwandan phone number',
                        },
                      })}
                      type="tel"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your phone number (+250...)"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Account type
                  </label>
                  <select
                    {...register('role', { required: 'Please select an account type' })}
                    defaultValue=""
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 px-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="" disabled>Select account type</option>
                    <option value="client">Client · Book appointments</option>
                    <option value="barber">Barber · Offer grooming services</option>
                    <option value="hairstylist">Hair Stylist · Craft signature looks</option>
                    <option value="nail_technician">Nail Technician · Elevate nail artistry</option>
                    <option value="massage_therapist">Massage Therapist · Deliver wellness care</option>
                    <option value="esthetician">Esthetician · Lead skincare journeys</option>
                    <option value="receptionist">Receptionist · Orchestrate the salon experience</option>
                    <option value="manager">Manager · Drive daily operations</option>
                    <option value="owner">Salon Owner · Build and scale your brand</option>
                  </select>
                  {errors.role && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.role.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:from-emerald-600 hover:via-sky-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    By continuing you agree to uphold HAWU community standards and professional guidelines.
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
