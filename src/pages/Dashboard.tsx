import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DonorDashboard from '../components/Dashboard/DonorDashboard';
import NGODashboard from '../components/Dashboard/NGODashboard';
import TransparencyDashboard from '../components/Dashboard/TransparencyDashboard';
import VendorDashboard from '../components/Dashboard/VendorDashboard';
import { Shield, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'donor':
        return (
          <div className="space-y-8">
            <TransparencyDashboard />
            <DonorDashboard />
          </div>
        );
      case 'ngo':
        return <NGODashboard />;
      case 'government':
        return <TransparencyDashboard />;
      case 'beneficiary':
        return <TransparencyDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Not Available</h2>
            <p className="text-gray-600">
              Dashboard for your role is not yet implemented.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;