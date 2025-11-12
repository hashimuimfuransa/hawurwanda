import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  Activity,
  Star
} from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: any;
  stats: any;
  bookings: any;
  onRefresh: () => void;
  onExport: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  analytics, 
  stats, 
  bookings,
  onRefresh,
  onExport
}) => {
  // Booking trends chart data
  const bookingTrendsData = [
    { name: 'Jan', bookings: 65, completed: 45 },
    { name: 'Feb', bookings: 59, completed: 50 },
    { name: 'Mar', bookings: 80, completed: 65 },
    { name: 'Apr', bookings: 81, completed: 70 },
    { name: 'May', bookings: 56, completed: 45 },
    { name: 'Jun', bookings: 55, completed: 50 },
    { name: 'Jul', bookings: 40, completed: 35 },
    { name: 'Aug', bookings: 60, completed: 50 },
    { name: 'Sep', bookings: 70, completed: 60 },
    { name: 'Oct', bookings: 75, completed: 65 },
    { name: 'Nov', bookings: 80, completed: 70 },
    { name: 'Dec', bookings: 85, completed: 75 }
  ];

  // Revenue distribution chart data
  const revenueDistributionData = [
    { name: 'Haircuts', value: 300 },
    { name: 'Coloring', value: 150 },
    { name: 'Styling', value: 100 },
    { name: 'Beard', value: 75 },
    { name: 'Packages', value: 50 }
  ];

  // Staff gender distribution data
  const staffGenderData = [
    { 
      name: 'Male', 
      value: analytics.staffGenderDistribution?.find((item: any) => item._id === 'male')?.count || 0,
      color: '#3b82f6'
    },
    { 
      name: 'Female', 
      value: analytics.staffGenderDistribution?.find((item: any) => item._id === 'female')?.count || 0,
      color: '#ec4899'
    },
    { 
      name: 'Other/Not specified', 
      value: analytics.staffGenderDistribution?.find((item: any) => !item._id)?.count || 0,
      color: '#9333ea'
    }
  ];

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
            <p className="text-gray-600 mt-1">Comprehensive insights and metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={onExport}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(analytics.totalRevenue || stats.revenue)?.toLocaleString() || 0} RWF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Bookings</p>
                <p className="text-2xl font-bold text-green-900">
                  {analytics.totalBookings || stats.totalBookings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Salons</p>
                <p className="text-2xl font-bold text-purple-900">
                  {analytics.activeSalons || stats.verifiedSalons || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-orange-900">
                  {analytics.satisfaction || '4.8'}/5.0
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+0.2 from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Booking Trends</h4>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Revenue by Service</h4>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Gender Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Staff Gender Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {analytics.staffGenderDistribution ? (
            analytics.staffGenderDistribution.map((item: any) => (
              <div key={item._id || 'unknown'} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {item.count}
                </div>
                <div className="text-sm text-gray-600 mt-1 capitalize">
                  {item._id || 'Not specified'}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-gray-500">
              Loading gender distribution...
            </div>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffGenderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Staff Count">
                {staffGenderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length > 0 ? Math.round((stats.completedBookings / bookings.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length > 0 ? Math.round((bookings.filter((b: any) => b.status === 'cancelled').length / bookings.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Cancellation Rate</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length > 0 ? Math.round(stats.revenue / bookings.length) : 0} RWF
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg. Booking Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;