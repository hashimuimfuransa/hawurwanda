import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffEarningsService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useTranslationStore } from '../stores/translationStore';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

interface EarningsSummaryProps {
  staffId?: string;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({ staffId }) => {
  const { user } = useAuthStore();
  const { language, t } = useTranslationStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const targetStaffId = staffId || user?.id;

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['staff-earnings-summary', targetStaffId, selectedPeriod],
    queryFn: () => staffEarningsService.getEarningsSummary(targetStaffId!, { period: selectedPeriod }),
    enabled: !!targetStaffId,
  });

  const summary = earningsData?.data?.summary;
  const earnings = earningsData?.data?.earnings || [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const periods = [
    { key: 'today', label: 'Today', icon: Zap },
    { key: 'week', label: 'Week', icon: Calendar },
    { key: 'month', label: 'Month', icon: BarChart3 },
    { key: 'year', label: 'Year', icon: Target }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Earnings Summary
                <Sparkles className="h-4 w-4 text-green-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your performance and earnings
              </p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedPeriod === period.key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <period.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{period.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {summary ? (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-100 text-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+12%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">{summary.totalEarnings.toLocaleString()} RWF</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-blue-100 text-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+8%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Commission</p>
                  <p className="text-2xl font-bold">{summary.totalCommission.toLocaleString()} RWF</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-100 text-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+15%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold">{summary.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-100 text-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Walk-ins</p>
                  <p className="text-2xl font-bold">{summary.totalWalkIns}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Average Daily</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {summary.averageDailyEarnings.toLocaleString()} RWF
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per day</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Payments</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {summary.paymentMethodBreakdown.cash.toLocaleString()} RWF
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {summary.paymentMethodBreakdown.cash > 0 
                  ? `${Math.round((summary.paymentMethodBreakdown.cash / (summary.paymentMethodBreakdown.cash + summary.paymentMethodBreakdown.airtel)) * 100)}% of total`
                  : '0% of total'
                }
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Airtel Payments</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {summary.paymentMethodBreakdown.airtel.toLocaleString()} RWF
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {summary.paymentMethodBreakdown.airtel > 0 
                  ? `${Math.round((summary.paymentMethodBreakdown.airtel / (summary.paymentMethodBreakdown.cash + summary.paymentMethodBreakdown.airtel)) * 100)}% of total`
                  : '0% of total'
                }
              </p>
            </div>
          </div>

          {/* Best Day */}
          {summary.bestDay && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-1">Best Day</p>
                    <p className="text-lg font-semibold mb-1">
                      {new Date(summary.bestDay.date).toLocaleDateString()}
                    </p>
                    <p className="text-3xl font-bold">{summary.bestDay.totalEarnings.toLocaleString()} RWF</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-100 text-sm">
                    <Activity className="h-4 w-4" />
                    <span>Peak Performance</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Breakdown */}
          {Object.keys(summary.serviceBreakdown).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Breakdown</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(summary.serviceBreakdown).map(([serviceId, service]: [string, any]) => (
                  <div key={serviceId} className="group bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-4 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {service.serviceName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{service.serviceName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{service.count} services completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{service.commission.toLocaleString()} RWF</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">commission earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No earnings data available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              No earnings data found for the selected period. Start providing services to see your earnings!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Activity className="h-4 w-4" />
              <span>Try selecting a different time period</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsSummary;
