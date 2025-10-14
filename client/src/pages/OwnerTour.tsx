import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle2, CalendarDays, Users, BarChart3, ArrowLeft, Rocket } from 'lucide-react';

const OwnerTour: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/owner/create-salon');
  };

  const handleGoBack = () => {
    navigate('/dashboard/owner');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-4">
            <Video className="h-4 w-4 mr-2" />
            Owner Dashboard Tour
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Learn how to get the most out of your salon dashboard
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Follow the guided steps below and watch the overview video to understand everything you can do with your digital salon hub.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium shadow-sm hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to dashboard
            </button>
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Get started now
            </button>
          </div>
        </header>

        {/* Video Section */}
        <section className="bg-white rounded-3xl shadow-lg shadow-blue-500/10 border border-slate-200/60 overflow-hidden mb-12">
          <div className="relative aspect-video w-full bg-slate-900">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Owner Dashboard Tour"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Watch the quick overview</h2>
              <p className="text-sm text-slate-500 mt-2">
                Get a 2-minute walkthrough of the key sections you can manage as a salon owner.
              </p>
            </div>
            <button
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              <Video className="h-5 w-5 mr-2" />
              Open in YouTube
            </button>
          </div>
        </section>

        {/* Step-by-step Guide */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Step-by-step setup guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold mr-3">01</span>
                <h3 className="text-lg font-semibold text-slate-900">Create your salon profile</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Add your logo, cover photo, location, opening hours, and a brief description to represent your brand.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Upload branding assets</li>
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Pin your salon on the map</li>
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Share your story and specialties</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold mr-3">02</span>
                <h3 className="text-lg font-semibold text-slate-900">Publish your services</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Organize services into categories, define durations and pricing, and highlight special add-ons.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Create categories and bundles</li>
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Set availability windows</li>
                <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" /> Showcase premium packages</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold mr-3">03</span>
                <h3 className="text-lg font-semibold text-slate-900">Streamline bookings</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Use the booking calendar to monitor appointments, approve requests, and automate reminders.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center"><CalendarDays className="h-4 w-4 text-emerald-500 mr-2" /> Sync shifts and availability</li>
                <li className="flex items-center"><CalendarDays className="h-4 w-4 text-emerald-500 mr-2" /> Send confirmation messages</li>
                <li className="flex items-center"><CalendarDays className="h-4 w-4 text-emerald-500 mr-2" /> Track walk-ins vs. online bookings</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold mr-3">04</span>
                <h3 className="text-lg font-semibold text-slate-900">Grow your team</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Invite barbers and managers, assign permissions, and track performance from one dashboard.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center"><Users className="h-4 w-4 text-emerald-500 mr-2" /> Send secure invitations</li>
                <li className="flex items-center"><Users className="h-4 w-4 text-emerald-500 mr-2" /> Assign manageable roles</li>
                <li className="flex items-center"><Users className="h-4 w-4 text-emerald-500 mr-2" /> Monitor individual productivity</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold mr-3">05</span>
                <h3 className="text-lg font-semibold text-slate-900">Track your growth</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Review analytics across revenue, customer retention, and service performance to spot opportunities.
              </p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center"><BarChart3 className="h-4 w-4 text-emerald-500 mr-2" /> Monitor revenue by service</li>
                <li className="flex items-center"><BarChart3 className="h-4 w-4 text-emerald-500 mr-2" /> Stay on top of client loyalty</li>
                <li className="flex items-center"><BarChart3 className="h-4 w-4 text-emerald-500 mr-2" /> Identify peak times</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OwnerTour;