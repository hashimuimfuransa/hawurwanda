import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTranslationStore } from '../stores/translationStore';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Scissors,
  Sparkles,
  ArrowRight,
  Users,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface LoginForm {
  phoneOrEmail: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { language, t } = useTranslationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.phoneOrEmail, data.password);
      toast.success('Login successful!');
      const { user } = useAuthStore.getState();
      const from = location.state?.from;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
        return;
      }
      const roleDashboardMap: Record<string, string> = {
        client: '/profile',
        barber: '/dashboard/staff',
        hairstylist: '/dashboard/staff',
        nail_technician: '/dashboard/staff',
        massage_therapist: '/dashboard/staff',
        esthetician: '/dashboard/staff',
        receptionist: '/dashboard/staff',
        manager: '/dashboard/staff',
        owner: '/dashboard/owner',
        admin: '/admin',
        superadmin: '/superadmin'
      };
      const redirectPath = roleDashboardMap[user?.role || ''] || '/profile';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const highlights = [
    { id: 'members', value: '8K+', label: 'Active members' },
    { id: 'partners', value: '120+', label: 'Partner salons' },
    { id: 'events', value: '50+', label: 'Annual events' }
  ];

  const essentials = [
    {
      id: 'community',
      title: 'Community-first',
      description: 'Connect with creatives shaping Rwanda’s beauty industry.',
      icon: Users
    },
    {
      id: 'security',
      title: 'Secure access',
      description: 'Enterprise-grade protection keeps your data safe and private.',
      icon: ShieldCheck
    },
    {
      id: 'growth',
      title: 'Grow faster',
      description: 'Unlock exclusive programs, mentors, and business insights.',
      icon: TrendingUp
    },
    {
      id: 'support',
      title: 'Always-on support',
      description: 'Our team is here 24/7 to answer questions and guide you.',
      icon: Sparkles
    }
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950"></div>
        <div className="absolute left-[10%] top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl"></div>
        <div className="absolute right-[5%] top-40 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px]"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M40 0l40 80H0z'/%3E%3C/g%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 space-y-10 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 shadow-lg shadow-emerald-500/10 backdrop-blur dark:bg-slate-900/70 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              HAWU Collective
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-slate-100">
                {t('loginTitle')}
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl dark:text-slate-300">
                {t('loginSubtitle')}
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
              <div className="grid gap-6 sm:grid-cols-2">
                {essentials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 -translate-x-5 translate-y-6 rounded-3xl bg-gradient-to-br from-emerald-400/25 via-sky-400/25 to-purple-500/25 blur-3xl"></div>
            <div className="relative rounded-3xl border border-white/40 bg-white/90 p-10 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/85">
              <div className="mb-10 space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-sky-500 to-purple-600 shadow-lg shadow-emerald-500/40">
                  <Scissors className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Join 8000+ members
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('loginTitle')}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('loginSubtitle')}</p>
                </div>
              </div>
              <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="phoneOrEmail" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('phoneOrEmail')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('phoneOrEmail', {
                        required: 'Phone or email is required',
                      })}
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                  {errors.phoneOrEmail && (
                    <p className="mt-2 flex items-center text-sm text-red-500">
                      <span className="mr-1">⚠️</span>
                      {errors.phoneOrEmail.message}
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
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your password"
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
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:from-emerald-600 hover:via-sky-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
                  >
                    Create one now
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
