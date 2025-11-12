import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';

interface ReportsDashboardProps {
  reports: any;
  stats: any;
  analytics: any;
  onDownloadReport: () => void;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ 
  reports, 
  stats,
  analytics,
  onDownloadReport
}) => {
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('System Reports', 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Summary Stats
      doc.setFontSize(16);
      doc.text('Summary Statistics', 20, 45);
      
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Users', (reports.summary?.totalUsers || stats.totalUsers).toString()],
        ['Total Salons', (reports.summary?.totalSalons || stats.totalSalons).toString()],
        ['Total Bookings', (reports.summary?.totalBookings || stats.totalBookings).toString()],
        ['Total Revenue', `${(reports.summary?.totalRevenue || stats.revenue)?.toLocaleString() || 0} RWF`],
        ['Verified Salons', (reports.summary?.verifiedSalons || stats.verifiedSalons || 0).toString()],
        ['Pending Salons', (reports.summary?.pendingSalons || stats.pendingSalons || 0).toString()]
      ];
      
      autoTable(doc, {
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid'
      });
      
      // User Distribution
      if (reports.usersByRole && reports.usersByRole.length > 0) {
        doc.setFontSize(16);
        doc.text('User Distribution by Role', 20, (doc as any).lastAutoTable.finalY + 15);
        
        const userDistributionData = [
          ['Role', 'Count'],
          ...reports.usersByRole.map((item: any) => [item._id || 'Unknown', item.count.toString()])
        ];
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [userDistributionData[0]],
          body: userDistributionData.slice(1),
          theme: 'grid'
        });
      }
      
      // Staff Gender Distribution
      if (analytics.staffGenderDistribution && analytics.staffGenderDistribution.length > 0) {
        doc.setFontSize(16);
        doc.text('Staff Gender Distribution', 20, (doc as any).lastAutoTable.finalY + 15);
        
        const genderDistributionData = [
          ['Gender', 'Count'],
          ...analytics.staffGenderDistribution.map((item: any) => [item._id || 'Not specified', item.count.toString()])
        ];
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [genderDistributionData[0]],
          body: genderDistributionData.slice(1),
          theme: 'grid'
        });
      }
      
      // Booking Stats
      if (reports.bookingStats && reports.bookingStats.length > 0) {
        doc.setFontSize(16);
        doc.text('Booking Statistics', 20, (doc as any).lastAutoTable.finalY + 15);
        
        const bookingStatsData = [
          ['Status', 'Count'],
          ...reports.bookingStats.map((item: any) => [item._id || 'Unknown', item.count.toString()])
        ];
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [bookingStatsData[0]],
          body: bookingStatsData.slice(1),
          theme: 'grid'
        });
      }
      
      // Save the PDF
      doc.save(`admin-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to CSV if PDF fails
      onDownloadReport();
    }
  };

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-gradient-to-br from-white via-white to-purple-50/50 rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">System Reports</h3>
            <p className="text-gray-600 mt-1">Detailed analytics and insights</p>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            <span>Download Report as PDF</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalUsers || stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Salons</p>
                <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalSalons || stats.totalSalons}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{reports.summary?.totalBookings || stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{(reports.summary?.totalRevenue || stats.revenue)?.toLocaleString()} RWF</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            User Growth
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users (This Month)</span>
              <span className="font-semibold text-gray-900">{reports.userGrowth?.thisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-gray-900">{reports.userGrowth?.active || stats.users?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">+{reports.userGrowth?.growthRate || 15}%</span>
            </div>
          </div>
        </div>

        {/* Salon Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Salon Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Salons</span>
              <span className="font-semibold text-gray-900">{stats.verifiedSalons}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Verification</span>
              <span className="font-semibold text-yellow-600">{stats.pendingSalons}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Rating</span>
              <span className="font-semibold text-gray-900">{reports.salonPerformance?.avgRating || '4.5'} ⭐</span>
            </div>
          </div>
        </div>

        {/* Staff Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-pink-500" />
            Staff Gender Distribution
          </h4>
          <div className="space-y-3">
            {analytics.staffGenderDistribution && analytics.staffGenderDistribution.length > 0 ? (
              analytics.staffGenderDistribution.map((item: any) => (
                <div key={item._id || 'unknown'} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{item._id || 'Not specified'}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2">No data available</p>
            )}
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-500" />
            Booking Statistics
          </h4>
          <div className="space-y-3">
            {reports.bookingStats && reports.bookingStats.length > 0 ? (
              reports.bookingStats.map((item: any) => (
                <div key={item._id || 'unknown'} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{item._id || 'Unknown status'}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;